import { useMemo, useState, useEffect } from 'react';
import { CategoryPrintPrinteesHub, MenPrintSku, Variation } from "@/service/print-order/getSKU";
import { SKUMPK, ValueMKP } from "@/service/print-order/data";
import { AttributeFull } from '@/components/pages/Order/PrintOrder/_components/TablOrderPrint';
import { LineItemHasQuantity } from '@/components/pages/Order/PrintOrder/_components/OrderItemModalView';
import { PrintSkuRequest } from '@/service/types/PrintOrder';
import { updatePrinterSku } from '@/service/order/order-service';

export type OptionSelect = {
    type: string;
    size: string;
    color: string;
    value3: null | string;
    value4: null | string;
};

export function useSkuSelection(
    item: LineItemHasQuantity,
    attribute: AttributeFull | null,
    skuMenPrint: MenPrintSku[]
) {
    const [optionSelect, setOptionSelect] = useState<OptionSelect>({
        type: item.lineItemFist.print_sku?.type || "",
        size: item.lineItemFist.print_sku?.value2 || "",
        color: item.lineItemFist.print_sku?.value1 || "",
        value3: item.lineItemFist.print_sku?.value3 || "14x16",
        value4: item.lineItemFist.print_sku?.value4 || "14x16",
    });

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
        return [];
    }, [attribute, optionSelect.type, skuMenPrint]);

    const sizes: string[] = useMemo(() => {
        if (!attribute || !optionSelect.type || !optionSelect.color) return [];
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
    }, [attribute, optionSelect, skuMenPrint]);

    useEffect(() => {
        if (!sku) return;

        const printSku: PrintSkuRequest = {
            skuCode: sku,
            value1: optionSelect.color,
            value2: optionSelect.size,
            value3: optionSelect.value3,
            value4: optionSelect.value4,
            type: optionSelect.type
        };
        console.log("🛒 New SKU to update:", printSku);
        const updateSku = async () => {
            try {
                const ids = item.lineItems.map(item => item.id);
                await updatePrinterSku(ids, printSku);
                console.log("✅ SKU updated:", sku);
            } catch (err) {
                console.log(err);
                alert("❌ Update SKU failed");
            }
        };
        updateSku();
    }, [sku, optionSelect, item.lineItems]);

    return {
        optionSelect,
        setOptionSelect,
        colors,
        sizes,
        sku
    };
}