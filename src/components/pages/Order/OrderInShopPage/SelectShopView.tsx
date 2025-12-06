"use client"
import {useEffect, useState, useCallback, useRef} from "react";
import ShopTable from "../_components/ShopTable";
import { useRouter } from "next/navigation";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { useWebSocketOrderTotal } from "@/lib/customHooks/useWebSocketTotalOrder";
import {ShopResponse} from "@/service/types/ApiResponse";
import {getMyShop} from "@/service/shop/shop-service";

export type TotalOrder = {
    shopId: string;
    total : number;
}

export const SelectShopView = () => {
    const [shops, setShops] = useState<ShopResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const [totalMap, setTotalMap] = useState<Map<string, number>>(new Map());

    const fetchShops = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getMyShop()
            setShops(
                (res.result ?? []).sort(
                    (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
            );
        } catch (err: any) {
            setError(err.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchShops();
    }, [fetchShops]);


    function handleUpdateShop(update: TotalOrder) {
        setTotalMap(prev => {
            const newMap = new Map(prev);
            newMap.set(update.shopId, update.total);
            return newMap;
        });
    }

    useWebSocketOrderTotal({
        action : handleUpdateShop
    });

    const handleShopClick = useCallback((shopId: string) => {
        router.push(`/order-in-shop/${shopId}`);
    }, [router]);

    const handleRetry = useCallback(() => {
        fetchShops();
    }, [fetchShops]);

    if (loading) {
        return (
            <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex items-center justify-center">
                <LoadingIndicator/>
            </div>
        );
    }

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
                onRefresh={fetchShops}
                totalMap={totalMap}
            />
        </div>
    );
};
