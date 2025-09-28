"use client"

import { Order } from "@/service/types/ApiResponse";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import OrderPrintSuccessCard from "./OrderPrintSuccessCard";
import { changePrinterStatus } from "@/service/order/order-service";
import { OrderWithFlag } from "./TablOrderPrint";
import LoadingOverlay from "@/components/UI/LoadingOverlay";
import { useState } from "react";

type Props = {
    orderSuccesList: OrderWithFlag[];
    setOrderSuccesList: React.Dispatch<React.SetStateAction<Order[]>>;
    isLoading: boolean;
    loadMore: () => void;
    hasMore: boolean;
}

export default function PrintSucc(
    {
        orderSuccesList,
        setOrderSuccesList,
        isLoading,
        loadMore,
        hasMore,
    }: Props) {

    const cancel = async (order: Order) => {
        try {
            setLoadingOverLay(true)
            const response = await changePrinterStatus(order.id, "PRINT_CANCEL");
            const newOrder = response.result;
            updateAOrder(newOrder);
        } catch (e: any) {
            console.error("Update printer error:", e);
            alert(e.message || "Lỗi khi cập nhật máy in");
            throw new Error(e)
        }finally{
            setLoadingOverLay(false)
        }
    }

    const [loadingOverlay, setLoadingOverLay] = useState<boolean>(false);

    const changStausOrderPrint = async (order: Order | null, status: string | null) => {
        if(!order) return;
        if(order.print_status === status) return;
        if (status === "PRINTED" || status === "PRINT_REQUEST") {
            if (!order.printer) {
                alert("Vui lòng chọn nhà in trước");
                throw new Error("Vui lòng chọn nhà in trước")
            }

            const missingSku = order.line_items.some(item => !item.print_sku);
            if (missingSku) {
                alert("Vui lòng set up dịch vụ in cho tất cả sản phẩm trước!");
                throw new Error("Vui lòng chọn nhà in trước")
            }
            const missingDesgin = order.line_items.some(item => !item.design);
            if (missingDesgin) {
                alert("Vui lòng set up thiết kế!");
                throw new Error("Vui lòng set up thiết kế!")
            }
            if(!order.print_shipping_method){
                 alert("Vui lòng chọn phương thức ship!");
                throw new Error("Vui lòng chọn phương thức ship!")
            }
        }
        
        try {
            if(!status) {
                alert("Lỗi khi cập nhật máy in");
                throw new Error("Lỗi khi cập nhật máy in")
            }
            setLoadingOverLay(true)
            const response = await changePrinterStatus(order.id, status);
            const newOrder = response.result;
            removeAOrder(newOrder.id);
        } catch (e: any) {
            console.error("Update printer error:", e);
            alert(e.message || "Lỗi khi cập nhật máy in");
            throw new Error(e)
        }finally{
            setLoadingOverLay(false)
        }
    };


    const updateAOrder = (newOrder: Order) => {
        setOrderSuccesList((prevOrders) =>
            prevOrders.map((o) => (o.id === newOrder.id ? newOrder : o))
        );
    };
    const removeAOrder = (orderId: string) => {
        // Gắn flag để animate trước khi xóa
        setOrderSuccesList((prevOrders: any) =>
            prevOrders.map((o: any) =>
                o.id === orderId ? { ...o, _isRemoving: true } : o
            )
        );
        // Xóa thật sau khi animate xong
        setTimeout(() => {
            setOrderSuccesList((prevOrders: any) => prevOrders.filter((o: any) => o.id !== orderId));
        }, 300);
    };



    return (
        <div>
            {isLoading && <div className="h-20 flex items-center justify-center">
                <LoadingIndicator />
            </div>}
            {orderSuccesList && orderSuccesList.length > 0 && (
                orderSuccesList.map(item => (
                    <OrderPrintSuccessCard
                        changStausOrderPrint = {changStausOrderPrint}
                        cancel={cancel}
                        order={item}
                        key={item.id}
                    />
                ))
            )}
            <div>
                {hasMore && (
                    <div className="flex justify-center items-center">
                        <button
                            onClick={loadMore}
                            disabled={isLoading}
                            className="px-3 sticky top-0 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center"
                        >
                            {isLoading ? (
                                <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"></span>
                            ) : null}
                            Load thêm
                        </button>
                    </div>
                )}
            </div>
            <LoadingOverlay show= {loadingOverlay}/>
        </div>
    );
}