"use client";
import { Search, Trash, Plus, Grid, List, Eye, Filter, MoreVertical } from "lucide-react";
import { Design } from "@/service/types/ApiResponse";
import DesignView from "../_components/DesignView";
import ThumbPreview from "./ThumbPreview";
import { useMemo, useCallback, useRef, useEffect, useState } from "react";
import React from "react";

interface Props {
  designs: Design[];
  designSearch: string;
  setDesignSearch: (val: string) => void;
  selectedDesign: string;
  setSelectedDesign: (val: string) => void;
  handleDeleteDesign: (id: string) => void;
  setOpen: (val: boolean) => void;
}

type ViewMode = 'table' | 'grid';
type SortBy = 'name' | 'date' | 'none';

function getPreviewImage(design: Design): string {
  return (
    design.frontSide ||
    design.backSide ||
    design.leftSide ||
    design.rightSide ||
    ""
  );
}

export function getFileIdFromDriveLink(driveLink: string): string {
  const fileIdMatch = driveLink.match(/[-\w]{25,}/);
  const fileId = fileIdMatch ? fileIdMatch[0] : driveLink;
  return fileId;
}

export function getDrivePreviewUrl(design: Design): string {
  const driveLink = getPreviewImage(design);
  const fileId = getFileIdFromDriveLink(driveLink);
  const basUrl = process.env.NEXT_PUBLIC_API_URL;
  return `${basUrl}/files/thumb?id=${fileId}`;
}

// Loading skeleton component
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 rounded-lg h-32 mb-3"></div>
    <div className="bg-gray-200 rounded h-4 mb-2"></div>
    <div className="bg-gray-200 rounded h-3 w-2/3"></div>
  </div>
);

// Empty state component
const EmptyState = ({ hasSearch, onAddClick }: { hasSearch: boolean; onAddClick: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Grid className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {hasSearch ? 'Không tìm thấy design' : 'Chưa có design nào'}
    </h3>
    <p className="text-gray-500 mb-6 max-w-sm">
      {hasSearch
        ? 'Hãy thử tìm kiếm với từ khóa khác hoặc tạo design mới.'
        : 'Bắt đầu bằng cách tạo design đầu tiên của bạn.'
      }
    </p>
    {!hasSearch && (
      <button
        onClick={onAddClick}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Tạo Design Mới
      </button>
    )}
  </div>
);

// Design card for grid view
const DesignCard = React.memo(({
  design,
  isSelected,
  onSelect,
  onDelete
}: {
  design: Design;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`relative group bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${isSelected
          ? 'border-blue-500 shadow-md ring-2 ring-blue-200'
          : 'border-gray-200 hover:border-gray-300'
        }`}
      onClick={() => onSelect(design.id)}
    >
      {/* Selection indicator */}
      <div className={`absolute top-3 left-3 z-10 w-5 h-5 rounded-full border-2 transition-all duration-200 ${isSelected
          ? 'bg-blue-500 border-blue-500'
          : 'bg-white border-gray-300 group-hover:border-blue-400'
        }`}>
        {isSelected && (
          <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Action menu */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 bg-white bg-opacity-80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-2 min-w-[120px] z-20">
              <DesignView design={design} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(design.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Xóa
              </button>
            </div>
          </>
        )}
      </div>

      {/* Image */}
      <div className="aspect-square p-4 pb-2">
        <ThumbPreview
          thumbUrl={getDrivePreviewUrl(design)}
          alt={design.name}
          size={100}
        />
      </div>

      {/* Content */}
      <div className="p-4 pt-2">
        <h3 className="font-medium text-gray-900 truncate mb-1">
          {design.name}
        </h3>
        <div className="flex items-center gap-2">
          <DesignView design={design} />
        </div>
      </div>
    </div>
  );
});

DesignCard.displayName = 'DesignCard';

function DesignTableBase({
  designs,
  designSearch,
  setDesignSearch,
  selectedDesign,
  setSelectedDesign,
  handleDeleteDesign,
  setOpen,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const debouncedRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredAndSortedDesigns = useMemo(() => {
    let filtered = designs;

    // Filter by search
    const query = designSearch.toLowerCase();
    if (query) {
      filtered = designs.filter((d) => d.name.toLowerCase().includes(query));
    }

    return filtered;
  }, [designs, designSearch]);

  const onChangeSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debouncedRef.current) {
      window.clearTimeout(debouncedRef.current);
    }

    setIsLoading(true);
    debouncedRef.current = window.setTimeout(() => {
      setDesignSearch(value);
      setIsLoading(false);
    }, 300);
  }, [setDesignSearch]);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== designSearch) {
      inputRef.current.value = designSearch;
    }
  }, [designSearch]);

  const onSelectDesign = useCallback((id: string) => {
    setSelectedDesign(id);
  }, [setSelectedDesign]);

  const onDelete = useCallback((id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa design này?')) {
      handleDeleteDesign(id);
    }
  }, [handleDeleteDesign]);

  const openAdd = useCallback(() => setOpen(true), [setOpen]);

  const hasSearch = designSearch.length > 0;
  const hasResults = filteredAndSortedDesigns.length > 0;

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
              defaultValue={designSearch}
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
            {/* Results count */}
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {filteredAndSortedDesigns.length} / {designs.length} designs
            </span>

            {/* View mode toggle */}
            <div className="flex border border-gray-300 rounded-lg p-1 bg-gray-50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded transition-colors ${viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
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
              <Plus className="w-4 h-4 mr-2" />
              Thêm Design
            </button>
          </div>
        </div>
      </div>

      {/* Content - Chiếm phần còn lại và có scroll */}
      <div className="flex-1 min-h-0 p-2 overflow-y-auto">
        {!hasResults ? (
          <EmptyState hasSearch={hasSearch} onAddClick={openAdd} />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredAndSortedDesigns.map((design) => (
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
                {filteredAndSortedDesigns.map((design, index) => (
                  <tr
                    key={design.id}
                    className={`hover:bg-gray-50 transition-colors ${selectedDesign === design.id ? 'bg-blue-50' : ''
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
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <ThumbPreview
                          thumbUrl={getDrivePreviewUrl(design)}
                          alt={design.name}
                          size={150}
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
                          <Trash className="w-4 h-4 mr-1" />
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default React.memo(DesignTableBase);