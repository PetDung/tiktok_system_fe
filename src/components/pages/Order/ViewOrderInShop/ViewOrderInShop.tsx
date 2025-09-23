"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Order } from './../../../../service/types/ApiResponse';
import { getOrderInShop } from "@/service/order/order-service";
import OrderTable from "../_components/OrderTable";


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

export default function ViewOrderInShop() {
    const params = useParams();
    const shopId = params.id as string;

    const [orders, setOrders] = useState<Order[]>([]);
    const [nextPageToken, setNextPageToken] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [shipBy, setShipBy] = useState<string>("");
    const [orderId, setOrderId] = useState<string>("");

    useEffect(() => {
        if (!shopId) {
            console.error("Shop ID is required to fetch orders.");
            return;
        }
        fetchOrders("");
    }, [shopId, status, shipBy]);

    const handlerSearch = async () => {

        if (orderId && is18Digit(orderId) || !orderId) {
            await fetchOrders("");
            return;
        }
        alert("Không đúng định dạng id!")
    }

    const fetchOrders = async (pageToken: string) => {
        if (loading) return; // tránh load trùng
        setLoading(true);
        try {
            const response = await getOrderInShop({ shopId, nextPageToken: pageToken, status: status, shipping: shipBy, orderId: orderId });
            if (!pageToken) {
                setOrders(response?.result?.orders || []);
            } else {
                if (response?.result?.orders) {
                    setOrders(prev => {
                        // Tạo set các id hiện có
                        const existingIds = new Set(prev.map(o => o.id));
                        // Lọc những order mới chưa có trong set
                        const uniqueNewOrders = response?.result?.orders.filter(o => !existingIds.has(o.id));
                        // Trả về mảng kết hợp
                        return [...prev, ...uniqueNewOrders];
                    });
                }
            }
            setNextPageToken(response.result?.next_page_token || "");


        } catch (error: any) {
            alert(error)

        } finally {
            setLoading(false);
        }
    };

    function is18Digit(str: string) {
        return /^\d{18}$/.test(str);
    }

    return (
        <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex flex-col">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2 gap-4">
                <h2 className="text-lg font-semibold text-gray-800">Order List</h2>

                <div className="flex flex-wrap items-center gap-2">
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
            <div className="flex-1 min-h-0 overflow-auto">
                <OrderTable
                    orders={orders}
                    loading={loading}
                    hasMore={!!nextPageToken}
                    onLoadMore={() => fetchOrders(nextPageToken)}
                />
            </div>
        </div>
    );
}
