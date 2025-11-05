"use client";

import { IProduct } from "@/lib/category";
import { isAuthenticated, redirectToLogin } from "@/lib/auth";
import cartSvc from "@/lib/cart";

interface AddToCartButtonProps {
  product: IProduct;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      redirectToLogin();
      return;
    }

    try {
      await cartSvc.addToCart(product._id, 1);
      alert(`${product.name} added to cart!`);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      alert(error.message || 'Failed to add product to cart. Please try again.');
    }
  };

  return (
    <button
      className="bg-gray-400 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors hover:shadow-indigo-500 hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      onClick={handleAddToCart}
      disabled={product.stock === 0}
    >
      {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
    </button>
  );
}