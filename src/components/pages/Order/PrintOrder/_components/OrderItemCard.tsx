import ThumbPreview from "@/components/pages/Design/_components/ThumbPreview";
import { LineItemHasQuantity } from "./OrderItemModalView";

export default function OrderItemCard({ item, names} : {item: LineItemHasQuantity, names: string[]}){
    return(
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 mb-2">
            <div className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                    <ThumbPreview
                        size={60}
                        thumbUrl={item.lineItem.sku_image}
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 truncate overflow-hidden whitespace-nowrap">
                        {item.lineItem.product_name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">{item.lineItem.sku_name}</p>
                    <p className="text-sm text-gray-600">{item.quantity}</p>
                </div>
                <div className="flex-shrink-0">
                    <ThumbPreview
                        size={60}
                        thumbUrl={item.lineItem.sku_image}
                    />    
                </div>
            </div>
            
            <div className="flex justify-center gap-3 pt-2 border-t border-gray-100">
                <select className="px-3 min-w-[120px]  py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    {names.map((item) => (
                        <option key={item} value={item}>
                            {item}
                        </option>
                    ))}
                </select>
                <select className="px-3  min-w-[120px] py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                </select>
                <select className="px-3 min-w-[120px] py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>1</option>
                    <option>2</option>
                    <option>3</option>
                </select>
            </div>
        </div>
    )
}