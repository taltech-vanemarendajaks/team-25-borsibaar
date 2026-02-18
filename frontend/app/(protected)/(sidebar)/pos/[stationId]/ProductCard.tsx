"use client";

import { Package } from "lucide-react";
import clsx from "clsx";
import { Product, CartItem } from "./types";

interface ProductCardProps {
  product: Product;
  cartItem?: CartItem;
  onAddToCart: (product: Product) => void;
}

export function ProductCard({ product, cartItem, onAddToCart }: ProductCardProps) {
  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return { color: "bg-red-100 text-red-800", label: "Out of Stock" };
    if (quantity < 10) return { color: "bg-yellow-100 text-yellow-800", label: "Low Stock" };
    return { color: "bg-green-100 text-green-800", label: "In Stock" };
  };

  const status = getStockStatus(product.quantity);

  return (
    <div
      className="bg-card border-[color-mix(in oklab, var(--ring) 50%, transparent)] cursor-pointer rounded-lg border-1 p-4 shadow-sm transition-shadow hover:shadow-md"
      onClick={() => onAddToCart(product)}
    >
      <div className="mb-2 flex items-start justify-between">
        <h3 className="flex-1 truncate font-semibold text-gray-100">{product.productName}</h3>
        <Package className="ml-2 h-4 w-4 flex-shrink-0 text-gray-400" />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-col">
          <span
            className={clsx("text-lg font-bold", {
              "text-red-400": product.unitPrice > product.basePrice,
              "text-white": product.unitPrice == product.basePrice,
              "text-green-400": product.unitPrice < product.basePrice,
            })}
          >
            ${product.unitPrice.toFixed(2)}
          </span>
          <span className="text-xs text-white opacity-50">${product.basePrice?.toFixed(2)}</span>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${status.color}`}
        >
          {status.label}
        </span>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>Stock: {product.quantity}</span>
        {cartItem && <span className="text-blue-400">In cart: {cartItem.quantity}</span>}
      </div>
    </div>
  );
}
