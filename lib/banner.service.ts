import { AppConfig } from '@/config/config';
import { IImageType, Status } from '@/config/constants';

export interface IBanner {
  _id: string;
  title: string;
  url: string;
  image: IImageType;
  status: Status;
  createdAt?: string;
  updatedAt?: string;
}

export interface IApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

class BannerService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = (AppConfig.apiBaseUrl || '').replace(/\/$/, '');
  }

 getAllBannerList = async() => {
    try {
            const response = await fetch('http://localhost:9005/api/v1/banner', {
                method: "GET"
            })
            const result = await response.json();
            return result.data;
        }catch (exception) {
            throw exception;
        }
    }
}

const BanSvc = new BannerService();
export default BanSvc;
