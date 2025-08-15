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
    {value: "TIKTOK", label :"Tik tok"},
    {value: "SELLER", label :"Seller"}
]

export default function ViewOrderInShop() {
    const params = useParams();
    const shopId = params.id as string;

    const [orders, setOrders] = useState<Order[]>([]);
    const [nextPageToken, setNextPageToken] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string> ("");
    const [shipBy, setShipBy] = useState<string> ("");
    const [orderId, setOrderId] = useState<string>("");

    useEffect(() => {
        if (!shopId) {
            console.error("Shop ID is required to fetch orders.");
            return;
        }
        fetchOrders("");
    }, [shopId, status, shipBy]);

    const handlerSearch = async () =>{

        if(orderId && is18Digit(orderId) || !orderId){
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
            if(!pageToken) {
                setOrders(response?.result?.orders || []);
            }else{
                if (response?.result?.orders) {
                    setOrders(prev => [...prev, ...(response?.result?.orders || [])]);
                }
            }
            setNextPageToken(response.result?.next_page_token || "");


        } catch (error: any) {
            alert(error)
    
        } finally {
            setLoading(false);
        }
    };

    function is18Digit(str : string) {
        return /^\d{18}$/.test(str);
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Order List</h2>
                <div className="flex items-center gap-2">
                    <select className="border rounded px-2 py-1" onChange={(e) => setShipBy(e.target.value)} value={shipBy}>
                        <option value={""} >All</option>
                        {shipTypeOption.map(item => <option value={item.value} key={item.value} >{item.label}</option>)}
                    </select>
                    <select className="border rounded px-2 py-1" onChange={(e) => setStatus(e.target.value)} value={status}>
                        <option value={""} >All</option>
                        {statusOptions.map(item => <option value={item.value} key={item.value} >{item.label}</option>)}
                    </select>
                    <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="Search by order id"
                        className="border rounded px-2 py-1 min-w-[300px]"
                    />
                    <button className="bg-blue-500 text-white px-3 py-1 rounded" onClick={handlerSearch}>
                        Search
                    </button>
                    <button
                        onClick={() => fetchOrders("")}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            <OrderTable
                orders={orders}
                loading={loading}
                hasMore={!!nextPageToken}
                onLoadMore={() => fetchOrders(nextPageToken)}
            />
        </div>
    );
}
