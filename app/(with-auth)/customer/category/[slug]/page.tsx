import catSvc, { ICategory, IProduct } from "@/lib/category"
import Image from "next/image";
import Link from "next/link";


const formatPrice = (price: number): string => {
  return (price / 100).toLocaleString();
};

export default async function AuthCategoryDetailPage({ params }: { params: { slug: string } }) {
    const [category, products] = await Promise.all([
        catSvc.getCategoryDetail(params.slug).catch(() => null),
        catSvc.getProductsByCategory(params.slug)
    ]);

    // Properly typed filter function
    const categoryProducts = products.filter((product: IProduct) =>
        product.category.some((cat: ICategory) => cat.slug === params.slug)
    );

    return (
        <div className="max-w-screen-xl mx-auto px-4 py-8 flex flex-col">
            <h1 className="text-3xl font-bold mb-6">
                {category?.name || "Category"} Products
            </h1>

            {categoryProducts.length > 0 ? (
                <div className="grid grid-cols-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {categoryProducts.map((product: IProduct) => (
                        <div key={product._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                            <Link href={`/products/${product.slug}`}> 
                           {/* <Link href={`/(with-auth)/products/${product.slug}`}> */}
                                {/* Product image */}
                                <div className="aspect-square relative">
                                    <Image
                                src={product.images[0]?.imageUrl || "/placeholder-product.jpg"}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 200px, (max-width: 1024px) 200px, 200px"
                            />
                                </div>

                                {/* Product details */}
                                <div className="p-3">
                                    <h3 className="font-medium text-lg mb-1 line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <div className="flex items-center gap-1 mt-2">
                                        {product.discount > 0 && (
                                            <span className="text-gray-500 line-through text-sm">
                                                 Rs. {formatPrice(product.price)}
                                            </span>
                                        )}
                                        <span className="text-teal-600 font-semibold">
                                            Rs. {formatPrice(product.afterDiscount)}
                                        </span>
                                        {product.discount > 0 && (
                                            <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded ml-auto">
                                                {product.discount}% OFF
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-500">
                        {products === undefined ?
                            "Error loading products" :
                            `No ${category?.name || ''} products found`
                        }
                    </p>
                </div>
            )}
        </div>
    );
}