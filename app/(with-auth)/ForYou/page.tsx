'use client';
import { IProduct } from '@/lib/category';
import Image from 'next/image';
import Link from 'next/link';

interface ForYouSectionProps {
    products: IProduct[];
}
const formatPrice = (price: number): string => {
  return (price / 100).toLocaleString();
};

export default function AuthForYouSection({ products }: ForYouSectionProps) {
    if (!products || products.length === 0) return null;

    return (
        <section className="max-w-4xl mx-auto flex flex-col gap-6 mt-10 pb-5">
            <h2 className="text-3xl font-bold mb-4">For You</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {products.map((product) => (
                    <div key={product._id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                        <Link href={`/products/${product.slug}`}>
                            {/* Product image */}
                            <div className="aspect-square relative">
                                <Image
                                    src={product.images[0]?.imageUrl || "/placeholder-product.jpg"}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 440px) 100px, (max-width: 1024px) 100px, 100px"
                                />
                            </div>

                            {/* Product details */}
                            <div className="p-3">
                                <h3 className="font-medium text-sm mb-1 line-clamp-2">
                                    {product.name}
                                </h3>
                                <div className="flex items-center gap-1 mt-2 flex-wrap">
                                    {product.discount > 0 && (
                                        <span className="text-gray-500 line-through text-xs">
                                            Rs. {formatPrice(product.price)}
                                        </span>
                                    )}
                                    <span className="text-teal-600 font-semibold text-sm">
                                        Rs. {formatPrice(product.afterDiscount)}
                                    </span>
                                    {product.discount > 0 && (
                                        <span className="bg-red-100 text-red-600 text-xs px-1 py-0.5 rounded">
                                            {product.discount}% OFF
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}