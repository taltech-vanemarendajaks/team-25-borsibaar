"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import clsx from "clsx";
import { POSHeader } from "./POSHeader";
import { ProductCard } from "./ProductCard";
import { CartSidebar } from "./CartSidebar";
import { Product, Category, CartItem, CurrentUser, BarStation } from "./types";

export const dynamic = "force-dynamic";

export default function POSStation() {
  const params = useParams();
  const router = useRouter();
  const stationId = params.stationId as string;

  const [station, setStation] = useState<BarStation | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessingSale, setIsProcessingSale] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Fetch station and validate access
  const fetchStation = useCallback(async () => {
    try {
      const response = await fetch(`/api/backend/bar-stations/${stationId}`);

      if (!response.ok) {
        if (response.status === 403 || response.status === 404) {
          setError("You don't have access to this station");
          return;
        }
        throw new Error("Failed to fetch station");
      }

      const data = await response.json();
      setStation(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching station:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }, [stationId]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);

      const url = selectedCategory
        ? `/api/backend/inventory?categoryId=${selectedCategory}`
        : "/api/backend/inventory";

      const response = await fetch(url, {
        cache: "no-store",
      });

      if (!response.ok) throw new Error("Failed to fetch products");

      const data = await response.json();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/backend/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/backend/account");
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (err) {
      console.error("Error fetching current user:", err);
    }
  };

  useEffect(() => {
    fetchStation();
    fetchProducts();
    fetchCategories();
    fetchCurrentUser();

    // Load cart from localStorage with station-specific key
    const savedCart = localStorage.getItem(`pos-cart-${stationId}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    const refreshInterval = setInterval(fetchProducts, 1000 * 60);
    return () => clearInterval(refreshInterval);
  }, [stationId, fetchProducts, fetchStation]);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, fetchProducts]);

  useEffect(() => {
    // Save cart to localStorage with station-specific key
    localStorage.setItem(`pos-cart-${stationId}`, JSON.stringify(cart));
  }, [cart, stationId]);

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.productId === product.productId);

    if (existingItem) {
      if (existingItem.quantity < product.quantity) {
        setCart(
          cart.map(item =>
            item.productId === product.productId ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        );
      }
    } else {
      if (product.quantity > 0) {
        setCart([
          ...cart,
          {
            productId: product.productId,
            productName: product.productName,
            quantity: 1,
            maxQuantity: product.quantity,
            unitPrice: product.unitPrice,
          },
        ]);
      }
    }
  };

  const updateCartQuantity = (productId: number, change: number) => {
    setCart(
      cart
        .map(item => {
          if (item.productId === productId) {
            const newQuantity = item.quantity + change;
            if (newQuantity <= 0) {
              return null;
            }
            if (newQuantity <= item.maxQuantity) {
              return { ...item, quantity: newQuantity };
            }
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const processSale = async () => {
    if (cart.length === 0) return;

    setIsProcessingSale(true);
    try {
      const saleRequest = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        notes: `POS Sale - Station: ${station?.name}`,
        barStationId: parseInt(stationId),
      };

      const response = await fetch("/api/backend/sales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(saleRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to process sale");
      }

      clearCart();
      fetchProducts();
    } catch (err) {
      alert(`Error processing sale: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setIsProcessingSale(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (error) {
    return (
      <div className="bg-background flex min-h-screen w-full items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
          <p className="mb-4 text-xl text-gray-100">{error}</p>
          <Button onClick={() => router.push("/pos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Stations
          </Button>
        </div>
      </div>
    );
  }

  if (loading && !products?.length) {
    return (
      <div className="bg-background flex min-h-screen w-full items-center justify-center p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen w-full p-6 pb-24 lg:pb-6">
      <div className="mx-auto max-w-full">
        <POSHeader
          station={station}
          currentUser={currentUser}
          categories={categories}
          selectedCategory={selectedCategory}
          searchTerm={searchTerm}
          productCount={filteredProducts.length}
          onCategoryChange={setSelectedCategory}
          onSearchChange={setSearchTerm}
        />

        {/* Main Content */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Products Grid */}
          <div className="order-2 flex-1 lg:order-1">
            <div
              className={clsx("grid grid-cols-1 gap-4 sm:grid-cols-2", {
                "transition-all duration-300": true,
                "pointer-events-none blur-xs": loading,
                "blur-none": !loading,
              })}
            >
              {filteredProducts.map(product => {
                const cartItem = cart.find(item => item.productId === product.productId);

                return (
                  <ProductCard
                    key={product.id}
                    product={product}
                    cartItem={cartItem}
                    onAddToCart={addToCart}
                  />
                );
              })}
            </div>
          </div>

          {/* Cart Sidebar - moves below filter on smaller screens */}
          <div className="order-1 lg:order-2 lg:w-80">
            <CartSidebar
              cart={cart}
              isProcessingSale={isProcessingSale}
              onUpdateQuantity={updateCartQuantity}
              onRemoveItem={removeFromCart}
              onProcessSale={processSale}
              onClearCart={clearCart}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
