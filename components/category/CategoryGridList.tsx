'use client'

import catSvc, { ICatData } from "@/lib/category"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"

const CategoryGridList = () => {
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
    {
                    data && data.map((cat: ICatData) => (
                        <div key={cat._id} className="border rounded-lg overflow-hidden hover:shadow-lg bg-purple-100 text-center">
                            <Link
                                className="flex w-full border border-gray-200 p-3"
                                href={`/category/${cat.slug}`}
                            >
                                <Image
                                    width={200}
                                    height={200}
                                    src={cat.image}
                                    alt={cat.name} 
                                    className="h-fit"
                                />
                            </Link>
                            <Link href={`/category/${cat.slug}`} className="mt-2 text-center font-medium text-rose-600">
                                {cat.name}
                            </Link>
                        </div>
                    ))
                }
    </>)
}
export default CategoryGridList; 