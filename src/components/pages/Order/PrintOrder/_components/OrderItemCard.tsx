"use client"
import ThumbPreview from "@/components/pages/Design/_components/ThumbPreview";
import { LineItemHasQuantity } from "./OrderItemModalView";
import { AttributeFull } from "./TablOrderPrint";
import { useEffect, useMemo, useState } from "react";
import { CategoryPrintPrinteesHub, getSkuMenPrint, MenPrintSku, Variation } from "@/service/print-order/getSKU";
import { updatePrinterSku } from "@/service/order/order-service";
import { LineItem } from "@/service/types/ApiResponse";
import { X } from "lucide-react";
import { clearDesignInItem } from "@/service/design/design-service";
import { PrintSkuRequest } from "@/service/types/PrintOrder";
import { useFetch } from "@/lib/useFetch";

export type OptionSelect = {
    type: string;
    size: string;
    color: string;
};

export default function OrderItemCard({
    item,
    attribute,
    openAddDesign,
    disabledSelect = false
}: {
    item: LineItemHasQuantity;
    attribute: AttributeFull | null;
    openAddDesign: (data: LineItem) => void;
    disabledSelect?: boolean
}) {
    const [optionSelect, setOptionSelect] = useState<OptionSelect>({
        type: "",
        size: "",
        color: "",
    });
    const { data: skuMenPrintRs, isLoading: loadingColors } = useFetch<MenPrintSku[]>({
        fetcher: getSkuMenPrint,
        key: "men-print-sku",
        param : optionSelect.type
    });

    const  skuMenPrint = skuMenPrintRs ? skuMenPrintRs : [] ;

    /** Lấy danh sách màu dựa vào type đã chọn */
    const colors: string[] = useMemo(() => {
        if (!attribute || !optionSelect.type) return [];
         console.log(item.lineItem.id)
        if (attribute.code === "PRH") {
            const orderOrigin = attribute.orderOrigin as CategoryPrintPrinteesHub[];
            const matched = orderOrigin.find((o) => o.name === optionSelect.type);
            if (!matched) return [];
            return Array.from(new Set(matched.variations.map((v: Variation) => v.color)));
        }
        if (attribute.code === "MP") {
            return Array.from(new Set(skuMenPrint.map(item => item.color)));

        }
        return []
    }, [attribute, optionSelect.type, skuMenPrint]);

    /** Lấy danh sách size dựa vào type + color đã chọn */
    const sizes: string[] = useMemo(() => {
        if (
            !attribute ||
            !optionSelect.type ||
            !optionSelect.color
        )
            return [];
        if (attribute.code === "PRH") {
            const orderOrigin = attribute.orderOrigin as CategoryPrintPrinteesHub[];
            const matched = orderOrigin.find((o) => o.name === optionSelect.type);
            if (!matched) return [];
            return Array.from(
                new Set(
                    matched.variations
                        .filter((v: Variation) => v.color === optionSelect.color)
                        .map((v: Variation) => v.size)
                )
            );

        }
        if (attribute.code === "MP") {
            return Array.from(
                new Set(
                    skuMenPrint
                        .filter((v: Variation) => v.color === optionSelect.color)
                        .map((v: Variation) => v.size)
                )
            );
        }
        return [];
    }, [attribute, optionSelect.type, optionSelect.color, skuMenPrint]);


    const sku: string | null = useMemo(() => {
        if (!attribute || !optionSelect.type || !optionSelect.color || !optionSelect.size) {
            return null;
        }
        if (attribute.code === "PRH") {
            const orderOrigin = attribute.orderOrigin as CategoryPrintPrinteesHub[];
            const matchedCategory = orderOrigin.find(
                (cat) => cat.name === optionSelect.type
            );
            if (!matchedCategory) return null;

            const matchedVariation = matchedCategory.variations.find(
                (v) =>
                    v.color === optionSelect.color &&
                    v.size === optionSelect.size
            );
            return matchedVariation ? matchedVariation.sku : null;
        }
        if (attribute.code === "MP") {
            const matchedVariation = skuMenPrint.find(
                (v) =>
                    v.color === optionSelect.color &&
                    v.size === optionSelect.size
            );
            return matchedVariation ? matchedVariation.sku : null;
        }
        return null;
    }, [attribute, optionSelect]);

    const skuOption = useMemo(() => {
        const lineItem = item.lineItem;

        if(!lineItem.print_sku) return "Chưa có"

        return `${lineItem.print_sku.type} 
                -${lineItem.print_sku.value1}
                -${lineItem.print_sku.value2}
                ` 
    }, [item])


    useEffect(() => {
        if (!sku) return;

        const printSku: PrintSkuRequest = {
            skuCode: sku,
            value1 : optionSelect.color,
            value2 : optionSelect.size,
            type: optionSelect.type
        }

        const updateSku = async () => {
            try {
                await updatePrinterSku(item.lineItem.id, printSku)
                console.log("✅ SKU updated:", sku);
            } catch (err) {
                alert("❌ Update SKU failed");
            }
        };
        updateSku();
    }, [sku, item.lineItem.id]);

    const clear = async (id: string) => {
        try {
            await clearDesignInItem(id);
        } catch (e: any) {
            console.error("Lỗi fetch SKU:", e.message);
            alert("Lỗi!");
        }
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 mb-2">
            <div className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                    <ThumbPreview size={60} thumbUrl={item.lineItem.sku_image} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-1 truncate overflow-hidden whitespace-nowrap">
                        {item.lineItem.product_name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">Loại: {item.lineItem.sku_name}</p>
                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    <p className="text-sm text-gray-600">
                        Sku code: {item.lineItem.print_sku?.skuCode?? "Chưa có" }
                    </p>
                    <p className="text-sm text-gray-600">
                        Sku: {skuOption}
                    </p>
                </div>
                <div className="flex-shrink-0">
                    {item.lineItem.design?.thumbnail ? (
                        <div className="relative">
                            <ThumbPreview size={60} thumbUrl={item.lineItem.design.thumbnail} />
                            {!disabledSelect && (
                                <button 
                                    type="button"
                                    onClick={() => clear(item.lineItem.id)}
                                    className="absolute top-0 right-0 bg-white rounded-full w-5 h-5 flex items-center justify-center text-red-500 shadow-md hover:bg-gray-100"
                                >
                                    <X />
                                </button>
                            )}
                        </div>
                    ) : (
                        <div
                            onClick={() => openAddDesign(item.lineItem)}
                            className="w-15 h-15 flex items-center justify-center border border-gray-300 rounded cursor-pointer">
                            <span className="text-2xl text-gray-400">+</span>
                        </div>
                    )}
                </div>
            </div>

           {
            !disabledSelect &&  <div className="flex justify-center gap-3 pt-2 border-t border-gray-100">
                {attribute ? (
                    <>
                        {/* Type */}
                        <div>
                            <input
                                list="type-options"
                                value={optionSelect.type}
                                onChange={(e) =>
                                    setOptionSelect({ type: e.target.value, color: "", size: "" })
                                }
                                disabled={disabledSelect}
                                className="px-3 min-w-[120px] max-w-[200px] py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="-- Type --"
                            />
                            <datalist id="type-options">
                                {attribute.attribute.map((t) => (
                                    <option key={t.key} value={t.key}>
                                        {t.name}
                                    </option>
                                ))}
                            </datalist>
                        </div>

                        {/* Color */}
                        <div>
                            <input
                                list="color-options"
                                value={optionSelect.color}
                                onChange={(e) =>
                                    setOptionSelect({ ...optionSelect, color: e.target.value, size: "" })
                                }
                                disabled={!optionSelect.type || disabledSelect}
                                className="px-3 min-w-[120px] py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder={loadingColors ? "Đang tải..." : "-- Color --"}
                            />
                            <datalist id="color-options">
                                {colors.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </div>

                        {/* Size */}
                        <div>
                            <input
                                list="size-options"
                                value={optionSelect.size}
                                onChange={(e) =>
                                    setOptionSelect({ ...optionSelect, size: e.target.value })
                                }
                                disabled={!optionSelect.color  || disabledSelect}
                                className="px-3 min-w-[120px] py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="-- Size --"
                            />
                            <datalist id="size-options">
                                {sizes.map((s) => (
                                    <option key={s} value={s} />
                                ))}
                            </datalist>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-gray-500 italic">Vui lòng chọn nhà in trước</p>
                )}
            </div>

           }

        </div>
    );
}
