import BannerSlider from '@/components/banner/BannerSlider';
import bannerSvc from '@/lib/banner.service';
import { Metadata } from "next"
import AuthHomePageCategoryList from "@/components/auth-category/HomePageList";
import catSvc from '@/lib/category';
import ForYouPage from '../../ForYou/page';

export const generateMetadata = async (): Promise<Metadata> => {
    return {
        title: "Customer Dashboard || Ecommerce",
        description: "This is E-Pasal customer dashboard. One of the most famous e-commerce site in Nepal",
        openGraph: {
            title: "Customer Dashboard || Ecommerce",
            description: "This is E-Pasal customer dashboard. One of the most famous e-commerce site in Nepal",
            type: "website",
            images: [{url:""}]
        }
    }
}

const CustomerDashboard = async () => {
    const [banners, featuredProducts] = await Promise.all([
        bannerSvc.getActiveBanners(),
        catSvc.getFeaturedProducts(6)
    ]);
    
    return (
        <div className="bg-purple-300 max-w-screen-xl mx-auto px-8 text-justify">
            {/* Banner Section */}
            <div className="w-full mb-10">
                <BannerSlider banners={banners} />
            </div>
            
            {/* For You Section - without props since it fetches its own data */}
            <div className="w-full mb-10">
                <ForYouPage />
            </div>
            
            {/* Home Page Categories */}
            <div className="w-full mb-10">
                <AuthHomePageCategoryList />
            </div>
        </div> 
    )
}

export default CustomerDashboard
