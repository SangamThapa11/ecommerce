
import BannerSlider from '@/components/banner/BannerSlider';
import HomePageCategoryList from '@/components/category/HomePageList';
import ForYouSection from '@/components/product/ForYouSection';
import bannerSvc from '@/lib/banner.service';
import catSvc from '@/lib/category';


export default async function Home() {
    //const banners = await bannerSvc.getActiveBanners();
    const [banners, featuredProducts] = await Promise.all([
        bannerSvc.getActiveBanners(),
        catSvc.getFeaturedProducts(6)
    ]);
    return (
        <div className="w-full flex">
            
            <div className="flex-1">
                <BannerSlider banners={banners} />
                <ForYouSection products={featuredProducts} />
                <HomePageCategoryList />
            </div>
        </div>
    );
}