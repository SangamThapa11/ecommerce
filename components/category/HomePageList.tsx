'use client'

import catSvc, { ICatData } from "@/lib/category";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const HomePageCategoryList = () => {
    const [data, setData] = useState<Array<ICatData>>()

    useEffect(() => {
        getAllCatList()
    }, [])
    const getAllCatList = async () => {
        try {
            const result = await catSvc.getAllCatList()
            setData(result)
        } catch (exception) {
            //
        }
    }
    return (<>
        <div className="max-w-4xl mx-auto flex flex-col gap-20 mt-10 pb-5">
            <h1 className="text-4xl text-teal-800">Category for you....</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {
                    data && data.map((cat: ICatData) => (
                        <div key={cat._id} className="flex flex-col items-center">
                            <Link
                                className="flex w-full border border-gray-200 p-3"
                                href={`/category/` + cat.slug}
                            >
                                <Image
                                    width={200}
                                    height={200}
                                    src={cat.image}
                                    alt={cat.name} 
                                    className="h-fit"
                                />
                            </Link>
                            <span className="mt-2 text-center font-medium text-gray-700">
                                {cat.name}
                            </span>
                        </div>
                    ))
                }
            </div>
        </div>
    </>)
}
export default HomePageCategoryList;