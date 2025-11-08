import axiosConfig, { AxiosSuccessResponse } from "@/config/axios.config";

export interface IBanner {
  _id: string;
  title: string;
  url: string;
  image: {
    publicId: string;
    imageUrl: string;
    thumbUrl: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

class BannerService {
  async getActiveBanners(): Promise<IBanner[]> {
    try {
      // Perform GET request using axiosConfig
      const response: AxiosSuccessResponse = await axiosConfig.get(
        "/banner/for-home"
      );

      const result = response.data;

      if (!result?.data || !Array.isArray(result.data)) {
        console.error("Invalid banner response format:", result);
        throw new Error("Invalid banner data structure");
      }

      // Filter active banners with image
      const activeBanners = result.data.filter(
        (banner: any) =>
          banner?.status === "active" && banner?.image?.imageUrl
      );

      return activeBanners;
    } catch (error: any) {
      console.error("Error fetching banners:", error);

      if (error.response?.data) {
        throw new Error(
          error.response.data.message ||
            error.response.data.error ||
            "Failed to fetch banners"
        );
      } else if (error.request) {
        throw new Error("Network error: Unable to connect to server");
      } else {
        throw new Error(error.message || "Failed to fetch banners");
      }
    }
  }
}

const bannerSvc = new BannerService();
export default bannerSvc;
