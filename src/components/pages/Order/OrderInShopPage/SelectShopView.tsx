"use client"
import { useCallback } from "react";
import ShopTable from "../_components/ShopTable";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { useShops } from "@/lib/customHooks/useShops";

export const SelectShopView = () => {
  const { data: shopsResponse, isLoading: shopLoading, refresh, error } = useShops();
  const shops = (shopsResponse?.result ?? []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  const router = useRouter();


  const handleShopClick = useCallback((shopId: string) => {
    router.push(`/order-in-shop/${shopId}`);
  }, [router]);

  const handleRetry = useCallback(() => {
    refresh();
  }, [refresh]);

  // Loading state
  if (shopLoading) {
    return (
      <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex items-center justify-center">
        <LoadingIndicator/>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <ShopTable
        data={shops}
        onShopClick={handleShopClick}
        onRefresh={refresh}
      />
    </div>
  );
};