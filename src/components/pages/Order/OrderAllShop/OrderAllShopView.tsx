"use client";
import { exportOrderSelected, updatePrinterOrder } from "@/service/order/order-service";
import { Order, PrintShop, ShopResponse } from "@/service/types/ApiResponse";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import OrderTable from "../_components/OrderTable";
import MultiSelect, { Option } from "../_components/MultiSelect";
import { debounce } from "lodash";
import { useWebSocket } from "@/Context/WebSocketContext";
import LoadingOverlay from "@/components/UI/LoadingOverlay";
import ImportDropdown from "../_components/ImportDropdown";
import { useSearchParams } from "next/navigation";
import { usePrinters } from "@/lib/customHook/usePrinters";
import { useShops } from "@/lib/customHook/useShop";
import { updateOrderInAllOrdersCache, useOrderAllShop } from "@/lib/customHook/useOrderAllShop";
import { IMessage } from "@stomp/stompjs";
import { Message } from "@/service/types/websocketMessageType";

const statusOptions = [
    { value: "UNPAID", label: "Unpaid" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "AWAITING_SHIPMENT", label: "Awaiting Shipment" },
    { value: "PARTIALLY_SHIPPING", label: "Partially Shipping" },
    { value: "AWAITING_COLLECTION", label: "Awaiting Collection" },
    { value: "IN_TRANSIT", label: "In Transit" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
];

const shipTypeOption = [
    { value: "TIKTOK", label: "TikTok" },
    { value: "SELLER", label: "Seller" },
];

export default function OrderAllShopView() {
    const searchParams = useSearchParams();
    const orderIdParam = searchParams.get("order_id") || "";

    const [status, setStatus] = useState("");
    const [shipBy, setShipBy] = useState("");
    const [orderId, setOrderId] = useState(orderIdParam);
    const [selectedShops, setSelectedShops] = useState<string[]>([]);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [exportLoading, setExporting] = useState(false);
    const [page, setPage] = useState<number>(0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [hasMore, setHasMore] = useState<boolean>(false);
    const [search, setSearch] = useState<string>("");
    const wsClient = useWebSocket();

    const { data: orderResponse, isLoading} = useOrderAllShop(
        {
            status,
            shipping: shipBy,
            orderId: search,
            shopIds: selectedShops,
            page: page
        }
    );
    useEffect(() => {
        if (!orderResponse) return;

        const newOrders = orderResponse.result.data || [];
        setOrders(prev => {
            if (page === 0) return newOrders; // replace khi filter/search
            const existingIds = new Set(prev.map(o => o.id));
            const uniqueNewOrders = newOrders.filter(o => !existingIds.has(o.id));
            return [...prev, ...uniqueNewOrders];
        });

        setHasMore(!orderResponse.result.last);
    }, [orderResponse, page]);

    useEffect(() => {
        const callback = (msg: IMessage) => {
            const updated: Message<Order> = JSON.parse(msg.body);
            if(updated.event === "UPDATE") {
                const newOrder = updated.data;
                updateAOrder(newOrder)
            }
        };
        wsClient.subscribe("/user/queue/orders", callback);

        // cleanup: unsubscribe khi component unmount
        return () => {
            wsClient.unsubscribe("/user/queue/orders");
        };
    }, [wsClient]);

    const { data: printersResponse } = usePrinters();
    const printers: PrintShop[] = (printersResponse?.result ?? []).sort(
        (a: PrintShop, b: PrintShop) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    
    const { data: shopsResponse, isLoading: shopLoading } = useShops();
    const shops = (shopsResponse?.result ?? []).sort(
        (a: ShopResponse, b: ShopResponse) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const optionShops: Option[] = shops.map((item: ShopResponse) => ({
        value: item.id,
        label: item.userShopName,
    }));
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const handlerSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!orderId || is18Digit(orderId)) {
            handleBeforeFillter(orderId, setSearch)
            return;
        }
        if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.classList.add("border-red-500", "ring-red-500");
            setTimeout(() => {
                searchInputRef.current?.classList.remove("border-red-500", "ring-red-500");
            }, 3000);
        }
        alert("Không đúng định dạng ID! (Cần 18 chữ số)");
    };

    const is18Digit = (str: string) => /^\d{18}$/.test(str);

    const debouncedHandleSelected = useCallback(
        debounce((selected: Option[]) => {
            setOrders([])
            setPage(0)
            setSelectedShops(selected.map((s) => s.value));
        }, 600),
        []
    );

    const exportOrder = async () => {
        if (selectedOrders.size === 0) return;
        setExporting(true);
        try {
            const response = await exportOrderSelected({
                orderIds: Array.from(selectedOrders),
            });
            const rs = response?.result ?? {};
            const orderError = new Set<string>();
            Object.keys(rs).forEach((key) => orderError.add(key));

            if (Object.keys(rs).length > 0) {
                alert(`Export completed with some issues:\n${JSON.stringify(rs)}`);
            } else {
                alert("Export completed successfully!");
            }
            setSelectedOrders(orderError);
        } catch (e: any) {
            console.error("Export error:", e);
            alert(e.message || "Có lỗi khi export đơn hàng");
        } finally {
            setExporting(false);
        }
    };

    const clearAllFilters = () => {
        setStatus("");
        setShipBy("");
        setSelectedShops([]);
        setOrderId("");
        setSearch("")
        setSelectedOrders(new Set());
    };
    const handleBeforeFillter = (value : any, callBack : (value : any) =>void )=>{
        setOrders([])
        setPage(0)
        callBack(value)
    }


    const updatePrinter = async (orderId: string, printerId: string | null) => {
        try {
            const finalPrinterId = !printerId ? "REMOVE" : printerId;
            const response = await updatePrinterOrder(orderId, finalPrinterId);
            const newOrder : Order = response.result;
            updateAOrder(newOrder)
        } catch (e: any) {
            console.error('Update printer error:', e);
            alert(e.message || "Lỗi khi cập nhật nhà in");
        }
    }

    const updateAOrder = ( newOrder : Order) =>{
        setOrders(prevOrders => prevOrders.map(o => o.id === newOrder.id ? newOrder : o));
        updateOrderInAllOrdersCache(newOrder.id, newOrder)
    }
    return (
        <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex flex-col ">
            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-2">
                <button
                    type="button"
                    onClick={exportOrder}
                    disabled={selectedOrders.size === 0 || exportLoading}
                    className={`px-2 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${selectedOrders.size === 0 || exportLoading
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                        }`}
                >
                    {exportLoading ? "Exporting..." : `Export (${selectedOrders.size})`}
                </button>

                <ImportDropdown printers={printers} />

                <button
                    type="button"
                    onClick={clearAllFilters}
                    className="px-2 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                    Clear Filters
                </button>
            </div>

            {/* Filters */}
            <div className="bg-gray-50 p-2 rounded-lg mb-2 border border-gray-200 flex flex-wrap items-end gap-4">
                <select
                    value={shipBy}
                    onChange={(e) => handleBeforeFillter(e.target.value, setShipBy)}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">All Shipping Types</option>
                    {shipTypeOption.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>

                <select
                    value={status}
                    onChange={(e) => handleBeforeFillter(e.target.value, setStatus)}
                    className="border rounded-lg px-3 py-2 text-sm"
                >
                    <option value="">All Statuses</option>
                    {statusOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                            {o.label}
                        </option>
                    ))}
                </select>

                <MultiSelect
                    options={optionShops}
                    loading={shopLoading}
                    onChange={debouncedHandleSelected}
                />

                <form onSubmit={handlerSearch} className="flex space-x-2 flex-1">
                    <input
                        ref={searchInputRef}
                        type="search"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Enter 18-digit order ID..."
                        className="flex-1 border text-sm border-gray-300 rounded-lg px-2 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Search
                    </button>
                </form>
            </div>

            {/* Orders Table */}
            <div className="flex-1 min-h-0 overflow-auto">
                <OrderTable
                    orders={orders}
                    loading={isLoading}
                    hasMore={hasMore}
                    onLoadMore={() => setPage(prev => prev + 1)}
                    isSelectable={true}
                    selectList={selectedOrders}
                    onSelectChange={setSelectedOrders}
                    updatePOrder={updatePrinter}
                    type="ALL"
                    printer={printers}
                />
            </div>
            <LoadingOverlay show={exportLoading} />
        </div>
    );
}
