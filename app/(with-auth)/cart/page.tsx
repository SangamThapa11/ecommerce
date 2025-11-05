'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { isAuthenticated, redirectToLogin } from "@/lib/auth";
import cartSvc, { ICartItem, IProductImage } from "@/lib/cart";
import orderSvc from "@/lib/order.service";

const formatPrice = (price: number): string => {
  return price.toLocaleString();
};

const getProductImage = (item: ICartItem): string => {
  // Check if we have images array with at least one image
  if (item?.product?.images?.[0]?.imageUrl) {
    return item.product.images[0].imageUrl;
  }
  
  // Fallback to direct image field from backend
  if (item?.product?.image) {
    return item.product.image;
  }
  
  console.warn('No image found for product:', item?.product?.name);
  return "/placeholder-product.jpg";
};

const getProductName = (item: ICartItem): string => {
  return item?.product?.name || "Unknown Product";
};

const getProductSlug = (item: ICartItem): string => {
  return item?.product?.slug || "";
};

const getProductStock = (item: ICartItem): number => {
  return item?.product?.stock || 0;
};

const getProductPrice = (item: ICartItem): number => {
  return item?.product?.price || 0;
};

const getProductDiscount = (item: ICartItem): number => {
  return item?.product?.discount || 0;
};

const getProductAfterDiscount = (item: ICartItem): number => {
  return item?.product?.afterDiscount || item?.product?.price || 0;
};

const getProductId = (item: ICartItem): string => {
  return item?.product?._id || item?._id || '';
};

const isValidCartItem = (item: ICartItem): boolean => {
  return !!(item?.product?._id && item?.product?.name);
};

