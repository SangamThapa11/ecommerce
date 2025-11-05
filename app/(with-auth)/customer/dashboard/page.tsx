import BannerSlider from '@/components/banner/BannerSlider';
import bannerSvc from '@/lib/banner.service';
import { Metadata } from "next"
import AuthHomePageCategoryList from "@/components/auth-category/HomePageList";
import catSvc from '@/lib/category';
import AuthForYouSection from '../../ForYou/page';


// SEO is only for SSR
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
    // const banners = await bannerSvc.getActiveBanners();
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
            
             <div className="w-full mb-10">
                <AuthForYouSection products={featuredProducts} />
            </div>
            
            {/* Home Page Categories */}
            <div className="w-full mb-10">
                <AuthHomePageCategoryList />
            </div>
        </div> 
    )
}

export default CustomerDashboard  