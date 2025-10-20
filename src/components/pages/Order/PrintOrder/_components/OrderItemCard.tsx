"use client"
import ThumbPreview from "@/components/pages/Design/_components/ThumbPreview";
import { LineItemHasQuantity } from "./OrderItemModalView";
import { AttributeFull } from "./TablOrderPrint";
import { useEffect, useMemo, useState, memo, useCallback } from "react";
import { CategoryPrintPrinteesHub, getSkuMenPrint, getSkuMongoTeePrint, MangoTeePrintSKU, MenPrintSku, Variation } from "@/service/print-order/getSKU";
import { updateIsPrinter, updatePrinterSku } from "@/service/order/order-service";
import { LineItem } from "@/service/types/ApiResponse";
import {Printer } from "lucide-react";
import { clearDesignInItem } from "@/service/design/design-service";
import { PrintSkuRequest } from "@/service/types/PrintOrder";
import { useFetch } from "@/lib/useFetch";
import { SKUMPK, ValueMKP } from "@/service/print-order/data";
import DesignPreview from "./DesignPreview";

export type OptionSelect = {
    type: string;
    size: string;
    color: string;
    value3: null | string;
    value4: null | string;
};

const OrderItemCard = memo(function OrderItemCard({
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
        type: item.lineItemFist.print_sku?.type || "",
        size: item.lineItemFist.print_sku?.value2 || "",
        color: item.lineItemFist.print_sku?.value1 || "",
        value3: item.lineItemFist.print_sku?.value3 || "14x16",
        value4: item.lineItemFist.print_sku?.value4 || "14x16",
    });
    const [isPrintEnabled, setIsPrintEnabled] = useState<boolean | null>(item.lineItemFist.is_print);

    // Fetch SKU data based on selected type
    const { data: skuMenPrintRs, isLoading: loadingColors } = useFetch<MenPrintSku[]>({
        fetcher: getSkuMenPrint,
        key: `men-print-sku-${optionSelect.type}`,
        param: optionSelect.type,
        enabled: !!optionSelect.type && attribute?.code === "MP"
    });

    const { data: skuMangoTeePrintRs, isLoading: isLoadingColorMango } = useFetch<MangoTeePrintSKU[]>({
        fetcher: getSkuMongoTeePrint,
        key: `mango-print-sku-${optionSelect.type}`,
        param: optionSelect.type,
        enabled: !!optionSelect.type && attribute?.code === "MG"
    });

    const skuMenPrint = skuMenPrintRs || [];
    const skuMango = skuMangoTeePrintRs || [];

    /** Lấy danh sách màu dựa vào type đã chọn */
    const colors: string[] = useMemo(() => {
        if (!attribute || !optionSelect.type) return [];
        
        switch (attribute.code) {
            case "PRH": {
                const orderOrigin = attribute.orderOrigin as CategoryPrintPrinteesHub[];
                const matched = orderOrigin.find((o) => o.name === optionSelect.type);
                if (!matched) return [];
                return Array.from(new Set(matched.variations.map((v: Variation) => v.color)));
            }
            case "MP": {
                return Array.from(new Set(skuMenPrint.map(item => item.color)));
            }
            case "MG": {
                const value =  Array.from(new Set(skuMango.map(item => item.color)));
                console.log(skuMango);
                return Array.from(new Set(skuMango.map(item => item.color)));
            }
            case "MKP": {
                const orderOrigin = attribute.orderOrigin as SKUMPK[];
                const matched = orderOrigin.find((o) => o.sku === optionSelect.type);
                if (!matched) return [];
                return Array.from(new Set(matched.varriants.map(item => item.color)));
            }
            default:
                return [];
        }
    }, [attribute, optionSelect.type, skuMenPrint, skuMango]);

    /** Lấy danh sách size dựa vào type + color đã chọn */
    const sizes: string[] = useMemo(() => {
        if (!attribute || !optionSelect.type || !optionSelect.color) return [];
        
        switch (attribute.code) {
            case "PRH": {
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
            case "MP": {
                return Array.from(
                    new Set(
                        skuMenPrint
                            .filter((v: MenPrintSku) => v.color === optionSelect.color)
                            .map((v: MenPrintSku) => v.size)
                    )
                );
            }
            case "MG": {
                const value = Array.from(
                    new Set(
                        skuMango
                            .filter((v: MangoTeePrintSKU) => v.color === optionSelect.color)
                            .map((v: MangoTeePrintSKU) => v.size)
                    )
                );
                console.log(value)
                return value;
            }
            case "MKP": {
                const orderOrigin = attribute.orderOrigin as SKUMPK[];
                const matched = orderOrigin.find((o) => o.sku === optionSelect.type);
                if (!matched) return [];
                return Array.from(
                    new Set(
                        matched.varriants
                            .filter((v: ValueMKP) => v.color === optionSelect.color)
                            .map((v: ValueMKP) => v.size)
                    )
                );
            }
            default:
                return [];
        }
    }, [attribute, optionSelect.type, optionSelect.color, skuMenPrint, skuMango]);

    const sku: string | null = useMemo(() => {
        if (!attribute || !optionSelect.type || !optionSelect.color || !optionSelect.size) {
            return null;
        }
        
        switch (attribute.code) {
            case "PRH": {
                const orderOrigin = attribute.orderOrigin as CategoryPrintPrinteesHub[];
                const matchedCategory = orderOrigin.find((cat) => cat.name === optionSelect.type);
                if (!matchedCategory) return null;

                const matchedVariation = matchedCategory.variations.find(
                    (v) => v.color === optionSelect.color && v.size === optionSelect.size
                );
                return matchedVariation ? matchedVariation.sku : null;
            }
            case "MP": {
                if(skuMenPrint.length === 0) return null;
                const matchedVariation = skuMenPrint
                    .filter(v => v && v.color && v.size) // Filter out undefined/null items
                    .find(
                        (v) => v.color === optionSelect.color && v.size === optionSelect.size
                    );
                return matchedVariation ? matchedVariation.sku : null;
            }
            case "MG": {
                if(skuMango.length === 0) return null;
                const matchedVariation = skuMango
                    .filter(v => v && v.color && v.size) // Filter out undefined/null items
                    .find(
                        (v) => v.color === optionSelect.color && v.size === optionSelect.size
                    );
                return matchedVariation ? matchedVariation.sku : null;
            }
            case "MKP": {
                const orderOrigin = attribute.orderOrigin as SKUMPK[];
                const matchedCategory = orderOrigin.find((cat) => cat.sku === optionSelect.type);
                if (!matchedCategory) return null;
                return matchedCategory.sku;
            }
            default:
                return null;
        }
    }, [attribute, optionSelect.type, optionSelect.color, optionSelect.size, skuMenPrint, skuMango]);

    const skuOption = useMemo(() => {
        const lineItem = item.lineItemFist;
        if (!lineItem.print_sku) return "Chưa có";
        return `${lineItem.print_sku.type} - ${lineItem.print_sku.value1} - ${lineItem.print_sku.value2}`;
    }, [item.lineItemFist]);

    // Debounced SKU update to prevent excessive API calls
    useEffect(() => {
        if (!sku || !isPrintEnabled) return;

        const timeoutId = setTimeout(() => {
            const printSku: PrintSkuRequest = {
                skuCode: sku,
                value1: optionSelect.color,
                value2: optionSelect.size,
                value3: optionSelect.value3,
                value4: optionSelect.value4,
                type: optionSelect.type
            };

            console.log(printSku);

            const updateSku = async () => {
                try {
                    const ids = item.lineItems.map(item => item.id);
                    await updatePrinterSku(ids, printSku);
                    console.log("✅ SKU updated:", sku);
                } catch (err) {
                    console.error("❌ Update SKU failed:", err);
                    alert("❌ Update SKU failed");
                }
            };
            updateSku();
        }, 500); // 500ms debounce

        return () => clearTimeout(timeoutId);
    }, [sku, optionSelect, isPrintEnabled, item.lineItems]);

    const clear = useCallback(async (id: string[]) => {
        try {
            await clearDesignInItem(id);
        } catch (e: any) {
            console.error("Lỗi clear design:", e.message);
            alert("Lỗi khi xóa thiết kế!");
        }
    }, []);

    const changeIsPrint = useCallback(async (isPrint: boolean) => {
        try {
            setIsPrintEnabled(isPrint);
            const ids = item.lineItems.map(item => item.id);
            await updateIsPrinter(ids, isPrint);
        } catch (err) {
            console.error("❌ Update print status failed:", err);
            setIsPrintEnabled(!isPrint); // Revert on error
            alert("❌ Update print status failed");
        }
    }, [item.lineItems]);

    const handleTypeChange = useCallback((newType: string) => {
        setOptionSelect(prev => ({ 
            ...prev, 
            type: newType, 
            color: "", 
            size: "" 
        }));
    }, []);

    const handleColorChange = useCallback((newColor: string) => {
        setOptionSelect(prev => ({ 
            ...prev, 
            color: newColor, 
            size: "" 
        }));
    }, []);

    const handleSizeChange = useCallback((newSize: string) => {
        setOptionSelect(prev => ({ 
            ...prev, 
            size: newSize 
        }));
    }, []);

    const isLoading = loadingColors || isLoadingColorMango;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 mb-2">
            <div className="flex gap-4 items-start">
                <div className="flex-shrink-0">
                    <ThumbPreview size={60} thumbUrl={item.lineItemFist.sku_image} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 mb-1 truncate overflow-hidden whitespace-nowrap">
                            {item.lineItemFist.product_name}
                        </h3>

                        {/* Print Toggle Switch */}
                        <div className="flex items-center gap-2 ml-2">
                            <Printer className={`w-4 h-4 ${isPrintEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isPrintEnabled ?? false}   // nếu null thì thành false
                                    onChange={(e) => changeIsPrint(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                            <span className="text-xs font-medium text-gray-700">
                                {isPrintEnabled ? 'Bật' : 'Tắt'}
                            </span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-600 mb-1">Loại: {item.lineItemFist.sku_name}</p>
                    <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                    <p className="text-sm text-gray-600">
                        Sku code: {item.lineItemFist.print_sku?.skuCode ?? "Chưa có"}
                    </p>
                    <p className="text-sm text-gray-600">
                        Sku: {skuOption}
                    </p>
                </div>

            </div>
            <div className="flex-shrink-0">
                {item.lineItemFist.design ? (
                    <DesignPreview
                        design={item.lineItemFist.design}
                        disabledSelect={disabledSelect}
                        item={item.lineItemFist}
                        clear={clear}
                        ids={item.lineItems.map(i => i.id)}
                        openAddDesign={openAddDesign}
                    />
                ) : (
                    <div
                        onClick={() => openAddDesign(item.lineItemFist)}
                        className="w-15 h-15 flex items-center justify-center border border-gray-300 rounded cursor-pointer"
                    >
                        <span className="text-2xl text-gray-400">+</span>
                    </div>
                )}
            </div>
            {
                !disabledSelect &&
                <div className="flex gap-3 pt-2 border-t border-gray-100">
                    {attribute && isPrintEnabled ? (
                        <div className="flex flex-col gap-2">
                            <div className="flex gap-2 ">
                                {/* Type */}
                                <div>
                                    <input
                                        list={`type-options-${item.lineItemFist.id}`}
                                        value={optionSelect.type}
                                        onChange={(e) => handleTypeChange(e.target.value)}
                                        disabled={disabledSelect}
                                        className="px-3 min-w-[120px] max-w-[200px] py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="-- Type --"
                                    />
                                    <datalist id={`type-options-${item.lineItemFist.id}`}>
                                        {attribute.attribute.map((t) => (
                                            <option key={`${item.lineItemFist.id}-type-${t.key}`} value={t.key}>
                                                {t.name}
                                            </option>
                                        ))}
                                    </datalist>
                                </div>

                                {/* Color */}
                                <div>
                                    <input
                                        list={`color-options-${item.lineItemFist.id}`}
                                        value={optionSelect.color}
                                        onChange={(e) => handleColorChange(e.target.value)}
                                        disabled={!optionSelect.type || disabledSelect}
                                        className="px-3 min-w-[120px] py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={isLoading ? "Đang tải..." : "-- Color --"}
                                    />
                                    <datalist id={`color-options-${item.lineItemFist.id}`}>
                                        {colors.map((c, index) => (
                                            <option key={`${item.lineItemFist.id}-color-${c}-${index}`} value={c} />
                                        ))}
                                    </datalist>
                                </div>

                                {/* Size */}
                                <div>
                                    <input
                                        list={`size-options-${item.lineItemFist.id}`}
                                        value={optionSelect.size}
                                        onChange={(e) => handleSizeChange(e.target.value)}
                                        disabled={!optionSelect.color || disabledSelect}
                                        className="px-3 min-w-[120px] py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="-- Size --"
                                    />
                                    <datalist id={`size-options-${item.lineItemFist.id}`}>
                                        {sizes.map((s, index) => (
                                            <option key={`${item.lineItemFist.id}-size-${s}-${index}`} value={s} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                            {/* {attribute.code === "MP"  && (
                                <div className="flex items-center gap-3 justify-start text-sm">
                                   {item.lineItemFist.design?.front &&  <label className="flex items-center gap-2">
                                        <span className="text-gray-700">Trước:</span>
                                        <select
                                            value={optionSelect.value3 || "14x16"}
                                            onChange={(e) => setOptionSelect({ ...optionSelect, value3: e.target.value })}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-gray-800 focus:ring-2 focus:ring-gray-200 outline-none"
                                        >
                                            <option value="14x16">14x16</option>
                                            <option value="16x21">16x21</option>
                                            <option value="AOP">AOP</option>
                                        </select>
                                    </label> }

                                   {item.lineItemFist.design?.back &&   <label className="flex items-center gap-2">
                                        <span className="text-gray-700">Sau:</span>
                                        <select
                                            value={optionSelect.value4 || "14x16"}
                                            onChange={(e) => setOptionSelect({ ...optionSelect, value4: e.target.value })}
                                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-gray-800 focus:ring-2 focus:ring-gray-200 outline-none"
                                        >
                                            <option value="14x16">14x16</option>
                                            <option value="16x21">16x21</option>
                                            <option value="AOP">AOP</option>
                                        </select>
                                    </label>}

                                </div>
                            )} */}
                        </div>


                    ) : (
                        <p className="text-sm text-gray-500 italic">Vui lòng chọn nhà in trước hoặc bật in cho sản phẩm</p>
                    )}
                </div>

            }

        </div>
    );
});

export default OrderItemCard;