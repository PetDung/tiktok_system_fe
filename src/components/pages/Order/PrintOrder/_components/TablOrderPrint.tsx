"use client";

import { formatDate, Order, PrintShop } from "@/service/types/ApiResponse";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import OrderItemModalView from "./OrderItemModalView";
import { CategoryPrintPrinteesHub, ProductMenPrint } from "@/service/print-order/getSKU";
import OptionalSelect, { Option } from "@/components/UI/OptionalSelect";
import { changePrinterStatus, updatePrinterOrder, updatePrintShippMethod } from "@/service/order/order-service";
import { PrintShippMethod } from "@/service/types/PrintOrder";
import LoadingOverlay from "@/components/UI/LoadingOverlay";
import { SKUMPK } from "@/service/print-order/data";

export type OrderWithFlag = Order & { _isRemoving?: boolean };

type Props = {
    orderList: OrderWithFlag[];
    variationsPrinteesHub: CategoryPrintPrinteesHub[];
    productMenPrint: ProductMenPrint[];
    printers: PrintShop[];
    setOrder: React.Dispatch<React.SetStateAction<Order[]>>;
    printShippingMethods: PrintShippMethod[],
    skuMPK: SKUMPK[]
};

export type Attribute = {
    name: string;
    printOrigin: string;
    key: string;
    level: number;
};
export type AttributeFull = {
    attribute: Attribute[];
    orderOrigin: any[];
    code: string;
};

export const optionsChangeStatus: Option[] =
    [
        { label: "Xem xét", value: "REVIEW" },
        { label: "Đợi", value: "AWAITING" },
        { label: "Sẵn sàng in", value: "PRINTED" },
        { label: "Yêu cầu in", value: "PRINT_REQUEST" },
        { label: "In thất bại", value: "PRINT_REQUEST_FAIL", hidden: true },
        { label: "Hủy In", value: "PRINT_CANCEL", hidden: true },
        { label: "Đã đặt in", value: "PRINT_REQUEST_SUCCESS", hidden: true },
    ]
