"use client"

import { getOrderAllShop } from "@/service/order/order-service";
import { Order, ShopResponse } from "@/service/types/ApiResponse";
import { useCallback, useEffect, useState } from "react";
import OrderTable from "../_components/OrderTable";
import MultiSelect, { Option } from "../_components/MultiSelect";
import { getMyShop } from "@/service/shop/shop-service";
import { debounce } from "lodash";


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


    useEffect(() => {
        fetchOrders(0);
    }, [status, shipBy, selectedShops]);

    useEffect(() => {
        (async () => {
            setShopLoading(true);
            try {
                const response = await getMyShop();

                const shopsRespone : ShopResponse[] =  response.result
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
            }finally{
                setShopLoading(false);
            }
        })()
    }, []);


    const handlerSearch = async () => {

        if (orderId && is18Digit(orderId) || !orderId) {
            await fetchOrders(0);
            setIsLast(true);
            setStatus("");
            setShipBy("");
            setPage(0)
            return;
        }
        alert("Không đúng định dạng id!")
    }

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





    return (
        <div className="bg-white p-4 rounded-lg shadow">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Order List</h2>
                <div className="flex items-center gap-2">
                    <select className="border rounded-lg p-1 flex justify-between items-center cursor-pointer bg-white" onChange={(e) => setShipBy(e.target.value)} value={shipBy}>
                        <option value={""} >All</option>
                        {shipTypeOption.map(item => <option value={item.value} key={item.value} >{item.label}</option>)}
                    </select>
                    <select className="border rounded-lg p-1 flex justify-between items-center cursor-pointer bg-white" onChange={(e) => setStatus(e.target.value)} value={status}>
                        <option value={""} >All</option>
                        {statusOptions.map(item => <option value={item.value} key={item.value} >{item.label}</option>)}
                    </select>
                    <MultiSelect options={shops} loading={shopLoading} onChange={debouncedHandleSelected}/>
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
                </div>
            </div>

            <OrderTable
                orders={orders}
                loading={loading}
                hasMore={!isLast}
                onLoadMore={() => fetchOrders(page + 1)}
            />
        </div>
    )

}