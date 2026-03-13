"use client";

import { useEffect, useRef, useState } from "react";

export const TABLE_PAGE_SIZE = 20;

export function useLazyTable(totalItems: number, pageSize = TABLE_PAGE_SIZE) {
  const [visibleCount, setVisibleCount] = useState(() => Math.min(pageSize, totalItems));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(Math.min(pageSize, totalItems));
  }, [pageSize, totalItems]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= totalItems) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        setVisibleCount((current) => Math.min(current + pageSize, totalItems));
      },
      { rootMargin: "0px 0px 160px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [pageSize, totalItems, visibleCount]);

  return {
    visibleCount,
    hasMore: visibleCount < totalItems,
    loadMore: () => setVisibleCount((current) => Math.min(current + pageSize, totalItems)),
    sentinelRef
  };
}
