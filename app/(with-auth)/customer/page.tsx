
import HomePageBanner from "@/components/banner/HomePageBanner"
import HomePageCategoryList from "@/components/category/HomePageList"
import Sidebar from "@/components/sidebar/sidebar"
import { Metadata } from "next"

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
const CustomerDashboard = () => {
    return (<>
        <div className="w-full flex">
            <Sidebar/>
            <HomePageCategoryList/>
        </div>
    
    </>)
}

export default CustomerDashboard