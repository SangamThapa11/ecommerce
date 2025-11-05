//export { default } from '../../../../components/product/[slug]/ProductDetailPage'
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import catSvc, { IProductImage } from "@/lib/category";
import { IProduct } from "@/lib/category";
import AddToCartButton from "@/components/product/AddToCartButton";
import BuyNowButton from "@/components/product/BuyNowButton";
import CommentSection from "@/components/product/CommentSection";

// Generate metadata for SEO
export const generateMetadata = async ({ params, }: { params: { slug: string }; }): Promise<Metadata> => {
  try {
    const product = await catSvc.getProductDetail(params.slug);
    return {
      title: `${product.name} | E-Pasal`,
      description: product.description.substring(0, 160),
      openGraph: {
        title: product.name,
        description: product.description.substring(0, 160),
        images: product.images.map((img: IProductImage) => ({
          url: img.imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        })),
      },
    };
  } catch (exception) {
    return {
      title: "Product Details | E-Pasal",
      description: "View product details on E-Pasal",
    };
  }
};

const formatPrice = (price: number): string => {
  return (price / 100).toLocaleString();
};

export default async function ProductDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  let product: IProduct;
  let relatedProducts: IProduct[] = [];

  try {
    const response = await catSvc.getProductDetail(params.slug);
    product = response.product;
    relatedProducts = response.relatedProducts || [];
  } catch (error) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold text-red-500">
          Product not found or error loading product details
        </h1>
        <Link
          href="/"
          className="mt-4 inline-block text-teal-600 hover:underline"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Images */}
        <div className="md:w-1/2">
          <div className="sticky top-4">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-gray-100 mb-4">
              <Image
                src={product.images[0]?.imageUrl || "/placeholder-product.jpg"}
                alt={product.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className="aspect-square relative rounded overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={image.imageUrl}
                      alt={`${product.name} - ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="100px"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="md:w-1/2">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Brand */}
          <div className="flex items-center gap-4 mb-4">
            {product.brand && (
              <span className="text-sm text-gray-600">
                Brand: {product.brand.name}
              </span>
            )}
          </div>

          {/* Price Section */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              {product.discount > 0 && (
                <span className="text-lg text-gray-500 line-through">
                  Rs. {formatPrice(product.price)}
                </span>
              )}
              <span className="text-2xl font-bold text-teal-600">
                Rs. {formatPrice(product.afterDiscount)}
              </span>
              {product.discount > 0 && (
                <span className="bg-red-100 text-red-600 text-sm px-2 py-1 rounded">
                  {product.discount}% OFF
                </span>
              )}
            </div>
            {product.stock > 0 ? (
              <span className="text-sm text-green-600">
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-sm text-red-600">Out of Stock</span>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-700 whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
           <AddToCartButton product={product}/>
            <BuyNowButton product={product}/>
          </div>

          {/* Product Details */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">SKU</h3>
                <p className="text-gray-800">{product.sku}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                <p className="text-gray-800 capitalize">{product.status}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Added Date
                </h3>
                <p className="text-gray-800">
                  {new Date(product.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">
                  Last Updated
                </h3>
                <p className="text-gray-800">
                  {product.updatedAt
                    ? new Date(product.updatedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CommentSection productId={product._id} />

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {relatedProducts.map((product) => (
              <div
                key={product._id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/product/${product.slug}/detail`}>
                  <div className="aspect-square relative">
                    <Image
                      src={
                        product.images[0]?.imageUrl || "/placeholder-product.jpg"
                      }
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 200px, (max-width: 1024px) 200px, 200px"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-sm mb-1 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1 mt-2">
                      {product.discount > 0 && (
                        <span className="text-gray-500 line-through text-xs">
                           Rs. {formatPrice(product.price)}
                        </span>
                      )}
                      <span className="text-teal-600 font-semibold text-sm">
                        Rs. {formatPrice(product.afterDiscount)}
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}