"use client"

import { getProductSales } from "@/service/product/product-service";
import { ProductReport } from "@/service/types/ApiResponse";
import { useCallback, useEffect, useState } from "react";
import ProductSaleTable from "../_component/ProductSaleTable";
import DateRangePicker from "@/components/UI/DateRangePicker";
import { columnsProductSale } from "@/utils/ConfigExcel";
import ExcelExportButton from "@/components/UI/ExcelExportButton";

type DateState = {
  startDate: number | null;
  endDate: number | null;
};

export default function ProductSale() {
  const [productSale, setProductSale] = useState<ProductReport[]>([]);
  const [date, setDate] = useState<DateState>({ startDate: null, endDate: null });
  const [selectProducts, setSelectProducts] = useState<ProductReport[]>([]);

  /** Convert date -> timestamp UTC (seconds) */
  const toUtcTimestampSeconds = useCallback(
    (date: Date | null, isEnd: boolean = false): number | null => {
      if (!date) return null;
      const d = new Date(date);
      if (isEnd) d.setHours(23, 59, 59, 999);
      else d.setHours(0, 0, 0, 0);
      return Math.floor(d.getTime() / 1000);
    },
    []
  );

  const fetchProductSale = useCallback(
    async (startDate: number | null, endDate: number | null) => {
      try {
        const response = await getProductSales({ startTime: startDate, endTime: endDate });
        const list = response?.result?.products ?? [];
        setProductSale(list);
      } catch (error) {
        console.error("Fetch product error:", error);
      }
    },
    []
  );

  // Tự fetch khi date thay đổi
  useEffect(() => {
    fetchProductSale(date.startDate, date.endDate);
  }, [date, fetchProductSale]);

  const handleChangeDate = useCallback(
    (start: Date | null, end: Date | null) => {
      const startUtc = toUtcTimestampSeconds(start, false);
      const endUtc = toUtcTimestampSeconds(end, true);
      setDate({ startDate: startUtc, endDate: endUtc });
    },
    [toUtcTimestampSeconds]
  );

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
        <h2 className="text-lg font-semibold text-gray-800">Product Sale</h2>
        <div className="flex gap-2 items-center">
          <DateRangePicker onChange={handleChangeDate} />
          <ExcelExportButton
                data={selectProducts}
                columns={columnsProductSale}
                fileName={`products_sale_${Date.now()}.xlsx`}   // timestamp hiện tại
                buttonText="Export"
                className="my-2"
            />
        </div>
      </div>

      <ProductSaleTable products={productSale} onSelectionChange={setSelectProducts} />
    </div>
  );
}
