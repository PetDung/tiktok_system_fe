import { LineItem, Order } from "@/service/types/ApiResponse";
import React, { useRef, useState } from "react";
import ModalProductOrderView from "./ModalProductOrderView";

interface OrderTableProps {
    orders: Order[];
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
}

export default function OrderTable({ orders, loading, hasMore, onLoadMore }: OrderTableProps) {
    const [selectedProducts, setSelectedProducts] = useState<LineItem[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const tableRef = useRef<HTMLDivElement>(null);

    const handleShowProducts = (lineItems: LineItem[]) => {
        setSelectedProducts(lineItems);
        setModalOpen(true);
    };

    const handleScroll = () => {
        if (!tableRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = tableRef.current;

        if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && hasMore) {
            onLoadMore();
        }
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp * 1000).toLocaleString("en-GB", {
            weekday: "long",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
        });
    };

    return (
        <>
            <div
                ref={tableRef}
                onScroll={handleScroll}
                className="relative h-[80vh] overflow-y-auto"
            >
                <table className="w-full border-collapse text-xs">
                    <thead className="bg-gray-100 text-left sticky top-0 z-10">
                        <tr>
                            <th className="px-2 py-1 border">STT</th>
                            <th className="px-2 py-1 border">ORDER ID</th>
                            <th className="px-2 py-1 border">SẢN PHẨM</th>
                            <th className="px-2 py-1 border">TRẠNG THÁI</th>
                            <th className="px-2 py-1 border">TỔNG TIỀN</th>
                            <th className="px-2 py-1 border">KHÁCH HÀNG</th>
                            <th className="px-2 py-1 border">LABEL/TRACKING</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, idx) => (
                            <tr key={order.id} className="hover:bg-gray-50">
                                <td className="px-2 py-1 border leading-tight">{idx + 1}</td>
                                <td className="px-2 py-1 border leading-tight">
                                    {order.shop_name && (
                                        <div className="py-2">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded-sm">{order.shop_name}</span>
                                        </div>
                                    )}
                                    <div>ID: {order.id}</div>
                                    <div>
                                        Tracking:{" "}
                                        {order.tracking_number || (
                                            <span className="text-red-500">Chưa có</span>
                                        )}
                                
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {formatDate(order.create_time)}
                                    </div>
                                </td>
                                <td
                                    className="px-2 py-1 border leading-tight cursor-pointer"
                                    onClick={() => handleShowProducts(order.line_items)}
                                >
                                    <div className="flex gap-1">
                                        {order.line_items.map((item, i) => (
                                            <img
                                                key={i}
                                                src={item.sku_image}
                                                alt={item.product_name}
                                                className="w-8 h-8 object-cover border rounded"
                                            />
                                        ))}
                                    </div>
                                </td>
                                <td className="px-2 py-1 border leading-tight">
                                    <span
                                        className={`px-2 py-0.5 rounded text-white text-xs ${
                                            order.status === "CANCELLED"
                                                ? "bg-red-500"
                                                : "bg-blue-500"
                                        }`}
                                    >
                                        {order.status}
                                    </span>
                                     {order.status === "CANCELLED" && (
                                            <div className="py-1">Lý do: {order.cancel_reason}</div>
                                        )}
                                    <div className="text-xs text-gray-500">
                                        Ship by: {order.shipping_type}
                                    </div>
                                </td>
                                <td className="px-2 py-1 border leading-tight">
                                    {order.payment.total_amount} {order.payment.currency}
                                </td>
                                <td className="px-2 py-1 border leading-tight">
                                    <div className="font-medium">{order.recipient_address.name}</div>
                                    <div>({order.recipient_address.phone_number})</div>
                                    <div>{order.recipient_address.address_detail}</div>
                                    <div>
                                        {order.recipient_address.district_info
                                            .map((d) => d.address_name)
                                            .join(", ")}
                                    </div>
                                    <div>{order.recipient_address.postal_code}</div>
                                </td>
                                <td className="px-2 py-1 border leading-tight">
                                    <button className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs">
                                        Tracking
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {loading && (
                            <tr>
                                <td colSpan={7} className="p-2 text-center text-gray-500">
                                    Đang tải...
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ModalProductOrderView
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                lineItems={selectedProducts}
            />
        </>
    );
}
