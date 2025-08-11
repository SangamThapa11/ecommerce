import catSvc, { ICatData } from "@/lib/category";
import Image from "next/image";
import Link from "next/link";

export default async function Category() {
    let catList: Array<ICatData> = [];
    try {
        catList = await catSvc.getAllCatList()

    } catch (exception) {
        //
    }
    return (<>

        <div className="max-w-screen-xl h-screen mx-auto px-8 text-justify">
            <div className="max-w-4xl mx-auto flex flex-col gap-10 mt-10">
                <h1 className="text-4xl text-teal-900 font-semibold"> Category for you.......</h1>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {
                        catList && catList.map((cat: ICatData) => (
                            <Link 
                            key = {cat._id}
                            className="flex w-full border border-gray-500 p-3" 
                            href={"/category/slug"}>
                                <Image
                                    width={200}
                                    height={200}
                                    src="/cat-1.jpg"
                                    alt=""
                                />
                            </Link>
                        ))
                    }
                </div>
            </div>
        </div>
    </>)
}