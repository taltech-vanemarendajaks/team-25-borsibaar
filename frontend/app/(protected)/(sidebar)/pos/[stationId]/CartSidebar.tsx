"use client";

import { ShoppingCart, DollarSign, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartItem } from "./types";

interface CartSidebarProps {
  cart: CartItem[];
  isProcessingSale: boolean;
  onUpdateQuantity: (productId: number, change: number) => void;
  onRemoveItem: (productId: number) => void;
  onProcessSale: () => void;
  onClearCart: () => void;
}

export function CartSidebar({
  cart,
  isProcessingSale,
  onUpdateQuantity,
  onRemoveItem,
  onProcessSale,
  onClearCart,
}: CartSidebarProps) {
  const cartTotal = cart.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const scrollToCart = () => {
    const cartElement = document.getElementById("cart-sidebar");
    if (cartElement) {
      cartElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Compact sticky cart bar for smaller screens */}
      {cart.length > 0 && (
        <div className="bg-card border-[color-mix(in oklab, var(--ring) 50%, transparent)] fixed right-0 bottom-0 left-0 z-50 border-1 shadow-lg lg:hidden">
          <div className="mx-auto max-w-full px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div
                className="flex min-w-0 flex-1 cursor-pointer items-center gap-3"
                onClick={scrollToCart}
              >
                <ShoppingCart className="h-5 w-5 flex-shrink-0 text-green-400" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-gray-400">
                    {itemCount} {itemCount === 1 ? "item" : "items"}
                  </div>
                  <div className="text-lg font-bold text-gray-100">${cartTotal.toFixed(2)}</div>
                </div>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
                <Button
                  onClick={e => {
                    e.stopPropagation();
                    onProcessSale();
                  }}
                  disabled={isProcessingSale}
                  className="bg-green-600 text-white hover:bg-green-700"
                  size="sm"
                >
                  {isProcessingSale ? "Processing..." : "Sell"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full cart sidebar */}
      <div
        id="cart-sidebar"
        className="bg-card border-[color-mix(in oklab, var(--ring) 50%, transparent)] w-full rounded-lg border-1 p-6 shadow-sm lg:sticky lg:top-6 lg:w-80 lg:self-start"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-100">Cart</h2>
          <DollarSign className="h-6 w-6 text-green-400" />
        </div>

        {cart.length === 0 ? (
          <div className="py-8 text-center text-gray-400">
            <ShoppingCart className="mx-auto mb-2 h-12 w-12 opacity-50" />
            <p>Your cart is empty</p>
            <p className="text-sm">Tap products to add them</p>
          </div>
        ) : (
          <>
            <div className="scrollbar-hide mb-6 max-h-96 space-y-2 overflow-y-auto sm:space-y-3">
              {cart.map(item => (
                <div
                  key={item.productId}
                  className="flex flex-col gap-1 rounded bg-gray-800 p-2 sm:gap-1.5 sm:p-3 lg:gap-3"
                >
                  {/* Compact layout for smaller screens */}
                  <div className="flex min-w-0 items-center justify-between gap-6 lg:hidden">
                    <p className="min-w-0 flex-1 text-sm font-medium break-words text-gray-100 sm:text-base">
                      {item.productName}
                    </p>
                    <div className="flex flex-shrink-0 items-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                          e.stopPropagation();
                          onUpdateQuantity(item.productId, -1);
                        }}
                        className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                        aria-label={`Decrease quantity of ${item.productName}`}
                      >
                        <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                      <span className="w-7 text-center text-xs font-medium text-gray-100 sm:w-8 sm:text-sm">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                          e.stopPropagation();
                          onUpdateQuantity(item.productId, 1);
                        }}
                        className="h-7 w-7 p-0 sm:h-8 sm:w-8"
                        disabled={item.quantity >= item.maxQuantity}
                        aria-label={`Increase quantity of ${item.productName}`}
                      >
                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={e => {
                        e.stopPropagation();
                        onRemoveItem(item.productId);
                      }}
                      className="h-7 flex-shrink-0 px-2 text-xs sm:h-8 sm:px-3"
                      aria-label={`Remove ${item.productName} from cart`}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="text-xs">Remove</span>
                    </Button>
                  </div>
                  {/* Vertical layout for larger screens */}
                  <div className="hidden min-w-0 flex-col gap-1 lg:flex">
                    <p className="text-base font-medium break-words text-gray-100">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-400">
                      ${item.unitPrice.toFixed(2)} × {item.quantity} = $
                      {(item.unitPrice * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div className="hidden items-center justify-between gap-2 lg:flex">
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                          e.stopPropagation();
                          onUpdateQuantity(item.productId, -1);
                        }}
                        className="h-8 w-8 p-0"
                        aria-label={`Decrease quantity of ${item.productName}`}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium text-gray-100">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={e => {
                          e.stopPropagation();
                          onUpdateQuantity(item.productId, 1);
                        }}
                        className="h-8 w-8 p-0"
                        disabled={item.quantity >= item.maxQuantity}
                        aria-label={`Increase quantity of ${item.productName}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={e => {
                        e.stopPropagation();
                        onRemoveItem(item.productId);
                      }}
                      className="h-8 px-3 text-xs"
                      aria-label={`Remove ${item.productName} from cart`}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      <span className="text-xs">Remove</span>
                    </Button>
                  </div>
                  {/* Price for smaller screens */}
                  <p className="text-xs text-gray-400 sm:text-sm lg:hidden">
                    ${item.unitPrice.toFixed(2)} × {item.quantity} = $
                    {(item.unitPrice * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="mb-4 border-t border-gray-600 pt-4">
              <div className="flex justify-between text-lg font-bold text-gray-100">
                <span>Total:</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onProcessSale}
                disabled={isProcessingSale}
                className="aspect-square min-h-20 flex-1 bg-green-600 text-lg font-semibold text-white hover:bg-green-700"
              >
                {isProcessingSale ? "Processing..." : "Sell"}
              </Button>
              <Button
                onClick={onClearCart}
                variant="outline"
                className="aspect-square min-h-20 flex-1 text-lg font-semibold"
              >
                Cancel
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
