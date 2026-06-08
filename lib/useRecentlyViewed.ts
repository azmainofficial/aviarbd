"use client";
import { useState, useEffect, useCallback } from "react";

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number | null;
  icon: string;
  image?: string; // product image URL if available
  category: string;
}

const STORAGE_KEY = "aviar_recently_viewed_v2";
const MAX_ITEMS = 6;

export function useRecentlyViewed(currentId?: string) {
  const [items, setItems] = useState<RecentlyViewedItem[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored) as RecentlyViewedItem[]);
    } catch {}
  }, []);

  const addItem = useCallback((item: RecentlyViewedItem) => {
    setItems((prev) => {
      // Remove existing entry for this product (to re-insert at top)
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, MAX_ITEMS);
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch {}
      return updated;
    });
  }, []);

  // Exclude the product currently being viewed
  const recentItems = currentId ? items.filter((i) => i.id !== currentId) : items;

  return { recentItems, addItem };
}
