import { LineItem, Order } from "@/service/types/ApiResponse";
import OrderItemCard from "./OrderItemCard";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AttributeFull, optionsChangeStatus } from "./TablOrderPrint";
import ModalDesignAdd from "./ModalDesignAdd";
import OptionalSelect from "@/components/UI/OptionalSelect";

type ModalProps = {
  onClose: () => void;
  order: Order | null;
  attribute: AttributeFull | null;
  changStausOrderPrint: (order: Order | null, value: any) => Promise<void>;
};

export type LineItemHasQuantity = {
  lineItem: LineItem;
  quantity: number;
};

export default function OrderItemModalView({
  onClose,
  order,
  attribute,
  changStausOrderPrint,
}: ModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectItem, setSelectItem] = useState<LineItem | null>(null);

  const lineItemsWithQuantity: LineItemHasQuantity[] = useMemo(() => {
    if (!order) return [];

    const lineItemsWithQuantityMap: Record<string, LineItemHasQuantity> = {};
    order.line_items.forEach((item) => {
      if (lineItemsWithQuantityMap[item.sku_id]) {
        lineItemsWithQuantityMap[item.sku_id].quantity += 1;
      } else {
        lineItemsWithQuantityMap[item.sku_id] = { lineItem: item, quantity: 1 };
      }
    });

    return Object.values(lineItemsWithQuantityMap).sort(
      (a, b) => a.lineItem.product_name.localeCompare(b.lineItem.product_name) // A -> Z
    );
  }, [order]);

  useEffect(() => {
    if (order && selectItem) {
      const updated = order.line_items.find((li) => li.id === selectItem.id);
      if (updated) setSelectItem(updated);
    }
  }, [order]);

  const openModalDesignAdd = (item: LineItem) => {
    setIsModalOpen(true);
    setSelectItem(item);
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg w-[700px] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-2 items-center justify-between shadow-sm z-10 flex">
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Set up in
          </h4>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-red-700 transition-colors"
          >
            <X />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {lineItemsWithQuantity.map((item) => (
            <OrderItemCard
              openAddDesign={openModalDesignAdd}
              attribute={attribute}
              key={item.lineItem.id}
              item={item}
            />
          ))}
        </div>

        {/* Footer (always bottom) */}
        <div className="border-t p-6 bg-white">
          <OptionalSelect
            value={order?.print_status ?? null}
            options={optionsChangeStatus}
            placeholder="Trạng thái"
            size={150}
            allowClear={false}
            onChange={(value) => {
              changStausOrderPrint(order, value)
              .then(() =>onClose());
            }}
          />
        </div>
      </div>

      {isModalOpen && (
        <ModalDesignAdd item={selectItem} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