const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.target as HTMLImageElement;
  console.warn('Image failed to load:', target.src);
  target.src = "/placeholder-product.jpg";
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<ICartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<string | null>(null);
  const router = useRouter();

  // Load cart items from backend API
  const fetchCartItems = async () => {
    try {
      if (!isAuthenticated()) {
        console.warn('User not authenticated, skipping fetch.');
        redirectToLogin();
        return;
      }

      setLoading(true);
      console.log('🔄 Starting cart fetch...');

      const result = await cartSvc.getCartItems();

      if (Array.isArray(result.data)) {
        // Filter out invalid items and log warnings
        const validItems = result.data.filter(item => {
          const isValid = isValidCartItem(item);
          if (!isValid) {
            console.warn('❌ Invalid cart item found:', item);
          }
          return isValid;
        });

        console.log('✅ Valid cart items:', validItems.length);
        console.log('🖼️ Items with images:', validItems.filter(item =>
          (Array.isArray(item.product?.images) && item.product.images.length > 0) || Boolean(item.product?.image)
        ).length);
        
        setCartItems(validItems);
        cartSvc.setCurrentCartItems(validItems);
      } else {
        console.warn('❌ Unexpected cart data format:', result);
        setCartItems([]);
      }
    } catch (error: any) {
      console.error('❌ Fetch cart error:', error);
      if (!error.message?.includes('Network')) {
        alert(error.message || 'Failed to load cart items');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (!productId || newQuantity < 1 || !Number.isInteger(newQuantity)) {
      console.warn('Invalid quantity requested:', { productId, newQuantity });
      alert('Invalid quantity requested');
      return;
    }

    const item = cartItems.find(cartItem => getProductId(cartItem) === productId);
    if (!item) {
      console.error('Item not found for productId:', productId);
      alert('Item not found in cart');
      return;
    }

    if (newQuantity > getProductStock(item)) {
      alert(`Cannot add more than ${getProductStock(item)} items (available stock)`);
      return;
    }

    try {
      setUpdatingItem(productId);
      const validQuantity = Math.max(1, Math.floor(newQuantity));
      await cartSvc.updateCartItem(productId, validQuantity);
      await fetchCartItems();
    } catch (error: any) {
      console.error('Update quantity error:', error);
      if (error.message?.includes('quantity') && error.message?.includes('less than minimum')) {
        alert('Invalid quantity detected. Please refresh the page and try again.');
      } else {
        alert(error.message || 'Failed to update quantity');
      }
      await fetchCartItems();
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (productId: string) => {
    if (!productId) return;

    try {
      setUpdatingItem(productId);
      await cartSvc.removeFromCart(productId);
      await fetchCartItems();
    } catch (error: any) {
      console.error('Remove item error:', error);
      alert(error.message || 'Failed to remove item from cart');
    } finally {
      setUpdatingItem(null);
    }
  };

  const decreaseQuantity = (productId: string, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      if (window.confirm('Are you sure you want to remove this item from your cart?')) {
        removeItem(productId);
      }
      return;
    }

    const newQuantity = currentQuantity - 1;
    updateQuantity(productId, newQuantity);
  };

  const increaseQuantity = (productId: string, currentQuantity: number, maxStock: number) => {
    if (currentQuantity < 1) {
      console.error('Invalid current quantity:', currentQuantity);
      alert('Invalid item quantity. Please refresh the page.');
      return;
    }

    const newQuantity = currentQuantity + 1;
    if (newQuantity > maxStock) {
      alert(`Cannot add more than ${maxStock} items (available stock)`);
      return;
    }

    updateQuantity(productId, newQuantity);
  };

  const calculateSubtotal = (): number => {
    return cartItems.reduce((total, item) => total + (item.subTotal || 0), 0);
  };

  const calculateDeliveryTotal = (): number => {
    return cartItems.reduce((total, item) => total + (item.deliveryCharge || 0), 0);
  };

  const calculateTotal = (): number => {
    return cartItems.reduce((total, item) => total + (item.total || 0), 0);
  };

  const proceedToCheckout = async () => {
  if (cartItems.length === 0) {
    alert('Your cart is empty');
    return;
  }

  setIsProcessing(true);

  try {
    const hasInvalidItems = cartItems.some(item => {
      const productId = getProductId(item);
      const quantity = item.quantity || 0;
      const stock = getProductStock(item);

      return !productId || quantity < 1 || quantity > stock || !item.product;
    });

    if (hasInvalidItems) {
      alert('Some items in your cart are no longer available or have invalid quantities. Please update your cart.');
      await fetchCartItems();
      return;
    }

    // Extract cart IDs for checkout
    const cartIds = cartItems.map(item => item._id).filter(id => id);
    
    if (cartIds.length === 0) {
      throw new Error('No valid cart items found for checkout');
    }

    console.log('🛒 Proceeding to checkout with cart IDs:', cartIds);

    // Call checkout API
    const result = await orderSvc.checkout(cartIds);
    
    console.log('✅ Checkout successful:', result);

    // Redirect to orders page on success
    if (result.status === "ORDER_PLACED") {
      router.push("/orders");
    } else {
      throw new Error(result.message || 'Checkout completed but with unexpected status');
    }

  } catch (error: any) {
    console.error(' Checkout error:', error);
    
    // Handle specific error cases
    if (error.message?.includes('CART_NOT_FOUND')) {
      alert('Your cart items were not found. Please refresh and try again.');
      await fetchCartItems(); // Refresh cart
    } else if (error.message?.includes('Network error')) {
      alert('Network connection issue. Please check your internet and try again.');
    } else {
      alert(error.message || 'Failed to proceed with checkout. Please try again.');
    }
  } finally {
    setIsProcessing(false);
  }
};

  // Loading state
  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8 text-center">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
        </div>
        <p className="mt-4">Loading your cart...</p>
      </div>
    );
  }

  // Empty cart state
  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Link
            href="/"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Table Header */}
            <div className="hidden md:grid grid-cols-12 bg-gray-50 p-4 border-b">
              <div className="col-span-5 font-medium text-gray-600">Product</div>
              <div className="col-span-2 font-medium text-gray-600 text-center">Price</div>
              <div className="col-span-3 font-medium text-gray-600 text-center">Quantity</div>
              <div className="col-span-2 font-medium text-gray-600 text-right">Total</div>
            </div>

            {/* Cart Items List */}
            {cartItems.map((item) => {
              const productId = getProductId(item);
              const isUpdating = updatingItem === productId;
              const currentQuantity = item.quantity || 0;
              const maxStock = getProductStock(item);
              const canIncrease = currentQuantity < maxStock;
              const productImage = getProductImage(item);
              const productName = getProductName(item);
              const productSlug = getProductSlug(item);
              const productPrice = getProductAfterDiscount(item);

              console.log(`🎨 Rendering product: ${productName}`, {
                imageUrl: productImage,
                hasImages: item.product.images?.length,
                directImage: item.product.image
              });

              return (
                <div
                  key={item._id}
                  className="p-4 border-b last:border-b-0 flex flex-col md:grid md:grid-cols-12 gap-4"
                >
                  {/* Product Info */}
                  <div className="flex items-center col-span-5">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                      <Image
                        src={productImage}
                        alt={productName}
                        fill
                        className="object-cover"
                        sizes="80px"
                        onError={handleImageError}
                        priority={false}
                      />
                    </div>
                    <div className="ml-4">
                      <Link
                        href={`/product/${productSlug}/detail`}
                        className="font-medium hover:text-teal-600 line-clamp-2"
                      >
                        {productName}
                      </Link>
                      <p className="text-sm text-gray-500">Stock: {maxStock}</p>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to remove this item from your cart?')) {
                            removeItem(productId);
                          }
                        }}
                        disabled={isUpdating}
                        className="text-red-500 text-sm hover:underline mt-1 disabled:opacity-50"
                      >
                        {isUpdating ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center col-span-2 justify-center">
                    <div className="text-center">
                      {getProductDiscount(item) > 0 && (
                        <span className="text-gray-500 line-through text-sm block">
                          Rs. {formatPrice(getProductPrice(item))}
                        </span>
                      )}
                      <span className="text-teal-600 font-medium">
                        Rs. {formatPrice(productPrice)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center col-span-3 justify-center">
                    <div className="flex items-center border rounded-md">
                      <button
                        onClick={() => decreaseQuantity(productId, currentQuantity)}
                        disabled={currentQuantity <= 1 || isUpdating}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        -
                      </button>
                      <span className="px-4 py-1 border-x text-center min-w-12">
                        {isUpdating ? (
                          <div className="animate-spin h-4 w-4 border border-teal-600 border-t-transparent rounded-full mx-auto"></div>
                        ) : (
                          currentQuantity
                        )}
                      </span>
                      <button
                        onClick={() => increaseQuantity(productId, currentQuantity, maxStock)}
                        disabled={!canIncrease || isUpdating}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center col-span-2 justify-end">
                    <div className="text-right">
                      <span className="font-medium block">
                        Rs. {formatPrice(item.subTotal || 0)}
                      </span>
                      <span className="text-xs text-gray-500">
                        Delivery: Rs. {formatPrice(item.deliveryCharge || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex items-center text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Items ({cartItems.length})</span>
                <span>Rs. {formatPrice(calculateSubtotal())}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Charge</span>
                <span>Rs. {formatPrice(calculateDeliveryTotal())}</span>
              </div>

              <div className="border-t pt-4 flex justify-between font-bold text-lg">
                <span>Total Amount</span>
                <span className="text-teal-600">
                  Rs. {formatPrice(calculateTotal())}
                </span>
              </div>
            </div>

            <button
              onClick={proceedToCheckout}
              disabled={isProcessing || cartItems.length === 0}
              className={`w-full ${isProcessing || cartItems.length === 0
                  ? 'bg-teal-400 cursor-not-allowed'
                  : 'bg-teal-600 hover:bg-teal-700'
                } text-white py-3 rounded-lg font-medium mt-6 transition-colors disabled:opacity-50`}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                'Proceed to Checkout'
              )}
            </button>

            {cartItems.length > 0 && (
              <p className="text-xs text-gray-500 text-center mt-3">
                You have {cartItems.length} item(s) in your cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}