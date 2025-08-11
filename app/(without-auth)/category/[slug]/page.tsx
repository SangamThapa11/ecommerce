// by default this component is  a server side component 

import { Metadata } from "next"
import catSvc from "@/lib/category"
//SEO
export const generateMetadata = async ({params}: {params:{slug: string}}): Promise<Metadata> => {
    console.log( await params)
   try {
     const result = await catSvc.getCategoryDetail(await params.slug)
    console.log(result)
     return {
        title: "Category Detail Page off.....",
        description: "Category Detail.........",
        openGraph: {
            title: "Category Detail Page off.....",
            description: "Category Detail.........",
            images: [{url: "/images/Logo.png"}]
        }
    }
   } catch (exception) {
    console.log(exception)
    return {}
   }
}
export default async function CategoryDetailPage({params}: Readonly<{params: {slug: string}}>) {
    //id based data fetch of product
    // state not allowed
    let result;
    try {
        result = await catSvc.getCategoryDetail(await params.slug)
    console.log(result)
    }catch(exception) {
        console.log(exception)
    }
    return (<>
    Category detail page design
    </>)
}