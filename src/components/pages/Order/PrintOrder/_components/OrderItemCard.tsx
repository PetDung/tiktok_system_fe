"use client"
import ThumbPreview from "@/components/pages/Design/_components/ThumbPreview";
import { LineItemHasQuantity } from "./OrderItemModalView";
import { AttributeFull } from "./TablOrderPrint";
import { useEffect, useMemo, useState, memo, useCallback, useRef } from "react";
import { CategoryPrintPrinteesHub, getSkuMenPrint, getSkuMongoTeePrint, MangoTeePrintSKU, MenPrintSku, Variation } from "@/service/print-order/getSKU";
import { updateIsPrinter, updatePrinterSku } from "@/service/order/order-service";
import { LineItem } from "@/service/types/ApiResponse";
import { Printer } from "lucide-react";
import { clearDesignInItem } from "@/service/design/design-service";
import { PrintSkuRequest } from "@/service/types/PrintOrder";
import { useFetch } from "@/lib/useFetch";
import { SKUMPK, ValueMKP } from "@/service/print-order/data";
import DesignPreview from "./DesignPreview";

export type OptionSelect = {
  type: string;
  size: string;
  color: string;
  value3: string | null;
  value4: string | null;
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

  // Lấy SKU Men / Mango Tee
  const { data: skuMenPrint = [], isLoading: loadingColors } = useFetch<MenPrintSku[]>({
    fetcher: getSkuMenPrint,
    key: `men-print-sku-${optionSelect.type}`,
    param: optionSelect.type,
    enabled: !!optionSelect.type && attribute?.code === "MP"
  });

  const { data: skuMango = [], isLoading: loadingMango } = useFetch<MangoTeePrintSKU[]>({
    fetcher: getSkuMongoTeePrint,
    key: `mango-print-sku-${optionSelect.type}`,
    param: optionSelect.type,
    enabled: !!optionSelect.type && attribute?.code === "MG"
  });

  const isLoading = loadingColors || loadingMango;

  // Tính màu dựa trên type và attribute
  const colors: string[] = useMemo(() => {
    if (!attribute || !optionSelect.type) return [];
    switch (attribute.code) {
      case "PRH": {
        const orderOrigin = attribute.orderOrigin as CategoryPrintPrinteesHub[];
        const matched = orderOrigin.find(o => o.name === optionSelect.type);
        return matched ? Array.from(new Set(matched.variations.map(v => v.color))) : [];
      }
      case "MP":
        return Array.from(new Set(skuMenPrint.map(v => v.color)));
      case "MG":
        return Array.from(new Set(skuMango.map(v => v.color)));
      case "MKP": {
        const orderOrigin = attribute.orderOrigin as SKUMPK[];
        const matched = orderOrigin.find(o => o.sku === optionSelect.type);
        return matched ? Array.from(new Set(matched.varriants.map(v => v.color))) : [];
      }
      default: return [];
    }
  }, [attribute, optionSelect.type, skuMenPrint, skuMango]);

  // Tính size dựa trên type + color
  const sizes: string[] = useMemo(() => {
    if (!attribute || !optionSelect.type || !optionSelect.color) return [];
    switch (attribute.code) {
      case "PRH": {
        const orderOrigin = attribute.orderOrigin as CategoryPrintPrinteesHub[];
        const matched = orderOrigin.find(o => o.name === optionSelect.type);
        if (!matched) return [];
        return Array.from(new Set(matched.variations.filter(v => v.color === optionSelect.color).map(v => v.size)));
      }
      case "MP":
        return Array.from(new Set(skuMenPrint.filter(v => v.color === optionSelect.color).map(v => v.size)));
      case "MG":
        return Array.from(new Set(skuMango.filter(v => v.color === optionSelect.color).map(v => v.size)));
      case "MKP": {
        const orderOrigin = attribute.orderOrigin as SKUMPK[];
        const matched = orderOrigin.find(o => o.sku === optionSelect.type);
        if (!matched) return [];
        return Array.from(new Set(matched.varriants.filter(v => v.color === optionSelect.color).map(v => v.size)));
      }
      default: return [];
    }
  }, [attribute, optionSelect.type, optionSelect.color, skuMenPrint, skuMango]);

  // Tính sku hiện tại
  const sku: string | null = useMemo(() => {
    if (!attribute || !optionSelect.type || !optionSelect.color || !optionSelect.size) return null;
    switch (attribute.code) {
      case "PRH": {
        const orderOrigin = attribute.orderOrigin as CategoryPrintPrinteesHub[];
        const cat = orderOrigin.find(c => c.name === optionSelect.type);
        if (!cat) return null;
        const v = cat.variations.find(v => v.color === optionSelect.color && v.size === optionSelect.size);
        return v ? v.sku : null;
      }
      case "MP": {
        const v = skuMenPrint.find(v => v.color === optionSelect.color && v.size === optionSelect.size);
        return v?.sku || null;
      }
      case "MG": {
        const v = skuMango.find(v => v.color === optionSelect.color && v.size === optionSelect.size);
        return v?.sku || null;
      }
      case "MKP":
        return optionSelect.type;
      default: return null;
    }
  }, [attribute, optionSelect.type, optionSelect.color, optionSelect.size, skuMenPrint, skuMango]);

  // Ref lưu sku trước để tránh gọi API loop
  const prevSkuRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sku || !isPrintEnabled) return;
    if (prevSkuRef.current === sku) return; // nếu sku không đổi, bỏ qua
    const timeoutId = setTimeout(async () => {
      try {
        const printSku: PrintSkuRequest = {
          skuCode: sku,
          value1: optionSelect.color,
          value2: optionSelect.size,
          value3: optionSelect.value3,
          value4: optionSelect.value4,
          type: optionSelect.type
        };
        const ids = item.lineItems.map(i => i.id);
        await updatePrinterSku(ids, printSku);
        console.log("✅ SKU updated:", sku);
        prevSkuRef.current = sku;
      } catch (err) {
        console.error("❌ Update SKU failed:", err);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [sku, optionSelect.color, optionSelect.size, optionSelect.value3, optionSelect.value4, optionSelect.type, isPrintEnabled, item.lineItems]);

  const clear = useCallback(async (id: string[]) => {
    try { await clearDesignInItem(id); } catch (e: any) { alert("Lỗi khi xóa thiết kế!"); }
  }, []);

  const changeIsPrint = useCallback(async (isPrint: boolean) => {
    try {
      setIsPrintEnabled(isPrint);
      const ids = item.lineItems.map(i => i.id);
      await updateIsPrinter(ids, isPrint);
    } catch (err) {
      console.error(err);
      setIsPrintEnabled(!isPrint);
      alert("❌ Update print status failed");
    }
  }, [item.lineItems]);

  const handleTypeChange = useCallback((type: string) => {
    setOptionSelect(prev => ({ ...prev, type, color: "", size: "" }));
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setOptionSelect(prev => ({ ...prev, color, size: "" }));
  }, []);

  const handleSizeChange = useCallback((size: string) => {
    setOptionSelect(prev => ({ ...prev, size }));
  }, []);

  const skuOption = useMemo(() => {
    const ps = item.lineItemFist.print_sku;
    return ps ? `${ps.type} - ${ps.value1} - ${ps.value2}` : "Chưa có";
  }, [item.lineItemFist]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-2 mb-2">
      <div className="flex gap-4 items-start">
        <ThumbPreview size={60} thumbUrl={item.lineItemFist.sku_image} />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900 mb-1 truncate overflow-hidden whitespace-nowrap">
              {item.lineItemFist.product_name}
            </h3>
            <div className="flex items-center gap-2 ml-2">
              <Printer className={`w-4 h-4 ${isPrintEnabled ? 'text-green-600' : 'text-gray-400'}`} />
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPrintEnabled ?? false}
                  onChange={e => changeIsPrint(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-checked:bg-green-600 rounded-full relative after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
              </label>
              <span className="text-xs font-medium text-gray-700">{isPrintEnabled ? 'Bật' : 'Tắt'}</span>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-1">Loại: {item.lineItemFist.sku_name}</p>
          <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
          <p className="text-sm text-gray-600">Sku code: {item.lineItemFist.print_sku?.skuCode ?? "Chưa có"}</p>
          <p className="text-sm text-gray-600">Sku: {skuOption}</p>
        </div>
      </div>

      <div className="flex-shrink-0 mt-2">
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
          <div onClick={() => openAddDesign(item.lineItemFist)} className="w-15 h-15 flex items-center justify-center border border-gray-300 rounded cursor-pointer">
            <span className="text-2xl text-gray-400">+</span>
          </div>
        )}
      </div>

      {!disabledSelect && (
        <div className="flex gap-3 pt-2 border-t border-gray-100">
          {attribute && isPrintEnabled ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  list={`type-options-${item.lineItemFist.id}`}
                  value={optionSelect.type}
                  onChange={e => handleTypeChange(e.target.value)}
                  disabled={disabledSelect}
                  placeholder="-- Type --"
                  className="px-3 min-w-[120px] py-2 border border-gray-300 rounded-md text-sm"
                />
                <datalist id={`type-options-${item.lineItemFist.id}`}>
                  {attribute.attribute.map(t => <option key={t.key} value={t.key}>{t.name}</option>)}
                </datalist>

                <input
                  list={`color-options-${item.lineItemFist.id}`}
                  value={optionSelect.color}
                  onChange={e => handleColorChange(e.target.value)}
                  disabled={!optionSelect.type || disabledSelect}
                  placeholder={isLoading ? "Đang tải..." : "-- Color --"}
                  className="px-3 min-w-[120px] py-2 border border-gray-300 rounded-md text-sm"
                />
                <datalist id={`color-options-${item.lineItemFist.id}`}>
                  {colors.map(c => <option key={c} value={c} />)}
                </datalist>

                <input
                  list={`size-options-${item.lineItemFist.id}`}
                  value={optionSelect.size}
                  onChange={e => handleSizeChange(e.target.value)}
                  disabled={!optionSelect.color || disabledSelect}
                  placeholder="-- Size --"
                  className="px-3 min-w-[120px] py-2 border border-gray-300 rounded-md text-sm"
                />
                <datalist id={`size-options-${item.lineItemFist.id}`}>
                  {sizes.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">Vui lòng chọn nhà in hoặc bật in cho sản phẩm</p>
          )}
        </div>
      )}
    </div>
  );
});

export default OrderItemCard;
