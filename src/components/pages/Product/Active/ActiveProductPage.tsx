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
import { getProductActiveCursor } from "@/service/product/product-service_v2";
import { cn } from './../../../../lib/utils';
import LoadMoreWrapper from "@/components/UI/LoadMordeWrapper";
import LoadingIndicator from "@/components/UI/LoadingIndicator";

type DateState = {
  startDate: number | null;
  endDate: number | null;
};

type FetchProductActiveParams = {
  startDate?: number | null;
  endDate?: number | null;
  nextCursor?: string | null;
  append?: boolean;
  productId?: string | null;
};

export default function ActiveProductComponent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectProducts, setSelectProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState<string>("");
  const [loadingSetup, setLoadingSetup] = useState<boolean>(false);
  const [pageToken, setPageToken] = useState<string>("");
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);

  const [date, setDate] = useState<DateState>({ startDate: null, endDate: null });

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
  const fetchProductActiveCursor = async (params: FetchProductActiveParams = {}) => {
    const {
      startDate = null,
      endDate = null,
      nextCursor = "",
      append = false,
      productId = null,
    } = params;

    try {
      const response = await getProductActiveCursor({
        startTime: startDate,
        endTime: endDate,
        nextCursor,
        productId,
      });
      const list = response?.result?.data ?? [];
      console.log("response", append);
      setProducts(prev => append ? [...prev, ...list] : list);
      setHasMore(response?.result?.hasMore ?? false);
      setPageToken(response?.result?.nextCursor ?? "");
      setTotal(response?.result?.total ?? 0);
    } catch (error) {
      console.error("Fetch product error:", error);
    }
  }

  const allProductActive = async () => {
    setLoadingSetup(true);
    try {
      const response = await getAllProductActive({
        startTime: date.startDate,
        endTime: date.endDate
      });
      setSelectProducts(response?.result || []);
    } catch (error) {
      console.error("Fetch product error:", error);
    } finally {
      setLoadingSetup(false);
    }
  };

  const loadMore = async () =>{
    if (!hasMore) return;
    const param : FetchProductActiveParams = {
      startDate  : date.startDate,
      endDate : date.endDate,
      nextCursor : pageToken,
      append : true,
    }
    await fetchProductActiveCursor(param);
  }


  const handleChangeDate = useCallback(
      async (start: Date | null, end: Date | null) => {
        const startUtc = toUtcTimestampSeconds(start, false);
        const endUtc = toUtcTimestampSeconds(end, true);
        setDate({ startDate: startUtc, endDate: endUtc });
  
        const param : FetchProductActiveParams = {
          startDate  : startUtc,
          endDate : endUtc,
        }
  
        await fetchProductActiveCursor(param);
      },
      [toUtcTimestampSeconds, fetchProductActiveCursor]
  );

  const debouncedSearch = useCallback(
    debounce(async (value: string) => {
      await fetchProductActiveCursor({ productId: value || null });
    }, 500),
    [fetchProductActiveCursor]
  );


  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeyword(value);
    debouncedSearch(value);
  };



  return (
    <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
        <div className="flex items-center space-x-3">
          <h2 className="text-xl font-bold text-gray-900">Product Active</h2>
          {total > 0 && (
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {products.length} / {total} product
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
                  handleKeywordChange({ target: { value: "" } } as any);
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
        <LoadMoreWrapper hasMore={hasMore} loadMore={loadMore} loader={(<LoadingIndicator />)} rootMargin="300px">
          <ProductActiveTable
            products={products}
          />
        </LoadMoreWrapper>
      </div>
      <LoadingOverlay show={loadingSetup} />
    </div>
  );
}
