"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isAuthenticated, redirectToLogin } from '@/lib/auth';
import axiosConfig from '@/config/axios.config';

interface OrderItem {
  _id: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    price: number;
    afterDiscount: number;
    discount: number;
    images?: Array<{ imageUrl: string }>;
    image?: string;
  };
  quantity: number;
  price: number;
  subTotal: number;
  deliveryCharge: number;
  total: number;
  status: string;
}

interface Order {
  _id: string;
  code: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  grossTotal: number;
  grossDelivaryTotal: number;
  discount: number;
  subTotal: number;
  tax: number;
  total: number;
  status: 'PENDING' | 'VERIFIED' | 'CANCELLED' | 'COMPLETED' | 'DELIVERED';
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
}

interface KhaltiResponse {
  pidx: string;
  payment_url: string;
  expires_at: string;
  expires_in: number;
}

const formatPrice = (price: number): string => {
  return price?.toLocaleString('en-NP') || '0';
};

const getProductImage = (item: OrderItem): string => {
  if (item?.product?.images?.[0]?.imageUrl) {
    return item.product.images[0].imageUrl;
  }
  if (item?.product?.image) {
    return item.product.image;
  }
  return "/placeholder-product.jpg";
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'VERIFIED':
    case 'COMPLETED':
    case 'DELIVERED':
      return 'bg-green-100 text-green-800 border border-green-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border border-red-200';
    case 'PENDING':
    default:
      return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  }
};

