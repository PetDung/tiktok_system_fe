"use client"

import { formatDate, LineItem, Order, PrintShop } from "@/service/types/ApiResponse"
import { Dispatch, Fragment, SetStateAction, useEffect, useMemo, useState } from "react"
import OrderItemModalView from "./OrderItemModalView"
import { CategoryPrintPrinteesHub, getVariationsMenPrint, getVariationsPrinteesHub, ProductMenPrint } from "@/service/print-order/getSKU"
import { getAllPrinter } from "@/service/print/print-service"
import OptionalSelect, { Option } from "@/components/UI/OptionalSelect"
import { changePrinterStatus, updatePrinterOrder } from "@/service/order/order-service"
import ActionDropdown from "@/components/UI/ActionDropdown"

type Props = {
    orderList: Order[]
    setOrders: Dispatch<SetStateAction<Order[]>>;
    variationsPrinteesHub : CategoryPrintPrinteesHub[];
    productMenPrint: ProductMenPrint[];
    printers: PrintShop []
}

export type Attribute = {
    name : string;
    printOrigin : string;
    key : string;
    level : number;
}
export type AttributeFull = {
    attribute : Attribute[],
    orderOrigin: any[]
    code : string;
}
export default function TablOrderPrint({ orderList, setOrders, variationsPrinteesHub, productMenPrint, printers  }: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderSelect, setOrderSelect] = useState<Order | null>(null);
    const [attribute, setAttribute ] = useState<AttributeFull | null>(null);
    useEffect(() => {
        if (orderSelect) {
            const updatedOrder = orderList.find(o => o.id === orderSelect.id);
            if (updatedOrder) setOrderSelect(updatedOrder);
        }
    }, [orderList]);

    const attributeMap : Record<string, AttributeFull> = useMemo(() => {
        const attributeMenPrint: Attribute[] = productMenPrint.map(item => ({
                name: `${item.category} - ${item.name}`,
                printOrigin: "MP",
                key : item.product_code,
                level: 0
        }));
        const namesSet = new Set<string>();
        variationsPrinteesHub.forEach(cat => {
            namesSet.add(cat.name); // gom name
        });
        const attributePrinteesHub: Attribute[] = Array.from(namesSet).map(item => ({
            name: item,
            printOrigin: "PRH",
            key : item,
            level: 0
        }));

        return {
            MP : {
                attribute : attributeMenPrint,
                orderOrigin : productMenPrint,
                code : "MP"
            },
            PRH :  {
                attribute : attributePrinteesHub,
                orderOrigin : variationsPrinteesHub,
                code : "PRH"
            },
        }
    },[variationsPrinteesHub, productMenPrint])

    const optionPrint: Option[] = useMemo(() => {
        return printers.map(item => ({
            value: item.id,
            label: item.name
        }))
    }, [printers])



    const updatePrinter = async (orderId: string, printerId: string | null) => {
        try {
            const finalPrinterId = !printerId ? "REMOVE" : printerId;
            const response = await updatePrinterOrder(orderId, finalPrinterId);

            setOrders(prev =>
                prev.map(order =>
                    order.id === orderId ? { ...response.result } : order
                )
            );
        } catch (e: any) {
            console.error('Update printer error:', e);
            alert(e.message || "Lỗi khi cập nhật máy in");
        }
    }

    const handleClickOrder = (order : Order) =>{
        setIsModalOpen(true)
        setOrderSelect(order)
        if(!order.printer) setAttribute(null)
        else setAttribute(attributeMap[order.printer.code])
    }

    const changStausOrderPrint = async (order : Order, status :string) =>{
          try {
            changePrinterStatus(order.id, status);
        } catch (e: any) {
            console.error('Update printer error:', e);
            alert(e.message || "Lỗi khi cập nhật máy in");
        }
    }

    return (
        <div>
            {isModalOpen &&
                <OrderItemModalView
                    order={orderSelect}
                    onClose={() => setIsModalOpen(false)}
                    attribute={attribute}
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
                                    onClick={() => handleClickOrder(order)}
                                    className="px-1 py-1 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {order.line_items.map((item, i) => (
                                            <div key={i} className={`relative group border-2 ${item.design ? "border-green-500" : "border-red-700"}`}>
                                                <img
                                                    src={item.sku_image}
                                                    alt={item.product_name}
                                                    className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-1 py-1">
                                    <OptionalSelect
                                        value={order?.printer?.id ?? null}
                                        options={optionPrint}
                                        placeholder="Nhà in"
                                        size={150}
                                        onChange={(value) => updatePrinter(order.id, value)}
                                    />
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

                                <td className="px-1 py-1 relative">
                                    <ActionDropdown
                                        options={[
                                            { label: "Review", onClick: () => changStausOrderPrint(order, "REVIEW") },
                                            { label: "Đợi", onClick: () => changStausOrderPrint(order, "AWAITING") },
                                            { label: "Sẵn sàng in", onClick: () => changStausOrderPrint(order, "PRINTED") },
                                        ]}
                                    />
                                </td>

                            </tr>
                        </Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    )

}