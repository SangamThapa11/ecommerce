"use client";

import { useRouter } from "next/navigation";
import { IProduct } from "@/lib/category";
import { isAuthenticated, redirectToLogin } from "@/lib/auth";

export default function BuyNowButton({ product }: { product: IProduct }) {
  const router = useRouter();

  const handleBuyNow = () => {
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }

    
    const orderData = {
      id: product._id,
      orderId: `ord-${Date.now()}`,
      slug: product.slug,
      name: product.name,
      price: product.price,
      afterDiscount: product.afterDiscount,
      discount: product.discount,
      image: product.images[0]?.imageUrl || "/placeholder-product.jpg",
      quantity: 1, 
      stock: product.stock,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Store in localStorage
    if (typeof window !== 'undefined') {
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      localStorage.setItem('orders', JSON.stringify([...existingOrders, orderData]));
    }
    
    // Navigate to order page
    router.push('/order');
  };

  return (
    <button
      onClick={handleBuyNow}
      disabled={product.stock === 0}
      className="border border-teal-600 bg-emerald-600 hover:bg-emerald-400 text-white px-6 py-3 rounded-lg font-medium transition-colors hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {product.stock === 0 ? "Out of Stock" : "Buy Now"}
    </button>
  );
}