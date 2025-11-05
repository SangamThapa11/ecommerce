import axiosConfig from "@/config/axios.config";

export interface IOrder {
  _id: string;
  code: string;
  buyer: {
    _id: string;
    name: string;
    email: string;
    address?: string;
    phone?: string;
  };
  items: Array<{
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
  }>;
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

export interface ICheckoutResponse {
  data: IOrder;
  message: string;
  status: string;
  options: any;
}

export interface IOrdersResponse {
  data: IOrder[];
  message: string;
  status: string;
  options: {
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

export interface IKhaltiResponse {
  data: {
    pidx: string;
    payment_url: string;
    expires_at: string;
    expires_in: number;
  };
  message: string;
  status: string;
  options: any;
}

class OrderService {
  async checkout(cartIds: string[]): Promise<ICheckoutResponse> {
    try {
      const response = await axiosConfig.post('/order', {
        cartIds
      });

      return response.data;
    } catch (exception: any) {
      console.error('Checkout error:', exception);
      
      if (exception.response?.data) {
        const errorData = exception.response.data;
        throw new Error(errorData.message || errorData.error || 'Checkout failed');
      } else if (exception.request) {
        throw new Error('Network error: Unable to connect to server');
      } else {
        throw new Error(exception.message || 'Checkout failed');
      }
    }
  }

  async getAllOrders(page: number = 1, limit: number = 20, status?: string, search?: string): Promise<IOrdersResponse> {
    try {
      let url = `/order?page=${page}&limit=${limit}`;
      
      if (status) {
        url += `&status=${status}`;
      }
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await axiosConfig.get(url);
      return response.data;
    } catch (exception: any) {
      console.error('Get orders error:', exception);
      
      if (exception.response?.data) {
        const errorData = exception.response.data;
        throw new Error(errorData.message || errorData.error || 'Failed to fetch orders');
      } else if (exception.request) {
        throw new Error('Network error: Unable to connect to server');
      } else {
        throw new Error(exception.message || 'Failed to fetch orders');
      }
    }
  }

  async initiateKhaltiPayment(orderCode: string): Promise<IKhaltiResponse> {
    try {
      const response = await axiosConfig.get(`/order/${orderCode}`);
      return response.data;
    } catch (exception: any) {
      console.error('Khalti payment initiation error:', exception);
      
      if (exception.response?.data) {
        const errorData = exception.response.data;
        throw new Error(errorData.message || errorData.error || 'Payment initiation failed');
      } else if (exception.request) {
        throw new Error('Network error: Unable to connect to server');
      } else {
        throw new Error(exception.message || 'Payment initiation failed');
      }
    }
  }

  async createTransaction(orderCode: string, transactionData: any): Promise<any> {
    try {
      const response = await axiosConfig.post(`/order/${orderCode}`, transactionData);
      return response.data;
    } catch (exception: any) {
      console.error('Create transaction error:', exception);
      
      if (exception.response?.data) {
        const errorData = exception.response.data;
        throw new Error(errorData.message || errorData.error || 'Transaction failed');
      } else if (exception.request) {
        throw new Error('Network error: Unable to connect to server');
      } else {
        throw new Error(exception.message || 'Transaction failed');
      }
    }
  }
}

const orderSvc = new OrderService();
export default orderSvc;