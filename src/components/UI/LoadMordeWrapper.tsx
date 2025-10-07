"use client";

import { useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

interface LoadMoreWrapperProps {
  children: React.ReactNode;
  loadMore: () => Promise<void> | void;
  hasMore: boolean;
  rootMargin?: string;
  loader?: React.ReactNode; // 👈 cho phép truyền loader custom
  loading? : boolean
}

export default function LoadMoreWrapper({
  children,
  loadMore,
  hasMore,
  rootMargin = "1000px",
  loader, // 👈 nhận loader custom
  loading = false
}: LoadMoreWrapperProps) {
  const { ref: loaderRef, inView } = useInView({
    threshold: 0,
    rootMargin,
    triggerOnce: false,
  });

  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const isFirstMount = useRef(true);
  const isLoading = useRef(false);
  const savedLoadMore = useRef(loadMore);

  // Giữ loadMore mới nhất
  useEffect(() => {
    savedLoadMore.current = loadMore;
  }, [loadMore]);

  useEffect(() => {
    if (!hasMore) return;
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!inView || isLoading.current || loading) return;

    const doLoadMore = async () => {
      try {
        isLoading.current = true;
        console.log("⏳ Loading more...");
        await savedLoadMore.current();
      } catch (err) {
        console.error("⚠️ Load more error:", err);
      } finally {
        // tránh trigger liền sau khi load
        setTimeout(() => {
          isLoading.current = false;
        }, 600);
      }
    };
    doLoadMore();
  }, [inView, hasMore]);

  return (
    <div className="relative"  ref={wrapperRef}>
      {children}

      {hasMore && (
        <div ref={loaderRef} className="flex justify-center items-center h-12">
          {/* 👇 Nếu có loader custom thì dùng, không thì dùng mặc định */}
          {loader ?? (
            <span className="text-gray-400 text-sm animate-pulse">
              Đang tải thêm...
            </span>
          )}
        </div>
      )}
    </div>
  );
}