export default function TablOrderPrint({
    orderList,
    variationsPrinteesHub,
    productMenPrint,
    printers,
    setOrder,
    printShippingMethods,
    skuMPK
}: Props) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orderSelect, setOrderSelect] = useState<Order | null>(null);
    const [attribute, setAttribute] = useState<AttributeFull | null>(null);
    const [loadingOverlay, setLoadingOverLay] = useState<boolean>(false);

    useEffect(() => {
        if (orderSelect) {
            const updatedOrder = orderList.find((o) => o.id === orderSelect.id);
            if (updatedOrder) setOrderSelect(updatedOrder);
        }
    }, [orderList]);


    const attributeMap: Record<string, AttributeFull> = useMemo(() => {
        const attributeMenPrint: Attribute[] = productMenPrint.map((item) => ({
            name: `${item.category} - ${item.name}`,
            printOrigin: "MP",
            key: item.product_code,
            level: 0,
        }));

        const namesSet = new Set<string>();
        variationsPrinteesHub.forEach((cat) => {
            namesSet.add(cat.name);
        });

        const attributePrinteesHub: Attribute[] = Array.from(namesSet).map((item) => ({
            name: item,
            printOrigin: "PRH",
            key: item,
            level: 0,
        }));

        const attriuteMKP :Attribute [] = skuMPK.map(item => ({
            name : item.sku,
            printOrigin: "MKP",
            key: item.sku,
            level: 0
        }))

        return {
            MP: {
                attribute: attributeMenPrint,
                orderOrigin: productMenPrint,
                code: "MP",
            },
            PRH: {
                attribute: attributePrinteesHub,
                orderOrigin: variationsPrinteesHub,
                code: "PRH",
            },
            MKP: {
                attribute: attriuteMKP,
                orderOrigin: skuMPK,
                code: "MKP",
            },
        };
    }, [variationsPrinteesHub, productMenPrint, skuMPK]);

    const optionPrint: Option[] = useMemo(() => {
        return printers.map((item) => ({
            value: item.id,
            label: item.name,
        }));
    }, [printers]);

    const optionPrintShippingMethod = useMemo(() => {
        const map: Record<string, Option[]> = {};

        printShippingMethods.forEach((method) => {
        if (!map[method.printCode]) {
            map[method.printCode] = [];
        }
        const option: Option = {
            value : method.type,
            label : method.type
        }
            map[method.printCode].push(option);
        });
    return map;
    }, [printShippingMethods]);

    const updatePrinter = async (orderId: string, printerId: string | null) => {
        try {
            const finalPrinterId = !printerId ? "REMOVE" : printerId;
            const response = await updatePrinterOrder(orderId, finalPrinterId);
            const newOrder = response.result;
            updateAOrder(newOrder);
        } catch (e: any) {
            console.error("Update printer error:", e);
            alert(e.message || "Lỗi khi cập nhật máy in");
        }
    };
    const handlUpdatePrintShippingMethod = async (orderId: string, medthod: string | null) => {
        try {
            const response = await updatePrintShippMethod(orderId, medthod)
            const newOrder = response.result;
            updateAOrder(newOrder);
        } catch (e: any) {
            console.error("Update printer error:", e);
            alert(e.message || "Lỗi khi cập nhật máy in");
        }
    };
    const handleClickOrder = (order: Order) => {
        setIsModalOpen(true);
        setOrderSelect(order);
        if (!order.printer) setAttribute(null);
        else setAttribute(attributeMap[order.printer.code]);
    };

    const changStausOrderPrint = async (order: Order | null, status: string | null) => {
        if(!order) return;
        if(order.print_status === status) return;
        if ((status === "PRINTED" || status === "PRINT_REQUEST") 
            && (order.print_status === "PRINT_CANCEL")) {
            if (!order.printer) {
                alert("Vui lòng chọn nhà in trước");
                throw new Error("Vui lòng chọn nhà in trước")
            }

            const missingSku = order.line_items.some(item => (!item.print_sku && item.is_print));
            if (missingSku) {
                alert("Vui lòng set up dịch vụ in cho tất cả sản phẩm trước!");
                throw new Error("Vui lòng chọn nhà in trước")
            }
            const missingDesgin = order.line_items.some(item => (!item.print_sku && item.is_print));
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
        setOrder((prevOrders) =>
            prevOrders.map((o) => (o.id === newOrder.id ? newOrder : o))
        );
    };

    const removeAOrder = (orderId: string) => {
        // Gắn flag để animate trước khi xóa
        setOrder((prevOrders: any) =>
            prevOrders.map((o: any) =>
                o.id === orderId ? { ...o, _isRemoving: true } : o
            )
        );

        // Xóa thật sau khi animate xong
        setTimeout(() => {
            setOrder((prevOrders: any) => prevOrders.filter((o: any) => o.id !== orderId));
        }, 300);
    };

    return (
        <div>
            {isModalOpen && (
                <OrderItemModalView
                    changStausOrderPrint={changStausOrderPrint}
                    order={orderSelect}
                    onClose={() => setIsModalOpen(false)}
                    attribute={attribute}
                />
            )}

            <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-300 sticky top-0 z-10 shadow-sm text-xs">
                    <tr>
                        <th className="px-1 py-1 text-left font-semibold text-gray-700">STT</th>
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
                          <tr
                            className={`
                                transition-all duration-700 ease-linear
                                ${order._isRemoving 
                                ? "opacity-0 -translate-x-200"   // trượt sang trái + mờ dần
                                : "opacity-100"}
                                hover:bg-blue-50 cursor-pointer
                            `}
                            >   
                                <td className="px-1 py-1 text-xs">{idx + 1}</td>
                                <td className="px-1 py-1 text-xs">
                                    <div className="text-gray-800 font-bold mb-1">{order.shop_name}</div>
                                    <div className="text-gray-600 text-sm font-medium">ID: {order.id}</div>
                                    <div className="text-gray-500 text-sm">
                                        Tracking:{" "}
                                        {order.tracking_number || (
                                            <span className="text-red-500 font-medium">Chưa có</span>
                                        )}
                                    </div>
                                    <div className="text-gray-400 text-xs mt-1">
                                        {formatDate(order.create_time)}
                                    </div>
                                </td>

                                <td
                                    onClick={() => handleClickOrder(order)}
                                    className="px-1 py-1 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                                >
                                    <div className="flex flex-wrap gap-2">
                                        {order.line_items.map((item, i) => (
                                            <div
                                                key={i}
                                                className={`relative group border-2 ${item.design ? "border-green-500" : "border-red-700"
                                                    }`}
                                            >
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
                                     <div className="flex flex-col gap-2">
                                         <OptionalSelect
                                            value={order?.printer?.id ?? null}
                                            options={optionPrint}
                                            placeholder="Nhà in"
                                            size={150}
                                            onChange={(value) => updatePrinter(order.id, value)}
                                        />
                                        <OptionalSelect
                                            value={order?.print_shipping_method?? null}
                                            options={optionPrintShippingMethod[order?.printer?.id ?? ""] || []}
                                            placeholder="Ship"
                                            disabled = {!optionPrintShippingMethod[order?.printer?.id ?? ""]}
                                            size={150}
                                            onChange={(value) => handlUpdatePrintShippingMethod(order.id, value)}
                                        />
                                     </div>
                                </td>
                                <td className="px-1 py-1">
                                    <span
                                        className={`px-1 py-1 rounded-full text-white shadow-sm text-xs ${order.status === "CANCELLED"
                                            ? "bg-red-500"
                                            : order.status === "COMPLETED"
                                                ? "bg-green-500"
                                                : order.status === "DELIVERED"
                                                    ? "bg-blue-500"
                                                    : "bg-orange-500"
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
                                        <div className="font-semibold text-gray-800">
                                            {order.recipient_address.name}
                                        </div>
                                        <div className="text-xs text-gray-600">
                                            {order.recipient_address.phone_number}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {order.recipient_address.address_detail}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {order.recipient_address.district_info
                                                .map((d) => d.address_name)
                                                .join(", ")}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {order.recipient_address.postal_code}
                                        </div>
                                    </div>
                                </td>

                                <td className="px-1 py-1">
                                    <OptionalSelect
                                        value={order?.print_status?? null}
                                        options={optionsChangeStatus}
                                        placeholder="Trạng thái"
                                        size={150}
                                        allowClear = {false}
                                        onChange={(value) => changStausOrderPrint(order, value)}
                                    />
                                </td>

                            </tr>
                        </Fragment>
                    ))}
                </tbody>
            </table>
             <LoadingOverlay show= {loadingOverlay}/>
        </div>
    );
}
