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
            const response = await fetch('http://localhost:9005/api/v1/banner/for-home');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.data || !Array.isArray(result.data)) {
                throw new Error('Invalid data format received from API');
            }
            
            // Validate each banner has required image data
            return result.data.filter((banner: any) => 
                banner?.image?.imageUrl && 
                banner.status === 'active'
            );
            
        } catch (error) {
            console.error("Error fetching banners:", error);
            return [];
        }
    }
}

const bannerSvc = new BannerService();
export default bannerSvc;