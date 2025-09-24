import { LineItem, Order } from "@/service/types/ApiResponse";
import OrderItemCard from "./OrderItemCard";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Attribute, AttributeFull } from "./TablOrderPrint";
import ModalDesignAdd from "./ModalDesignAdd";

type ModalProps = {
    onClose: () => void;
    order:  Order | null;
    attribute: AttributeFull | null;
};

export type LineItemHasQuantity = {
    lineItem : LineItem;
    quantity : number
}

export default function OrderItemModalView({onClose, order, attribute }: ModalProps) {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectItem, setSelectItem] = useState<LineItem | null>(null);
    
    const lineItemsWithQuantity: LineItemHasQuantity[] = useMemo(() => {
        if(!order) return []
        const lineItemsWithQuantityMap: Record<string, LineItemHasQuantity> = {};
        order.line_items.forEach((item) => {
            if (lineItemsWithQuantityMap[item.sku_id]) {
                lineItemsWithQuantityMap[item.sku_id].quantity += 1;
            } else {
                lineItemsWithQuantityMap[item.sku_id] = { lineItem: item, quantity: 1 };
            }
        });
        return Object.values(lineItemsWithQuantityMap);
    }, [order])

    useEffect(() => {
        if (order && selectItem) {
            const updated = order.line_items.find(li => li.id === selectItem.id);
            if (updated) setSelectItem(updated);
        }
    }, [order]);

    const openModalDesignAdd = (item : LineItem)=>{
        setIsModalOpen(true)
        setSelectItem(item)
    }
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
                        <OrderItemCard 

                            openAddDesign={openModalDesignAdd}
                            attribute={attribute} 
                            key={item.lineItem.id}  
                            item={item}  
                        />
                    ))}
                </div>

            </div>
            {
                isModalOpen && 
                <ModalDesignAdd
                    item={selectItem}
                    onClose={() =>setIsModalOpen(false)}
                />
            }
        </div>
    );
}