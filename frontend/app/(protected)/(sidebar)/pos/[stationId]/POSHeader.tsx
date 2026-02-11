"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategoryFilter } from "./CategoryFilter";
import { BarStation, CurrentUser, Category } from "./types";

interface POSHeaderProps {
  station: BarStation | null;
  currentUser: CurrentUser | null;
  categories: Category[];
  selectedCategory: number | null;
  searchTerm: string;
  productCount: number;
  onCategoryChange: (categoryId: number | null) => void;
  onSearchChange: (term: string) => void;
}

export function POSHeader({
  station,
  currentUser,
  categories,
  selectedCategory,
  searchTerm,
  productCount,
  onCategoryChange,
  onSearchChange,
}: POSHeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-card border-[color-mix(in oklab, var(--ring) 50%, transparent)] mb-6 rounded-lg border-1 p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push("/pos")} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <ShoppingCart className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-100">{station?.name || "Loading..."}</h1>
            {station?.description && <p className="text-sm text-gray-400">{station.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-6">
          {currentUser && (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-blue-400" />
              <span className="text-gray-300">{currentUser.name || currentUser.email}</span>
              {currentUser.role && (
                <span className="rounded-full bg-blue-900 px-2 py-1 text-xs text-blue-200">
                  {currentUser.role}
                </span>
              )}
            </div>
          )}
          <div className="text-sm text-gray-400">Products: {productCount}</div>
        </div>
      </div>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
      />

      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-600" />
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full py-2 pr-4 pl-10"
        />
      </div>
    </div>
  );
}
