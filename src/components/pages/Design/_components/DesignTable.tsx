"use client";
import { Search, Trash, Plus, Grid, List } from "lucide-react";
import { Design } from "@/service/types/ApiResponse";
import DesignView from "../_components/DesignView";
import ThumbPreview from "./ThumbPreview";
import { useCallback, useRef, useEffect, useState } from "react";
import React from "react";
import { useDesignsCursor } from "@/lib/customHooks/useDesginsCursor";
import LoadMoreWrapper from "@/components/UI/LoadMordeWrapper";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import EmptyState from "@/components/UI/EmptyState";
import DesignCard from "@/components/UI/DesignCard";
import { debounce } from "lodash";

interface Props {
  designSearch: string;
  setDesignSearch: (val: string) => void;
  selectedDesign: string;
  setSelectedDesign: (val: string) => void;
  handleDeleteDesign: (id: string) => void;
  setOpen: (val: boolean) => void;
}

type ViewMode = "table" | "grid";

function DesignTableBase({
  designSearch,
  setDesignSearch,
  selectedDesign,
  setSelectedDesign,
  handleDeleteDesign,
  setOpen,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Local search input state
  const [search, setSearch] = useState<string>(designSearch || "");

  // Data state
  const [designs, setDesigns] = useState<Design[]>([]);
  const [pageToken, setPageToken] = useState<string>("");
  const [fetchCursor, setFetchCursor] = useState<string>("");
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number>(0);

  // Hook fetch designs
  const { data: designCursorResponse } = useDesignsCursor({
    search,
    cursor: fetchCursor,
  });

  // Debounced update of parent search
  const debouncedSetSearch = useRef(
    debounce((value: string) => {
      setDesignSearch(value);
    }, 500)
  ).current;

  // Handle input change
  const onChangeSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value); // update local input
      debouncedSetSearch(value); // debounce update parent
    },
    [debouncedSetSearch]
  );

  // Reset designs + cursor khi search thay đổi
  useEffect(() => {
    setDesigns([]);
    setPageToken("");
    setFetchCursor("");
  }, [search]);

  // Khi hook trả về dữ liệu → append
  useEffect(() => {
    if (!designCursorResponse?.result?.data) return;

    setDesigns((prev) => [...prev, ...designCursorResponse.result.data]);
    setPageToken(designCursorResponse.result.nextCursor || "");
    setHasMore(!!designCursorResponse.result.hasMore);
    setTotal(designCursorResponse.result.total);
  }, [designCursorResponse]);

  // Select / delete / add design
  const onSelectDesign = useCallback(
    (id: string) => setSelectedDesign(id),
    [setSelectedDesign]
  );
  const onDelete = useCallback(
    (id: string) => handleDeleteDesign(id),
    [handleDeleteDesign]
  );
  const openAdd = useCallback(() => setOpen(true), [setOpen]);

  // Load more
  const loadMore = () => {
    if (!pageToken) return;
    setFetchCursor(pageToken);
  };

  const hasSearch = search.length > 0;
  const hasResults = designs.length > 0;

  return (
    <div className="bg-white flex flex-col shadow-sm border border-gray-200 h-full relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-200 flex-shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Tìm kiếm design..."
              value={search}
              onChange={onChangeSearch}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {designs.length} / {total} designs
            </span>

            {/* View mode toggle */}
            <div className="flex border border-gray-300 rounded-lg p-1 bg-gray-50">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded transition-colors ${
                  viewMode === "table"
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Add button */}
            <button
              onClick={openAdd}
              className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm Design
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 p-2 overflow-auto">
        <LoadMoreWrapper
          hasMore={hasMore}
          loadMore={loadMore}
          loader={<LoadingIndicator />}
        >
          {!hasResults ? (
            <EmptyState hasSearch={hasSearch} onAddClick={openAdd} />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {designs.map((design) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  isSelected={selectedDesign === design.id}
                  onSelect={onSelectDesign}
                  onDelete={onDelete}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <tbody className="bg-white divide-y divide-gray-100">
                  {designs.map((design) => (
                    <tr
                      key={design.id}
                      className={`hover:bg-gray-50 transition-colors ${
                        selectedDesign === design.id ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="py-4 px-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="design"
                            checked={selectedDesign === design.id}
                            onChange={() => onSelectDesign(design.id)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                        </label>
                      </td>
                      <td className="py-4 px-4">
                        <div className="aspect-square">
                          <ThumbPreview
                            thumbUrl={design.thumbnail || ""}
                            alt={design.name}
                            size={60}
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{design.name}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <DesignView design={design} />
                          <button
                            onClick={() => onDelete(design.id)}
                            className="inline-flex items-center px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash className="w-4 h-4 mr-1" /> Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </LoadMoreWrapper>
      </div>
    </div>
  );
}

export default React.memo(DesignTableBase);
