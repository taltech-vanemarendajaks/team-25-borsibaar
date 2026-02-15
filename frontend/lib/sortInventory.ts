/**
 * Sort inventory by name, stock (quantity), or price.
 * Uses "map first, then sort": each item's sort key is computed once, then we sort by keys.
 */
export type InventorySortBy = "name" | "stock" | "price";
export type InventorySortDir = "asc" | "desc";

export interface SortableInventoryItem {
  productName?: string | null;
  quantity: string | number;
  basePrice: string | number;
  [key: string]: unknown;
}

export function sortInventoryBy<T extends SortableInventoryItem>(
  items: T[],
  sortBy: InventorySortBy,
  sortDir: InventorySortDir
): T[] {
  const withKey = items.map((item) => {
    const sortKey =
      sortBy === "name"
        ? (item.productName ?? "").toLowerCase()
        : parseFloat(String(sortBy === "stock" ? item.quantity : item.basePrice));
    return { item, sortKey };
  });
  withKey.sort((a, b) => {
    const cmp =
      typeof a.sortKey === "string"
        ? a.sortKey.localeCompare(b.sortKey as string, undefined, { sensitivity: "base" })
        : (a.sortKey as number) - (b.sortKey as number);
    return sortDir === "asc" ? cmp : -cmp;
  });
  return withKey.map(({ item }) => item);
}
