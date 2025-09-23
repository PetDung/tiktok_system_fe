"use client"
import { getMyShop } from "@/service/shop/shop-service";
import { ShopResponse } from "@/service/types/ApiResponse";
import { useEffect, useState, useCallback, useMemo } from "react";
import ShopTable from "../_components/ShopTable";
import { useRouter } from "next/navigation";

interface SelectShopState {
  shops: ShopResponse[];
  loading: boolean;
  error: string | null;
}

export const SelectShopView = () => {
  const [state, setState] = useState<SelectShopState>({
    shops: [],
    loading: true,
    error: null
  });
  
  const router = useRouter();

  const fetchShops = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await getMyShop();
      const normalizedShops = response.result
        ? Array.isArray(response.result)
          ? response.result
          : [response.result]
        : [];
      
      setState({
        shops: normalizedShops,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error("Error fetching shops:", error);
      setState({
        shops: [],
        loading: false,
        error: error instanceof Error ? error.message : "Có lỗi xảy ra khi tải dữ liệu"
      });
    }
  }, []);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const handleShopClick = useCallback((shopId: string) => {
    router.push(`/order-in-shop/${shopId}`);
  }, [router]);

  const handleRetry = useCallback(() => {
    fetchShops();
  }, [fetchShops]);

  // Loading state
  if (state.loading) {
    return (
      <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách shop...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
          <p className="text-gray-600 mb-4">{state.error}</p>
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
        data={state.shops} 
        onShopClick={handleShopClick}
        onRefresh={fetchShops}
      />
    </div>
  );
};