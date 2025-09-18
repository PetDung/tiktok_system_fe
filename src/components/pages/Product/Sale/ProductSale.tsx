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
  const [loading, setLoading] = useState<boolean>(false);


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
      setLoading(true)
      try {
        const response = await getProductSales({ startTime: startDate, endTime: endDate });
        const list = response?.result?.products ?? [];
        setProductSale(list);
      } catch (error) {
        console.error("Fetch product error:", error);
      }finally{
          setLoading(false)
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
    <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900">Product Sale</h2>
          {productSale.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {productSale.length} / {productSale.length} product
            </span>
          )}
        </div>
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
      <div className="flex-1 min-h-0 overflow-auto">
          <ProductSaleTable products={productSale} onSelectionChange={setSelectProducts} loading={loading} />
      </div>
    </div>
  );
}
