import { formatDate, Order, PrintShop } from "@/service/types/ApiResponse";
import { Img } from "react-image";
import { Printer, Truck, X } from "lucide-react";
import OptionalSelect, { Option } from "@/components/UI/OptionalSelect";
import { optionsChangeStatus, OrderWithFlag } from "./TablOrderPrint";

interface Prop {
    order: OrderWithFlag
    cancel: (order: Order) => void;
    changStausOrderPrint: (order: Order, status: string | null) => void;
}

const OrderPrintSuccessCard = ({ order, cancel, changStausOrderPrint }: Prop) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "CANCELLED":
                return "bg-red-500 text-white";
            case "PRINT_CANCE":
                return "bg-red-500 text-white";    
            case "COMPLETED":
                return "bg-green-500 text-white";
            case "DELIVERED":
                return "bg-blue-500 text-white";
            default:
                return "bg-orange-500 text-white";
        }
    };

    return (
        <div className={`transition-all duration-700 ease-linear${order._isRemoving
                ? "opacity-0 -translate-x-200"   // trượt sang trái + mờ dần
                : "opacity-100"}
                 hover:bg-blue-50 cursor-pointer
        `}>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-visible" >
                {/* Header */}
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-700">
                            <a
                                href={`/order-all-shop?order_id=${order.id}`}
                                className="text-blue-600 hover:underline hover:text-blue-800 transition"
                            >
                                #{order.id}
                            </a>
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.print_status}
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="p-4">
                    <div className="flex items-center justify-between gap-4">
                        {/* Product Images */}
                        <div className="flex-1">
                            <p className="text-xs font-medium text-gray-500 mb-2">Sản phẩm</p>
                            <div className="flex items-center space-x-2">
                                {order.line_items.slice(0, 4).map((item, index) => (
                                    <div key={item.id} className="relative group">
                                        <Img
                                            src={item.sku_image}
                                            className="w-12 h-12 object-cover rounded-lg border border-gray-200 group-hover:border-blue-300 transition-colors"
                                            loading="lazy"
                                        />
                                        {index === 3 && order.line_items.length > 4 && (
                                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                                <span className="text-white text-xs font-medium">
                                                    +{order.line_items.length - 3}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Printer & Shipping Info */}
                        <div className="flex-1">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-700 font-medium">
                                        Track: {order.tracking_number}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-700 font-bold">
                                        {order.shipping_type} SHIP
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-700 font-medium">
                                        Dự kiến: {order.payment_amount} $
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-700 font-medium">
                                        Cost: {order.cost} $
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-gray-700 font-medium">
                                        Thực tế: {order.settlement?.settlement_amount}$
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <Printer className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm text-gray-700 font-medium">
                                        {order.printer.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Truck className="w-3 h-3 text-gray-400" />
                                    <span className="text-sm text-gray-600">
                                        {order.print_shipping_method}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-600">
                                        Order fullfil: {order.order_fulfill_id}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col items-end gap-2">
                            {order.print_status === "PRINT_REQUEST_SUCCESS" ? (
                                <button
                                    onClick={() => cancel(order)}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-medium rounded-lg border border-red-200 hover:bg-red-100 hover:border-red-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={order.status === "CANCELLED" || order.status === "COMPLETED"}
                                >
                                    <X className="w-3 h-3" />
                                    Hủy In
                                </button>
                            ) : (
                                <OptionalSelect
                                    value={order?.print_status?? null}
                                    options={optionsChangeStatus}
                                    placeholder="Trạng thái"
                                    allowClear= {false}
                                    disabled={order.print_status === "PRINTED"}
                                    size={150}
                                    onChange={(value) => changStausOrderPrint(order, value)}
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer - Optional additional info */}
                <div className="bg-gray-50 px-4 py-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs font-bold text-gray-500">
                        <span>Tạo đơn: {formatDate(order.create_time)}</span>
                        <span>Ngày in: {formatDate(order.create_print_time)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderPrintSuccessCard