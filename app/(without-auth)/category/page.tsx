import CategoryGridList from "@/components/category/CategoryGridList";

export default async function CategoryPage() {
   
    return (<>

            <div className="max-w-screen-xl h-screen mx-auto px-8 text-justify">
            <div className="max-w-4xl mx-auto flex flex-col gap-10 mt-10">
                
                <h1 className="text-4xl text-teal-900 font-semibold"> Category for you.......</h1>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    <CategoryGridList/>
                </div>
            </div>
        </div>
        
    </>)
}