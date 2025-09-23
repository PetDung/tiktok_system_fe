"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debounce, get, set } from "lodash";
import DateRangePicker from "@/components/UI/DateRangePicker";
import { getAllProductActive, getProductActive } from "@/service/product/product-service";
import { Product } from "@/service/types/ApiResponse";
import ProductActiveTable from "../_component/ProductActiveTable";
import ExcelExportButton from "@/components/UI/ExcelExportButton";
import { columnsProductActive } from "@/utils/ConfigExcel";
import LoadingOverlay from "@/components/UI/LoadingOverlay";

type DateState = {
  startDate: number | null;
  endDate: number | null;
};

export default function ActiveProductComponent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectProducts, setSelectProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [page, setPage] = useState<number>(0);
  const [isLast, setIsLast] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingSetup, setLoadingSetup] = useState<boolean>(false);
  const loadingRef = useRef<boolean>(false);
  const [totalOrders, setTotalOrders] = useState<number>(0);
  

  const [date, setDate] = useState<DateState>({ startDate: null, endDate: null });

  /** Sync loading ref */
  useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

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

  /** Fetch API */
  const fetchProduct = useCallback(
    async (
      params: { keyword?: string; startTime?: number | null; endTime?: number | null; page: number },
      append = false
    ) => {
      try {
        setLoading(true);
        const response = await getProductActive(params);
        const list = response?.result?.products ?? [];
        setIsLast(response?.result?.last ?? true);
        setProducts((prev) => {
          if (!append) return list;

          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = list.filter(p => !existingIds.has(p.id));

          return [...prev, ...uniqueNew];
        });
        setTotalOrders(response.result.totalCount)
      } catch (error) {
        console.error("Fetch product error:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );
  const allProductActive = async () => {
    setLoadingSetup(true);
    try {
        const response = await getAllProductActive({
          startTime: date.startDate,
          endTime : date.endDate
        });
        setSelectProducts(response?.result || []);
      } catch (error) {
        console.error("Fetch product error:", error);
      } finally {
        setLoadingSetup(false);
      }
  };


  /** Debounced search */
  const triggerSearch = useMemo(
    () =>
      debounce((kw: string, start: number | null, end: number | null) => {
        setPage(0);
        fetchProduct({ keyword: kw, startTime: start, endTime: end, page: 0 }, false);
      }, 400),
    [fetchProduct]
  );

  /** Handle keyword input */
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    triggerSearch(value, date.startDate, date.endDate);
  };

  /** Handle date change */
  const handleChangeDate = useCallback(
    (start: Date | null, end: Date | null) => {
      const startUtc = toUtcTimestampSeconds(start, false);
      const endUtc = toUtcTimestampSeconds(end, true);

      setDate({ startDate: startUtc, endDate: endUtc });
      setPage(0);
      fetchProduct({ keyword, startTime: startUtc, endTime: endUtc, page: 0 }, false);
    },
    [keyword, toUtcTimestampSeconds, fetchProduct]
  );

  /** Load initial */
  useEffect(() => {
    fetchProduct({ page: 0 }, false);
  }, [fetchProduct]);

  /** Load more */
  const loadMore = useCallback(() => {
    if (loadingRef.current || isLast) return; // guard bằng ref
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProduct(
      { keyword, startTime: date.startDate, endTime: date.endDate, page: nextPage },
      true
    );
  }, [page, keyword, date, isLast, fetchProduct]);

  return (
    <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900">Product Active</h2>
          {totalOrders > 0 && (
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {products.length} / {totalOrders} product
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative flex items-center">
            <input
              type="text"
              value={keyword}
              onChange={handleKeywordChange}
              placeholder="Search by ID/ Title"
              className="border border-gray-300 rounded-lg px-4 py-2 pr-8 min-w-[300px] text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            {keyword && (
              <button
                type="button"
                onClick={() => {
                  setKeyword("");
                  triggerSearch("", date.startDate, date.endDate);
                }}
                className="absolute right-2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <DateRangePicker onChange={handleChangeDate} />
          <ExcelExportButton
            data={selectProducts}        
            columns={columnsProductActive}           
            fileName={`products_active_${Date.now()}.xlsx`}   // timestamp hiện tại
            buttonText="Export"         
            className="my-2"    
          />
          <button
            className={`
              flex items-center gap-2 px-4 py-2 rounded
              ${loadingSetup
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-amber-300 text-black hover:bg-amber-700"
              }
            `}
            onClick={allProductActive}
            disabled={loadingSetup}
          >
            Tạo dữ liệu
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <ProductActiveTable
          products={products}
          loading={loading}
          hasMore={!isLast}
          onLoadMore={loadMore}
        />
      </div>
      <LoadingOverlay show={loadingSetup} />
    </div>
  );
}
