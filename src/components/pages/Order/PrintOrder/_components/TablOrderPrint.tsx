"use client"

import { formatDate, LineItem, Order } from "@/service/types/ApiResponse"
import { Fragment, useEffect, useMemo, useState } from "react"
import OrderItemModalView from "./OrderItemModalView"
import { CategoryPrintPrinteesHub, getVariationsMenPrint, getVariationsPrinteesHub } from "@/service/print-order/getSKU"

type Props = {
    orderList: Order[]
}


export default function TablOrderPrint({ orderList }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [lineItemSelected, setLineItemSelected] = useState<LineItem[]>([]);
    const [variationsPrinteesHub, setVariationsPrinteesHub] = useState<CategoryPrintPrinteesHub[]>([])
    
    useEffect(() =>{
        const load = async () =>{
            try{
                const dataPrinteesHub = await getVariationsPrinteesHub();
                // const dataMenPrint = await getVariationsMenPrint();
                setVariationsPrinteesHub(dataPrinteesHub);
            }catch(e: any) {
                alert(e?.message || "Fail load")
            }
        }   
        load();
    },[])

    const names : string[] = useMemo(() => {
        const namesSet = new Set<string>();
        variationsPrinteesHub.forEach(cat => {
            namesSet.add(cat.name); // gom name
        });
        return Array.from(namesSet)
    }, [variationsPrinteesHub])


    return (
        <div>
            {isModalOpen && 
                <OrderItemModalView 
                    names={names}
                    orderItems={lineItemSelected}
                    onClose={() => setIsModalOpen(false)} 
                />
            }
            <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-300 sticky top-0 z-20 shadow-sm text-xs">
                <tr>
                    <th className="px-1 py-1 text-left font-semibold text-gray-700">Order ID</th>
                    <th className="px-1 py-1 text-left font-semibold text-gray-700">Products</th>
                    <th className="px-1 py-1 text-left font-semibold text-gray-700">Nhà in</th>
                    <th className="px-1 py-1 text-left font-semibold text-gray-700">Status</th>
                    <th className="px-1 py-1 text-left font-semibold text-gray-700">Customer</th>
                    <th className="px-1 py-1 text-left font-semibold text-gray-700">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {orderList.map((order, idx) => (
                    <Fragment key={order.id}>
                        <tr className="hover:bg-blue-50 cursor-pointer transition-all duration-200 relative group">
                            <td className="px-1 py-1 text-xs">
                                <div className="text-gray-800 font-bold mb-1">{order.shop_name}</div>
                                <div className="text-gray-600 text-sm font-medium">ID: {order.id}</div>
                                <div className="text-gray-500 text-sm">
                                    Tracking: {order.tracking_number || <span className="text-red-500 font-medium">Chưa có</span>}
                                </div>
                                <div className="text-gray-400 text-xs mt-1">{formatDate(order.create_time)}</div>
                            </td>
                            <td
                                onClick= {() => {
                                    setIsModalOpen(true)
                                    setLineItemSelected(order.line_items)
                                }}
                                className="px-1 py-1 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {order.line_items.map((item, i) => (
                                        <div key={i} className="relative group">
                                            <img
                                                src={item.sku_image}
                                                alt={item.product_name}
                                                className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </td>
                            <td className="px-1 py-1 text-xs">
                            </td>
                            <td className="px-1 py-1">
                                <span
                                    className={`px-1 py-1 rounded-full text-white shadow-sm text-xs ${order.status === "CANCELLED" ? "bg-red-500" :
                                            order.status === "COMPLETED" ? "bg-green-500" :
                                                order.status === "DELIVERED" ? "bg-blue-500" :
                                                    "bg-orange-500"
                                        }`}
                                >
                                    {order.status}
                                </span>
                                <div className="text-gray-500 text-xs mt-1 font-medium">
                                    Ship: <span className="font-bold">{order.shipping_type}</span>
                                </div>
                            </td>
                            {/* {type === "ALL" && (
                                <td className="px-1 py-1">
                                    <OptionalSelect
                                        value={order?.printer?.id ?? null}
                                        options={printerOption}
                                        placeholder="Nhà in"
                                        size={150}
                                        onChange={(value) => handlerUpdaterPrintOrder(order.id, value)}
                                    />
                                </td>
                            )} */}

                            <td className="px-1 py-1 text-gray-700">
                                <div className="space-y-1">
                                    <div className="font-semibold text-gray-800">{order.recipient_address.name}</div>
                                    <div className="text-xs text-gray-600">{order.recipient_address.phone_number}</div>
                                    <div className="text-xs text-gray-500">{order.recipient_address.address_detail}</div>
                                    <div className="text-xs text-gray-500">
                                        {order.recipient_address.district_info.map(d => d.address_name).join(", ")}
                                    </div>
                                    <div className="text-xs text-gray-500">{order.recipient_address.postal_code}</div>
                                </div>
                            </td>

                            <td className="px-1 py-1">
                                <div className="space-y-2">
                                </div>
                            </td>
                        </tr>
                    </Fragment>
                ))}
            </tbody> 
        </table>
        </div>        
    )

}