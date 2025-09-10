"use client";

import { useRef, useEffect } from "react";
import { ShopResponse } from "@/service/types/ApiResponse";
import ShopRow from "./ShopRow";

type Props = {
  shops: ShopResponse[];
  setShops: React.Dispatch<React.SetStateAction<ShopResponse[]>>;
  loading: boolean;
  last: boolean;
  fetchMore: () => void;
};

export default function ShopTable({
  shops,
  setShops,
  loading,
  last,
  fetchMore,
}: Props) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  // throttle reference to avoid duplicate fetches when observer fires rapidly
  const fetchThrottleRef = useRef<number | null>(null);

  // Observer gắn vào sentinel
  useEffect(() => {
    if (last) return;

    const options: IntersectionObserverInit = {
      root: scrollContainerRef.current,
      // small threshold plus large rootMargin to prefetch before user reaches the end
      threshold: 0.1,
      rootMargin: "300px",
    };

    const observer = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (!target) return;

      if (target.isIntersecting && !loading) {
        // Debounce calls to avoid rapid double-fetches
        if (fetchThrottleRef.current == null) {
          fetchMore();
          // block further calls for 800ms
          fetchThrottleRef.current = window.setTimeout(() => {
            if (fetchThrottleRef.current != null) {
              clearTimeout(fetchThrottleRef.current as number);
              fetchThrottleRef.current = null;
            }
          }, 800) as unknown as number;
        }
      }
    }, options);

    const node = loaderRef.current;
    if (node) observer.observe(node);

    return () => {
      observer.disconnect();
      if (fetchThrottleRef.current != null) {
        clearTimeout(fetchThrottleRef.current as number);
        fetchThrottleRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, last, fetchMore]);

  return (
    <div className="rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Scroll container */}
      <div ref={scrollContainerRef} className="overflow-y-auto max-h-[70vh]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TikTok Shop Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Shop Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading && shops.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : shops.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  No shops found
                </td>
              </tr>
            ) : (
              shops.map((shop, idx) => (
                <ShopRow
                  key={shop.id}
                  shop={shop}
                  index={idx}
                  setShops={setShops}
                />
              ))
            )}
          </tbody>
        </table>

        {/* Sentinel */}
        {!last && (
          <div
            ref={loaderRef}
            className="py-4 text-center text-gray-500"
          >
            {loading ? "Loading more..." : "Scroll xuống để tải thêm..."}
          </div>
        )}
      </div>
    </div>
  );
}
