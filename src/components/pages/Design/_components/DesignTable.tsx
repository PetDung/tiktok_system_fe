"use client";
import { Search, Trash, Plus, Grid, List } from "lucide-react";
import { Design } from "@/service/types/ApiResponse";
import DesignView from "../_components/DesignView";
import ThumbPreview from "./ThumbPreview";
import { useCallback, useRef, useEffect, useState, useMemo } from "react";
import React from "react";
import { useDesignsCursor } from "@/lib/customHooks/useDesginsCursor";
import LoadMoreWrapper from "@/components/UI/LoadMordeWrapper";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import EmptyState from "@/components/UI/EmptyState";
import DesignCard from "@/components/UI/DesignCard";
import { debounce } from "lodash";
import DesignModal, { DesignRequest } from "./AddDesign";
import { createDesign, deleteDesign } from "@/service/design/design-service";

interface Props {
  selectedDesign: string;
  setSelectedDesign: (val: string) => void;
}

type ViewMode = "table" | "grid";

function DesignTableBase({ selectedDesign, setSelectedDesign }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState<string>("");
  const [open, setOpen] = useState(false);

  const [designsData, setDesignsData] = useState<{
    designs: Design[];
    pageToken: string;
    hasMore: boolean;
    total: number;
  }>({
    designs: [],
    pageToken: "",
    hasMore: false,
    total: 0,
  });

  const [fetchCursor, setFetchCursor] = useState({
    cursor: "",
    search: "",
  });

  // Hook fetch designs
  const { data: designCursorResponse, isLoading} = useDesignsCursor({
    search: fetchCursor.search,
    cursor: fetchCursor.cursor,
  });

  // Hàm xử lý reset + fetch mới khi search thay đổi
  const handlePrevSearch = useCallback((value: string) => {
    setDesignsData({ designs: [], pageToken: "", hasMore: true, total: 0 });
    setFetchCursor({ cursor: "", search: value });
  }, []);

  // debounce để tránh gọi API liên tục
  const debouncedSetSearch = useRef(
    debounce((value: string) => handlePrevSearch(value), 500)
  ).current;

  // cleanup debounce khi unmount
  useEffect(() => {
    return () => {
      debouncedSetSearch.cancel();
    };
  }, [debouncedSetSearch]);

  // Xử lý input search
  const onChangeSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearch(value);
      debouncedSetSearch(value);
    },
    [debouncedSetSearch]
  );

  // ⚡ FIX: cập nhật data tránh duplicate
  useEffect(() => {
    if (!designCursorResponse?.result?.data) return;

    const incoming = designCursorResponse.result.data;
    const nextCursor = designCursorResponse.result.nextCursor || "";
    const total = designCursorResponse.result.total ?? 0;
    const hasMore = !!designCursorResponse.result.hasMore;

    setDesignsData((prev) => {
      // Nếu là trang đầu (cursor rỗng) → replace
      if (!fetchCursor.cursor) {
        return {
          designs: incoming,
          pageToken: nextCursor,
          hasMore,
          total,
        };
      }

      // Nếu là load more → append có lọc trùng
      const existingIds = new Set(prev.designs.map((d) => d.id));
      const newUnique = incoming.filter((d) => !existingIds.has(d.id));

      return {
        designs: [...prev.designs, ...newUnique],
        pageToken: nextCursor,
        hasMore,
        total,
      };
    });
  }, [designCursorResponse, fetchCursor.cursor]);

  // select design
  const onSelectDesign = useCallback(
    (id: string) => setSelectedDesign(id),
    [setSelectedDesign]
  );
  const openAdd = useCallback(() => setOpen(true), [setOpen]);

  // ⚡ FIX: loadMore dùng functional update tránh stale closure
  const loadMore = useCallback(() => {
    if (!designsData.pageToken) return;
    setFetchCursor((prev) => ({ ...prev, cursor: designsData.pageToken }));
  }, [designsData.pageToken]);

  const hasSearch = useMemo(() => search.length > 0, [search]);
  const hasResults = useMemo(
    () => designsData.designs.length > 0,
    [designsData.designs.length]
  );

  const handleSubmitDesign = async (data: DesignRequest) => {
    try {
      const response = await createDesign(data);
      const newDesgin = response.result;
      setDesignsData({
        ...designsData, // giữ nguyên status, message cũ
        designs: [newDesgin, ...designsData?.designs || []],
        total: designsData.total + 1,
      });
      alert("Thêm design thành công!");
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi thêm design: " + error);
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    const designName = designsData.designs.find(d => d.id === designId)?.name || 'design này';
    if (!confirm(`Bạn có chắc muốn xóa "${designName}"?`)) return;
    try {
      const response = await deleteDesign(designId);
      if (response.code === 1000) {
        alert("Xóa design thành công");
    
        setDesignsData({
          ...designsData, // giữ nguyên status, message cũ
          designs: designsData.designs.filter(item => item.id !== designId),
          total: designsData.total -1,
        });
        if (selectedDesign === designId) {
          setSelectedDesign("");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi xóa design: " + error);
    }
  };
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
              {designsData.designs.length} / {designsData.total} designs
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
          hasMore={designsData.hasMore}
          loadMore={loadMore}
          loader={<LoadingIndicator />}
          loading={isLoading}
        >
          {!hasResults ? (
            <EmptyState hasSearch={hasSearch} onAddClick={openAdd} />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {designsData.designs.map((design) => (
                <DesignCard
                  key={design.id}
                  design={design}
                  isSelected={selectedDesign === design.id}
                  onSelect={onSelectDesign}
                  onDelete={handleDeleteDesign}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <tbody className="bg-white divide-y divide-gray-100">
                  {designsData.designs.map((design) => (
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
                        <div className="font-medium text-gray-900">
                          {design.name}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <DesignView design={design} />
                          <button
                            onClick={() => handleDeleteDesign(design.id)}
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
      <DesignModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmitDesign}
      />
    </div>
  );
}

export default DesignTableBase;
