import { LineItem } from "@/service/types/ApiResponse";
import OrderItemCard from "./OrderItemCard";
import { X } from "lucide-react";

type ModalProps = {
    onClose: () => void;
    orderItems : LineItem [];
    names : string[];
};

export type LineItemHasQuantity = {
    lineItem : LineItem;
    quantity : number
}

export default function OrderItemModalView({onClose, orderItems,names =[] }: ModalProps) {
    
    const lineItemsWithQuantityMap: Record<string, LineItemHasQuantity> = {};
    orderItems.forEach((item) => {
        if (lineItemsWithQuantityMap[item.sku_id]) {
            lineItemsWithQuantityMap[item.sku_id].quantity += 1;
        } else {
            lineItemsWithQuantityMap[item.sku_id] = { lineItem: item, quantity: 1 };
        }
    });

    const lineItemsWithQuantity: LineItemHasQuantity[] = Object.values(lineItemsWithQuantityMap);


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-lg w-[700px] h-[90vh] overflow-auto">

                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-2 items-center justify-end shadow-sm z-10 flex">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-red-700 transition-colors"
                    >
                        <X />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {lineItemsWithQuantity.map((item, idx) => (
                        <OrderItemCard names={names} key={item.lineItem.id}  item={item}  />
                    ))}
                </div>

            </div>
        </div>
    );
}