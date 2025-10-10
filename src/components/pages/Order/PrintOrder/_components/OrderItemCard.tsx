"use client"
import ThumbPreview from "@/components/pages/Design/_components/ThumbPreview";
import { LineItemHasQuantity } from "./OrderItemModalView";
import { AttributeFull } from "./TablOrderPrint";
import { useEffect, useMemo, useState } from "react";
import { CategoryPrintPrinteesHub, getSkuMenPrint, MenPrintSku, Variation } from "@/service/print-order/getSKU";
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
        type: item.lineItemFist.print_sku?.type || "",
        size: item.lineItemFist.print_sku?.value2 || "",
        color: item.lineItemFist.print_sku?.value1 || "",
        value3: item.lineItemFist.print_sku?.value3 || "14x16",
        value4: item.lineItemFist.print_sku?.value4 || "14x16",
    });
    const [isPrintEnabled, setIsPrintEnabled] = useState<boolean | null>(item.lineItemFist.is_print);

    const { data: skuMenPrintRs, isLoading: loadingColors } = useFetch<MenPrintSku[]>({
        fetcher: getSkuMenPrint,
        key: "men-print-sku",
        param: optionSelect.type
    });

    const skuMenPrint = skuMenPrintRs ? skuMenPrintRs : [];

    /** Lấy danh sách màu dựa vào type đã chọn */
    const colors: string[] = useMemo(() => {
        if (!attribute || !optionSelect.type) return [];
        if (attribute.code === "PRH") {
            const orderOrigin = attribute.orderOrigin as CategoryPrintPrinteesHub[];
            const matched = orderOrigin.find((o) => o.name === optionSelect.type);
            if (!matched) return [];
            return Array.from(new Set(matched.variations.map((v: Variation) => v.color)));
        }
        if (attribute.code === "MP") {
            return Array.from(new Set(skuMenPrint.map(item => item.color)));

        }
        if (attribute.code === "MKP") {
            const orderOrigin = attribute.orderOrigin as SKUMPK[];
            const matched = orderOrigin.find((o) => o.sku === optionSelect.type);
            if (!matched) return [];
            return Array.from(new Set(matched.varriants.map(item => item.color)));

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
        if (attribute.code === "MKP") {
            const orderOrigin = attribute.orderOrigin as SKUMPK[];
            const matched = orderOrigin.find((o) => o.name === optionSelect.type);
            if (!matched) return [];
            return Array.from(
                new Set(
                    matched.varriants
                        .filter((v: ValueMKP) => v.color === optionSelect.color)
                        .map((v: ValueMKP) => v.size)
                )
            );

        }
        return [];
    }, [attribute, optionSelect, skuMenPrint]);


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
        if (attribute.code === "MKP") {
            const orderOrigin = attribute.orderOrigin as SKUMPK[];
            const matchedCategory = orderOrigin.find(
                (cat) => cat.sku === optionSelect.type
            );
            if (!matchedCategory) return null;
            return matchedCategory.sku;
        }
        return null;
    }, [attribute, optionSelect]);

    const skuOption = useMemo(() => {
        const lineItem = item.lineItemFist;

        if (!lineItem.print_sku) return "Chưa có"

        return `${lineItem.print_sku.type} 
                -${lineItem.print_sku.value1}
                -${lineItem.print_sku.value2}
                `
    }, [item])


    useEffect(() => {
        if (!sku) return;

        const printSku: PrintSkuRequest = {
            skuCode: sku,
            value1: optionSelect.color,
            value2: optionSelect.size,
            value3: optionSelect.value3,
            value4: optionSelect.value4,
            type: optionSelect.type
        }
        console.log("🛒 New SKU to update:", printSku);
        const updateSku = async () => {
            try {
                const ids = item.lineItems.map(item => item.id)
                await updatePrinterSku(ids, printSku)
                console.log("✅ SKU updated:", sku);
            } catch (err) {
                console.log(err)
                alert("❌ Update SKU failed");
            }
        };
        updateSku();
    }, [sku, optionSelect]);

    const clear = async (id: string[]) => {
        try {
            await clearDesignInItem(id);
        } catch (e: any) {
            console.error("Lỗi fetch SKU:", e.message);
            alert("Lỗi!");
        }
    }

    const changeIsPrint = async (isPrint: boolean) => {
        try {
            setIsPrintEnabled(isPrint)
            const ids = item.lineItems.map(item => item.id)
            await updateIsPrinter(ids, isPrint)
        } catch (err) {
            console.log(err)
            setIsPrintEnabled(!isPrint)
            alert("❌ Update SKU failed");
        }
    }

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
                                        onChange={(e) =>
                                            setOptionSelect({ type: e.target.value, color: "", size: "" })
                                        }
                                        disabled={disabledSelect}
                                        className="px-3 min-w-[120px] max-w-[200px] py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="-- Type --"
                                    />
                                    <datalist id={`type-options-${item.lineItemFist.id}`}>
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
                                        list={`color-options-${item.lineItemFist.id}`}
                                        value={optionSelect.color}
                                        onChange={(e) =>
                                            setOptionSelect({ ...optionSelect, color: e.target.value, size: "" })
                                        }
                                        disabled={!optionSelect.type || disabledSelect}
                                        className="px-3 min-w-[120px] py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder={loadingColors ? "Đang tải..." : "-- Color --"}
                                    />
                                    <datalist id={`color-options-${item.lineItemFist.id}`}>
                                        {colors.map((c) => (
                                            <option key={c} value={c} />
                                        ))}
                                    </datalist>
                                </div>

                                {/* Size */}
                                <div>
                                    <input
                                        list={`size-options-${item.lineItemFist.id}`}
                                        value={optionSelect.size}
                                        onChange={(e) =>
                                            setOptionSelect({ ...optionSelect, size: e.target.value })
                                        }
                                        disabled={!optionSelect.color || disabledSelect}
                                        className="px-3 min-w-[120px] py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="-- Size --"
                                    />
                                    <datalist id={`size-options-${item.lineItemFist.id}`}>
                                        {sizes.map((s) => (
                                            <option key={s} value={s} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                            {attribute.code === "MP" && (
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
                            )}
                        </div>


                    ) : (
                        <p className="text-sm text-gray-500 italic">Vui lòng chọn nhà in trước hoặc bật in cho sản phẩm</p>
                    )}
                </div>

            }

        </div>
    );
}