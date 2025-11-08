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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://e-pasal-backend-2hkb.onrender.com"; // fallback for local builds

class BannerService {
  async getActiveBanners(): Promise<IBanner[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/banner/for-home`, {
        cache: "no-store", // optional: avoid cached responses on SSR
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (!result.data || !Array.isArray(result.data)) {
        throw new Error("Invalid data format received from API");
      }

      return result.data.filter(
        (banner: any) => banner?.image?.imageUrl && banner.status === "active"
      );
    } catch (error) {
      console.error("Error fetching banners:", error);
      return [];
    }
  }
}

const bannerSvc = new BannerService();
export default bannerSvc;