const getStatusText = (status: string): string => {
  switch (status) {
    case 'PENDING':
      return 'Pending Payment';
    case 'VERIFIED':
      return 'Payment Verified';
    case 'COMPLETED':
      return 'Completed';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [processingPayment, setProcessingPayment] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      if (!isAuthenticated()) {
        redirectToLogin();
        return;
      }

      setLoading(true);
      setError('');

      console.log('🔄 Fetching orders...');

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await axiosConfig.get('/order');
      console.log('✅ Raw API response:', response);

      // Handle different response formats
      let ordersData: Order[] = [];

      if (Array.isArray(response)) {
        // Case 1: API returns array directly
        ordersData = response;
      } else if (Array.isArray(response.data)) {
        // Case 2: API returns { data: array }
        ordersData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        // Case 3: API returns { data: { data: array } }
        ordersData = response.data.data;
      } else {
        console.warn('⚠️ Unexpected response structure:', response);
        throw new Error('Unexpected API response format');
      }

      console.log('📦 Processed orders:', ordersData);
      setOrders(ordersData);

      // Debug each order
      ordersData.forEach((order, index) => {
        console.log(`🎯 Order ${index + 1}:`, {
          code: order.code,
          status: order.status,
          isPaid: order.isPaid,
          total: order.total,
          showPaymentButton: order.status === 'PENDING' && !order.isPaid
        });
      });

    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);

      if (error?.response?.status === 429) {
        setError('Too many requests. Please wait a moment and try again.');
      } else if (error?.code === 401 || error?.response?.status === 401) {
        console.error('🔐 Token is invalid or expired');
        localStorage.removeItem('token_43');
        redirectToLogin();
        return;
      } else {
        const errorMessage = error?.message || 'Failed to load orders. Please try again.';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (orderCode: string) => {
  try {
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }

    setProcessingPayment(orderCode);
    console.log('💰 Initiating Khalti payment for order:', orderCode);

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));

    // Specify success and failure URLs
    const successUrl = `${window.location.origin}/success`;

    const response = await axiosConfig.get(`/order/${orderCode}`, {
      params: {
        success_url: successUrl,
      }
    });

    console.log('✅ Khalti payment response:', response);

    let paymentUrl: string | null = null;

    // Handle different response formats for Khalti
    if (response?.data?.payment_url) {
      paymentUrl = response.data.payment_url;
    } else if (response?.data?.data?.payment_url) {
      paymentUrl = response.data.data.payment_url;
    }

    if (paymentUrl) {
      console.log('🔗 Redirecting to Khalti:', paymentUrl);
      window.location.href = paymentUrl;
    } else {
      throw new Error('No payment URL received from Khalti');
    }
  } catch (error: any) {
    console.error('❌ Payment initiation failed:', error);

    if (error?.response?.status === 429) {
      alert('Too many payment requests. Please wait a moment and try again.');
    } else {
      const errorMessage = error?.message || 'Failed to initiate payment';
      alert(`Payment Error: ${errorMessage}`);
    }

    // Refresh orders to get latest status
    fetchOrders();
  } finally {
    setProcessingPayment(null);
  }
};

  // Add retry with exponential backoff
  const retryWithBackoff = async (fn: () => Promise<any>, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        if (error?.response?.status === 429 && i < retries - 1) {
          const delay = Math.pow(2, i) * 1000;
          console.log(`⏳ Rate limited, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
  };

  useEffect(() => {
    const checkPaymentReturn = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const pidx = urlParams.get('pidx');
      const txnId = urlParams.get('txnId');
      const status = urlParams.get('status');

      // If we have successful payment parameters, redirect to success page
      if (pidx || txnId) {
        console.log('🔄 Returning from Khalti payment, checking status...');

        // Extract order code from URL or use the first pending order
        const purchaseOrderId = urlParams.get('purchase_order_id');

        if (purchaseOrderId) {
          console.log('✅ Payment successful, redirecting to success page');
          // Redirect to success page with all parameters
          window.location.href = `/success?${urlParams.toString()}`;
        } else {
          // If no order ID, try to get it from orders
          const pendingOrder = orders.find(order => order.status === 'PENDING' && !order.isPaid);
          if (pendingOrder) {
            window.location.href = `/success?${urlParams.toString()}&purchase_order_id=${pendingOrder.code}`;
          }
        }
      }
    };

    checkPaymentReturn();
  }, [orders]);

  const checkPaymentStatus = async (orderCode: string) => {
    try {
      console.log('🔍 Checking payment status for order:', orderCode);

      const response = await axiosConfig.get(`/order/${orderCode}/status`);
      return response.data;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  };

  useEffect(() => {
    const loadOrders = async () => {
      await retryWithBackoff(fetchOrders);
    };
    loadOrders();
  }, []);


  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={fetchOrders}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Try Again
            </button>
            <Link
              href="/"
              className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
            <p className="text-gray-600 mt-2">View and manage your orders</p>
          </div>
          <Link
            href="/"
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Orders Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-blue-600">Total Orders:</span>
              <span className="ml-2 font-semibold">{orders.length}</span>
            </div>
            <div>
              <span className="text-blue-600">Pending:</span>
              <span className="ml-2 font-semibold">{orders.filter(o => o.status === 'PENDING').length}</span>
            </div>
            <div>
              <span className="text-blue-600">Unpaid:</span>
              <span className="ml-2 font-semibold">{orders.filter(o => !o.isPaid).length}</span>
            </div>
            <div>
              <span className="text-blue-600">Can Pay:</span>
              <span className="ml-2 font-semibold">{orders.filter(o => o.status === 'PENDING' && !o.isPaid).length}</span>
            </div>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Orders Yet</h2>
            <p className="text-gray-600 mb-8 max-w-sm mx-auto">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 rounded-lg font-medium transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              // Enhanced payment button logic with better debugging
              const showPaymentButton =
                (order.status?.toUpperCase() === 'PENDING') &&
                (!order.isPaid);

              console.log(` Payment Check for ${order.code}:`, {
                status: order.status,
                isPaid: order.isPaid,
                showPaymentButton: showPaymentButton,
                total: order.total
              });

              return (
                <div key={order._id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  {/* Order Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-5 border-b border-gray-200">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                          <h2 className="text-xl font-bold text-gray-900">Order #{order.code}</h2>
                          <div className="flex gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </span>
                            {!order.isPaid && (
                              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800 border border-red-200">
                                UNPAID
                              </span>
                            )}
                            {/* Debug badge - shows when payment button should appear */}
                            {showPaymentButton && (
                              <span className="px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800 border border-green-200">
                                CAN PAY
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Debug info - remove this in production */}
                        <div className="text-xs text-gray-500 mt-1">
                          Status: {order.status} | Paid: {order.isPaid?.toString()} | Show Pay: {showPaymentButton.toString()}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>Placed: {new Date(order.createdAt).toLocaleDateString('en-NP')}</span>
                          <span>Buyer: {order.buyer.name}</span>
                          <span>Items: {order.items.length}</span>
                        </div>
                      </div>

                      {/* Payment Button */}
                      {showPaymentButton && (
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => initiatePayment(order.code)}
                            disabled={processingPayment === order.code}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                          >
                            {processingPayment === order.code ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                Processing...
                              </>
                            ) : (
                              <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 15.07c-2.25 0-4.22-1.21-5.31-3.01l1.47-1.47c.63.98 1.72 1.57 2.84 1.57s2.21-.59 2.84-1.57l1.47 1.47c-1.09 1.8-3.06 3.01-5.31 3.01z" />
                                </svg>
                                Pay with Khalti
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <div className="space-y-6">
                      {order.items.map((item, index) => (
                        <div key={item._id} className={`flex flex-col md:flex-row gap-6 ${index > 0 ? 'pt-6 border-t border-gray-100' : ''}`}>
                          {/* Product Image */}
                          <div className="flex-shrink-0 w-full md:w-32">
                            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                              <Image
                                src={getProductImage(item)}
                                alt={item.product?.name || "Product image"}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                priority
                              />
                            </div>
                          </div>

                          {/* Product Details */}
                          <div className="flex-1">
                            <div className="flex flex-col lg:flex-row lg:justify-between gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-lg mb-3">{item.product.name}</h3>

                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium">Quantity</p>
                                    <p className="font-semibold text-gray-900">{item.quantity}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium">Price</p>
                                    <p className="font-semibold text-teal-600">
                                      Rs. {formatPrice(item.price)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium">Delivery</p>
                                    <p className="font-semibold text-gray-900">
                                      Rs. {formatPrice(item.deliveryCharge)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-500 font-medium">Item Total</p>
                                    <p className="font-semibold text-gray-900">
                                      Rs. {formatPrice(item.total)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg mb-4">Order Summary</h4>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Gross Total:</span>
                              <span className="font-semibold">Rs. {formatPrice(order.grossTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Delivery Total:</span>
                              <span className="font-semibold">Rs. {formatPrice(order.grossDelivaryTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Discount:</span>
                              <span className="font-semibold text-red-600">- Rs. {formatPrice(order.discount)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-semibold">Rs. {formatPrice(order.subTotal)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                              <span className="text-gray-600">Tax (13%):</span>
                              <span className="font-semibold">Rs. {formatPrice(order.tax)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between">
                          <div className="text-right">
                            <div className="flex justify-between items-center text-2xl font-bold text-gray-900 py-4 border-t border-b border-gray-200">
                              <span>Grand Total:</span>
                              <span className="text-teal-600">
                                Rs. {formatPrice(order.total)}
                              </span>
                            </div>
                          </div>

                          {/* Additional Payment Button at Bottom */}
                          {showPaymentButton && (
                            <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-sm text-purple-800 text-center mb-3">
                                Complete your payment to confirm this order
                              </p>
                              <button
                                onClick={() => initiatePayment(order.code)}
                                disabled={processingPayment === order.code}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                              >
                                {processingPayment === order.code ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                    Processing Payment...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M12 2L4 5v6.09c0 5.05 3.41 9.76 8 10.91 4.59-1.15 8-5.86 8-10.91V5l-8-3zm0 15.07c-2.25 0-4.22-1.21-5.31-3.01l1.47-1.47c.63.98 1.72 1.57 2.84 1.57s2.21-.59 2.84-1.57l1.47 1.47c-1.09 1.8-3.06 3.01-5.31 3.01z" />
                                    </svg>
                                    Pay with Khalti - Rs. {formatPrice(order.total)}
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}