import axiosConfig, { AxiosSuccessResponse } from "@/config/axios.config";

export interface IProductImage {
  imageUrl: string;
  thumbUrl?: string;
  publicId?: string;
  _id?: string;
}

export interface IBackendProduct {
  _id: string;
  name: string;
  slug: string;
  afterDiscount: number;
  price: number;
  discount: number;
  images?: IProductImage[];
  image?: string; // Backend sends 'image' as string
  stock: number;
  seller?: {
    _id: string;
    name: string;
  };
  brand?: {
    _id: string;
    name: string;
    slug: string;
    logo: string;
  };
  category?: Array<{
    _id: string;
    name: string;
    slug: string;
    image: string;
  }>;
  status?: string;
  sku?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ICartItem {
  _id: string;
  buyer: string;
  order: string | null;
  product: IBackendProduct;
  quantity: number;
  price: number;
  subTotal: number;
  deliveryCharge: number;
  total: number;
  status: string;
  createdBy: string;
}

export interface ICartResponse {
  data: ICartItem[];
  message: string;
  status: string;
  options: {
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
    };
  };
}

// Interface for raw backend cart item
interface IBackendCartItem {
  _id: string;
  buyer: string;
  order: string | null;
  product: any; // Flexible type for backend product
  quantity: number;
  price: number;
  subTotal: number;
  deliveryCharge: number;
  total: number;
  status: string;
  createdBy: string;
}

class CartService {
  private currentCartItems: ICartItem[] = [];

  // Set current cart items for delta calculation
  setCurrentCartItems(items: ICartItem[]) {
    this.currentCartItems = items;
  }

  async addToCart(productId: string, quantity: number): Promise<ICartItem> {
    try {
      const response = await axiosConfig.post('/order-detail', {
        product: productId,
        quantity: quantity
      });

      const responseData = response.data;

      // Check if the response is the cart item directly
      if (responseData && responseData._id && responseData.product) {
        return this.processCartItem(responseData);
      }

      // Check if it's the expected structured response
      if (responseData.status === "ADD_TO_CART_SUCCESS" && responseData.data) {
        return this.processCartItem(responseData.data);
      }

      // If we get here, the response structure is unexpected
      throw new Error(responseData.message || 'Unexpected response format');

    } catch (exception: any) {
      console.error('Add to cart error:', exception);

      if (exception.response?.data) {
        const errorData = exception.response.data;
        throw new Error(errorData.message || errorData.error || 'Failed to add to cart');
      } else if (exception.request) {
        throw new Error('Network error: Unable to connect to server');
      } else {
        throw new Error(exception.message || 'Failed to add to cart');
      }
    }
  }

  async getCartItems(page: number = 1, limit: number = 50): Promise<ICartResponse> {
    try {
      const response: AxiosSuccessResponse = await axiosConfig.get(`/order-detail?page=${page}&limit=${limit}`);

      console.log('🔄 Raw cart API response:', response.data);

      // Handle backend response structure
      let itemsArray: IBackendCartItem[] = [];

      if (response && Array.isArray(response.data)) {
        itemsArray = response.data;
      } else if (Array.isArray(response)) {
        itemsArray = response;
      } else {
        console.warn('Unexpected response structure:', response);
        itemsArray = [];
      }

      console.log('📦 Processing cart items:', itemsArray.length);

      // Process the response to ensure data structure matches frontend
      const processedItems = itemsArray.map((item: IBackendCartItem) => this.processCartItem(item));

      // Debug processed images
      processedItems.forEach((item, index) => {
        console.log(`🖼️ Item ${index} processed images:`, item.product.images);
      });

      this.setCurrentCartItems(processedItems);

      return {
        data: processedItems,
        message: response.data?.message || 'Cart items fetched successfully',
        status: response.data?.status || 'success',
        options: response.data?.options || {
          pagination: {
            page,
            limit,
            totalCount: processedItems.length
          }
        }
      };

    } catch (exception: any) {
      console.error("Error fetching cart items:", exception);
      throw new Error(exception.error?.message || exception.message || 'Failed to fetch cart items');
    }
  }

  // Process cart item to handle backend data structure
  private processCartItem(item: IBackendCartItem): ICartItem {
    if (!item.product) {
      console.warn('Cart item missing product:', item);
      return item as ICartItem;
    }

    console.log('🔧 Processing cart item product:', {
      name: item.product.name,
      rawImage: item.product.image,
      rawImages: item.product.images
    });

    // Handle image conversion - backend sends 'image' as string
    let images: IProductImage[] = [];

    if (item.product.image && typeof item.product.image === 'string') {
      // Backend sends single image as string
      images = [{
        imageUrl: item.product.image,
        thumbUrl: item.product.image
      }];
    } else if (item.product.images && Array.isArray(item.product.images)) {
      // If backend sends images array, process it
      images = item.product.images.map((img: any) => {
        if (typeof img === 'string') {
          return {
            imageUrl: img,
            thumbUrl: img
          };
        }
        return {
          imageUrl: img.imageUrl || img.url || img.image || '',
          thumbUrl: img.thumbUrl || img.thumbnail || img.imageUrl || img.url || img.image || '',
          publicId: img.publicId,
          _id: img._id
        };
      }).filter((img: IProductImage) => img.imageUrl && img.imageUrl.trim() !== '');
    } else {
      // No images found
      console.warn('No images found for product:', item.product.name);
    }

    // Ensure other product fields match frontend structure
    const processedItem: ICartItem = {
      ...item,
      product: {
        ...item.product,
        images: images,
        afterDiscount: item.product.afterDiscount || item.product.price || 0,
        price: item.product.price || item.product.afterDiscount || 0,
        discount: item.product.discount || 0,
        stock: item.product.stock || 0
      }
    };

    console.log('✅ Processed item images:', processedItem.product.images);

    return processedItem;
  }

  async updateCartItem(productId: string, newQuantity: number): Promise<any> {
    try {
      const currentItem = this.currentCartItems.find(item => item.product._id === productId);
      const currentQuantity = currentItem?.quantity || 0;

      const quantityDelta = currentQuantity - newQuantity;

      if (quantityDelta === 0) return;

      const response = await axiosConfig.patch('/order-detail', {
        product: productId,
        quantity: quantityDelta,
      });

      return response.data;

    } catch (exception: any) {
      console.error('Update cart error:', exception.response?.data || exception);

      if (exception.response?.data) {
        throw new Error(exception.response.data.message || 'Validation failed');
      } else {
        throw new Error(exception.message || 'Update failed');
      }
    }
  }

  async removeFromCart(productId: string): Promise<any> {
    return this.updateCartItem(productId, 0);
  }
}

const cartSvc = new CartService();
export default cartSvc;
