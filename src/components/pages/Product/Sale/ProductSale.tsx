"use client"
import { ProductReport } from "@/service/types/ApiResponse";
import { useCallback, useState } from "react";
import ProductSaleTable from "../_component/ProductSaleTable";
import DateRangePicker from "@/components/UI/DateRangePicker";
import { columnsProductSale } from "@/utils/ConfigExcel";
import ExcelExportButton from "@/components/UI/ExcelExportButton";
import { getProductSalesCursor } from "@/service/product/product-sale__v2";
import LoadMoreWrapper from "@/components/UI/LoadMordeWrapper";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { debounce, set } from "lodash";

type DateState = {
  startDate: number | null;
  endDate: number | null;
};

type FetchProductSaleParams = {
  startDate?: number | null;
  endDate?: number | null;
  nextCursor?: string | null;
  append?: boolean;
  productId?: string | null;
};

export default function ProductSale() {
  const [productSale, setProductSale] = useState<ProductReport[]>([]);
  const [date, setDate] = useState<DateState>({ startDate: null, endDate: null });
  const [selectProducts, setSelectProducts] = useState<ProductReport[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [pageToken, setPageToken] = useState<string | null>("");
  const [total, setTotal] = useState<number>(0);
  const [keyword, setKeyword] = useState<string>("");


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
  const fetchProductSalePage =  async (params: FetchProductSaleParams = {}) => {
    const {
      startDate = null,
      endDate = null,
      nextCursor = "",
      append = false,
      productId = null,
    } = params;

    try {
      const response = await getProductSalesCursor({
        startTime: startDate,
        endTime: endDate,
        nextCursor,
        productId,
      });

      const list = response?.result?.data ?? [];
      setProductSale((prev) => (append ? [...prev, ...list] : list));
      setHasMore(response?.result?.hasMore ?? false);
      setPageToken(response?.result?.nextCursor ?? "");
      setTotal(response?.result?.total ?? 0);
    } catch (error) {
      alert("Fetch product error: " + error);
    }
  }

  const loadMore =  async () => {
    if (!hasMore) return;

    const param : FetchProductSaleParams = {
      startDate  : date.startDate,
      endDate : date.endDate,
      nextCursor : pageToken,
      append : true,
    }
    await fetchProductSalePage(param);
  }

  const handleChangeDate = useCallback(
    async (start: Date | null, end: Date | null) => {
      const startUtc = toUtcTimestampSeconds(start, false);
      const endUtc = toUtcTimestampSeconds(end, true);
      setDate({ startDate: startUtc, endDate: endUtc });

      const param : FetchProductSaleParams = {
        startDate  : startUtc,
        endDate : endUtc,
      }

      await fetchProductSalePage(param);
    },
    [toUtcTimestampSeconds, fetchProductSalePage]
  );

  const debouncedSearch = useCallback(
    debounce(async (value: string) => {
      await fetchProductSalePage({ productId: value || null });
    }, 500),
    [fetchProductSalePage]
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
          <h2 className="text-xl font-bold text-gray-900">Product Sale</h2>
          {productSale.length > 0 && (
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {productSale.length} / {total} product
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <DateRangePicker onChange={handleChangeDate} />
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
           <LoadMoreWrapper hasMore={hasMore} loadMore={loadMore} loader={(<LoadingIndicator />)} rootMargin = "1000px">
              <ProductSaleTable products={productSale} onSelectionChange={setSelectProducts}/>
           </LoadMoreWrapper>
      </div>
    </div>
  );
}
