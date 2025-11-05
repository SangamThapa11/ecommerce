'use client'
import CategoryGridList from "./CategoryGridList";

const HomePageCategoryList = () => {
    
    return (<>
        <div className="max-w-4xl mx-auto flex flex-col gap-4 mt-10 pb-5">
            <h1 className="text-3xl font-bold mb-6">Category for you....</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                <CategoryGridList/>
            </div>
        </div>
    </>)
}
export default HomePageCategoryList;