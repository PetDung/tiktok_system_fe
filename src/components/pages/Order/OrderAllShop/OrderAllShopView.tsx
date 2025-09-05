"use client"

import { exportOrderSelected, getOrderAllShop } from "@/service/order/order-service";
import { Order, ShopResponse } from "@/service/types/ApiResponse";
import { useCallback, useEffect, useRef, useState } from "react";
import OrderTable from "../_components/OrderTable";
import MultiSelect, { Option } from "../_components/MultiSelect";
import { getMyShop } from "@/service/shop/shop-service";
import { debounce, set } from "lodash";
import WebSocketClient from "@/lib/webSocketClient";
import { useWebSocket } from "@/Context/WebSocketContext";
import { IMessage } from "@stomp/stompjs";
import LoadingOverlay from "@/components/UI/LoadingOverlay";


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
    { value: "TIKTOK", label: "Tik tok" },
    { value: "SELLER", label: "Seller" }
]


export default function OrderAllShopView() {


    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [shipBy, setShipBy] = useState<string>("");
    const [orderId, setOrderId] = useState<string>("");
    const [page, setPage] = useState<number>(0);
    const [isLast, setIsLast] = useState<boolean>(true);
    const [shops, setShops] = useState<Option[]>([]);
    const [shopLoading, setShopLoading] = useState<boolean>(true);
    const [selectedShops, setSelectedShops] = useState<string[]>([]);
    const wsClient = useWebSocket(); 
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [exportLoading, setExporting] = useState<boolean>(false);


    useEffect(() => {
        const callback = (msg: IMessage) => {
            const updatedOrder: Order = JSON.parse(msg.body);
            console.log(updatedOrder)
            setOrders((prev) => {
                const exists = prev.some((o) => o.id === updatedOrder.id);
                if (exists) {
                    return prev.map((o) =>
                        o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o
                    );
                } else {
                    return [updatedOrder, ...prev];
                }
            });
        };
        wsClient.subscribe("/user/queue/orders", callback);

        // cleanup: unsubscribe khi component unmount
        return () => {
            wsClient.unsubscribe("/user/queue/orders");
        };
    }, [wsClient]);

    useEffect(() => {
        fetchOrders(0);
    }, [status, shipBy, selectedShops]);

    useEffect(() => {
        (async () => {
            setShopLoading(true);
            try {
                const response = await getMyShop();

                const shopsRespone: ShopResponse[] = response.result
                    ? Array.isArray(response.result)
                        ? response.result
                        : [response.result]
                    : []
                let optionShops: Option[] = shopsRespone.map(item => ({
                    value: item.id,
                    label: item.userShopName
                }));
                setShops(optionShops);
                console.log("Shop data:", response);

            } catch (error) {
                console.error("Error in OrderInShopComponents:", error);
            } finally {
                setShopLoading(false);
            }
        })()
    }, []);

    const handlerSearch = async (e: React.FormEvent) => {
        e.preventDefault(); // Ngăn form submit mặc định

        // Nếu orderId rỗng hoặc đúng định dạng 18 chữ số
        if (!orderId || is18Digit(orderId)) {
            await fetchOrders(0);
            setStatus("");
            setShipBy("");
            setPage(0);
            return;
        }

        alert("Không đúng định dạng ID!");
    };

    const fetchOrders = async (newPage: number) => {
        if (loading) return; // tránh load trùng
        setLoading(true);
        try {
            const response = await getOrderAllShop({ page: newPage, status: status, shipping: shipBy, orderId: orderId, shopIds: selectedShops });
            if (newPage === 0) {
                setOrders(response?.result?.orders || []);
            } else {
                setOrders(prev => [...prev, ...(response?.result?.orders || [])]);
            }
            setPage(response.result?.current_page || 0)
            setIsLast(response.result?.last ?? true)


        } catch (error: any) {
            alert(error)

        } finally {
            setLoading(false);
        }
    };

    function is18Digit(str: string) {
        return /^\d{18}$/.test(str);
    }

    // hàm xử lý thực tế
    const handleSelected = (selected: Option[]) => {
        console.log("Selected (debounced):", selected);
        const selectIds = selected.map(item => item.value);
        setSelectedShops(selectIds);
    };

    // tạo phiên bản debounced của hàm
    const debouncedHandleSelected = useCallback(
        debounce(handleSelected, 600), // 600ms debounce
        []
    );
    
    const exportOrder = async () => {
        console.log("Exporting orders:", Array.from(selectedOrders));
        if(selectedOrders.size > 0 ){
            setExporting(true);
            try{
                const response = await exportOrderSelected({ orderIds: Array.from(selectedOrders) });
                console.log("Export response:", response);

                const rs  = response?.result;
                const keys = Object.keys(rs); 
                let message: string = "";
                const orderError = new Set<string>();
                keys.forEach(key => {
                    message += (rs[key] ? `${key}: ${rs[key]}\n` : ``)
                    orderError.add(key);
                })
                if(message) alert(message);
                setSelectedOrders(orderError)
            }
            finally {
                setExporting(false);
            }
        }
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
                <h2 className="text-lg font-semibold text-gray-800">Order List</h2>

                <div className="flex flex-wrap items-center gap-2">
                    <div>
                        <button
                            type="button"
                            onClick={exportOrder}
                            disabled={selectedOrders.size === 0}  // ✅ disable nếu chưa chọn order nào
                            className={`px-4 py-2 text-sm font-medium rounded-lg border transition
                                ${selectedOrders.size === 0
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-green-500 hover:bg-green-600 text-white border-gray-300"
                                }`}
                        >
                            Export
                        </button>
                      </div>

                    {/* Ship By */}
                    <div className="relative inline-block w-40">
                        <select
                            className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm"
                            onChange={(e) => setShipBy(e.target.value)}
                            value={shipBy}
                        >
                            <option value="">All</option>
                            {shipTypeOption.map((item) => (
                                <option value={item.value} key={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>

                        {/* Custom arrow */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Status */}
                    <div className="relative inline-block w-40">
                        <select
                            className="appearance-none w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 bg-white cursor-pointer hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 shadow-sm"
                            onChange={(e) => setStatus(e.target.value)}
                            value={status}
                        >
                            <option value="">All</option>
                            {statusOptions.map((item) => (
                                <option value={item.value} key={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>

                        {/* Custom arrow */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <svg
                                className="w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>

                    {/* Shops MultiSelect */}
                    <div className="min-w-[200px]">
                        <MultiSelect
                            options={shops}
                            loading={shopLoading}
                            onChange={debouncedHandleSelected}
                        />
                    </div>

                    {/* Search by Order ID */}
                    <form onSubmit={handlerSearch}>
                        <input
                            type="search"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Search by order ID"
                            className="border border-gray-300 rounded-lg px-4 py-2 min-w-[300px] text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />

                        {/* Search Button */}
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-600 text-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium transition"
                            
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>


            <OrderTable
                orders={orders}
                loading={loading}
                hasMore={!isLast}
                onLoadMore={() => fetchOrders(page + 1)}
                isSelectable={true}
                selectList={selectedOrders}
                onSelectChange={setSelectedOrders}
            />
            <LoadingOverlay show={exportLoading} />
        </div>
    )
}
