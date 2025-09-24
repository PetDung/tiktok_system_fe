"use client";
import { Search, Filter, Trash, Grid, List, X, ChevronDown } from "lucide-react";
import { Sku } from "@/service/types/productDetails";
import { getAllDesignSkusAndProduct, removeSkusDesign, SkuDesignMap } from "@/service/design/design-service";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import ThumbPreview from "./ThumbPreview";

interface Props {
  skus: Sku[];
  skuSearch: string;
  setSkuSearch: (val: string) => void;
  filters: { [key: string]: string[] }; // Changed to array for multiple values
  setFilters: (val: { [key: string]: string[] }) => void;
  selectedSkus: string[];
  setSelectedSkus: React.Dispatch<React.SetStateAction<string[]>>;
  productId: string;
}

// Multi-select dropdown component
const MultiSelectDropdown = ({
  attribute,
  values,
  selectedValues,
  onSelectionChange
}: {
  attribute: string;
  values: string[];
  selectedValues: string[];
  onSelectionChange: (attr: string, values: string[]) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleValueToggle = (value: string) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(attribute, newValues);
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange(attribute, []);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          min-w-32 px-3 py-2 text-sm border rounded-lg flex items-center justify-between gap-2
          focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors
          ${selectedValues.length > 0
            ? 'border-blue-300 bg-blue-50 text-blue-700'
            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }
        `}
      >
        <span className="truncate">
          {selectedValues.length === 0
            ? attribute
            : selectedValues.length === 1
              ? selectedValues[0]
              : `${attribute} (${selectedValues.length})`
          }
        </span>
        <div className="flex items-center gap-1">
          {selectedValues.length > 0 && (
            <X
              className="w-3 h-3 hover:text-red-500 cursor-pointer"
              onClick={clearSelection}
            />
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full min-w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
          <div className="p-2">
            {values.map((value) => (
              <label
                key={value}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedValues.includes(value)}
                  onChange={() => handleValueToggle(value)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700 truncate">{value}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Active filters display component
const ActiveFilters = ({
  filters,
  onRemoveFilter,
  onClearAll
}: {
  filters: { [key: string]: string[] };
  onRemoveFilter: (attr: string, value: string) => void;
  onClearAll: () => void;
}) => {
  const activeFilters = Object.entries(filters).flatMap(([attr, values]) =>
    values.map(value => ({ attr, value }))
  );

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-gray-500 font-medium">Bộ lọc:</span>
      {activeFilters.map(({ attr, value }) => (
        <span
          key={`${attr}-${value}`}
          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
        >
          <span className="font-medium">{attr}:</span>
          <span>{value}</span>
          <button
            onClick={() => onRemoveFilter(attr, value)}
            className="ml-1 hover:text-blue-900"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        onClick={onClearAll}
        className="text-xs text-gray-500 hover:text-gray-700 underline"
      >
        Xóa tất cả
      </button>
    </div>
  );
};

// Loading skeleton component
const SkeletonCard = () => (
  <tr className="animate-pulse">
    <td className="p-4"><div className="bg-gray-200 rounded w-4 h-4"></div></td>
    <td className="p-4"><div className="bg-gray-200 rounded-lg h-16 w-16"></div></td>
    <td className="p-4">
      <div className="bg-gray-200 rounded h-4 mb-2"></div>
      <div className="bg-gray-200 rounded h-3 w-2/3"></div>
    </td>
    <td className="p-4"><div className="bg-gray-200 rounded h-6 w-16"></div></td>
  </tr>
);

// Empty state component
const EmptyState = ({ hasSearch, hasFilter }: { hasSearch: boolean; hasFilter: boolean }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Grid className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {hasSearch || hasFilter ? 'Không tìm thấy SKU' : 'Chưa có SKU nào'}
    </h3>
    <p className="text-gray-500 mb-6 max-w-sm">
      {hasSearch || hasFilter
        ? 'Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc.'
        : 'SKU sẽ hiển thị khi bạn tìm kiếm sản phẩm.'
      }
    </p>
  </div>
);

export default function SkuTable({
  skus,
  skuSearch,
  setSkuSearch,
  filters,
  setFilters,
  selectedSkus,
  setSelectedSkus,
  productId,
}: Props) {
  const [designMap, setDesignMap] = useState<SkuDesignMap>({});
  const [isLoading, setIsLoading] = useState(false);
  const debouncedRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Fetch design mapping
  useEffect(() => {
    const fetchDesigns = async () => {
      setIsLoading(true);
      try {
        const skuIds: string[] = skus.map((sku) => sku.id.toString());
        const response = await getAllDesignSkusAndProduct(skuIds, productId);
        setDesignMap(response.result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    if (skus.length > 0 && productId) {
      fetchDesigns();
    }
  }, [skus, productId]);

  // distinct attributes
  const attributes = useMemo(() => Array.from(
    new Set(skus.flatMap((sku) => sku.sales_attributes.map((a) => a.name)))
  ), [skus]);

  const handleMultiFilterChange = useCallback((attr: string, values: string[]) => {
    setFilters({
      ...filters,
      [attr]: values,
    });
  }, [filters, setFilters]);

  const handleRemoveFilter = useCallback((attr: string, value: string) => {
    const currentValues = filters[attr] || [];
    const newValues = currentValues.filter(v => v !== value);

    if (newValues.length === 0) {
      const newFilters = { ...filters };
      delete newFilters[attr];
      setFilters(newFilters);
    } else {
      setFilters({
        ...filters,
        [attr]: newValues,
      });
    }
  }, [filters, setFilters]);

  const handleClearAllFilters = useCallback(() => {
    setFilters({});
  }, [setFilters]);

  const toggleSku = useCallback((id: string) => {
    setSelectedSkus((prev: string[]) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, [setSelectedSkus]);

  const onChangeSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debouncedRef.current) window.clearTimeout(debouncedRef.current);

    setIsLoading(true);
    debouncedRef.current = window.setTimeout(() => {
      setSkuSearch(value);
      setIsLoading(false);
    }, 300);
  }, [setSkuSearch]);

  const filteredSkus = useMemo(() => {
    const query = skuSearch.toLowerCase();
    return skus.filter((sku) => {
      // Search filter
      if (query && !sku.id.toLowerCase().includes(query)) {
        return false;
      }

      // Multi-select attribute filters
      for (let attr of Object.keys(filters)) {
        const filterValues = filters[attr];
        if (filterValues && filterValues.length > 0) {
          const hasMatchingAttribute = sku.sales_attributes.some(
            (a) => a.name === attr && filterValues.includes(a.value_name)
          );
          if (!hasMatchingAttribute) {
            return false;
          }
        }
      }
      return true;
    });
  }, [skus, skuSearch, filters]);

  const isAllSelected = useMemo(() => (
    filteredSkus.length > 0 &&
    filteredSkus.every((sku) => selectedSkus.includes(sku.id))
  ), [filteredSkus, selectedSkus]);

  const toggleSelectAll = useCallback(() => {
    const allIds = filteredSkus.map((sku) => sku.id);
    const allSelected = allIds.every((id) => selectedSkus.includes(id));
    if (allSelected) {
      setSelectedSkus((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedSkus((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  }, [filteredSkus, selectedSkus, setSelectedSkus]);

  // check if SKU has design
  const hasDesign = useCallback((skuId: string) => !!designMap[skuId], [designMap]);

  // remove design from SKU
  const removeDesignFromSku = useCallback(async (skuIds: string[]) => {
    if (!window.confirm(`Remove design from ${skuIds.length} SKU(s)?`)) return;

    setIsLoading(true);
    try {
      await removeSkusDesign(productId, skuIds);
      setDesignMap(prev => {
        const newMap = { ...prev };
        skuIds.forEach((skuId) => {
          delete newMap[skuId];
        });
        return newMap;
      });
    } catch (error) {
      console.error("Failed to remove design from SKU:", error);
      alert(error);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // Remove Design button for selected SKUs
  const selectedWithDesign = useMemo(() => selectedSkus.filter((id) => hasDesign(id)), [selectedSkus, hasDesign]);

  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== skuSearch) {
      inputRef.current.value = skuSearch;
    }
  }, [skuSearch]);

  const hasSearch = skuSearch.length > 0;
  const hasFilter = Object.values(filters).some(values => values.length > 0);
  const hasResults = filteredSkus.length > 0;

  return (
    <div className="bg-white flex flex-col shadow-sm border border-gray-200 h-full relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Tìm kiếm SKU..."
                defaultValue={skuSearch}
                onChange={onChangeSearch}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                </div>
              )}
            </div>
            {/* Multi-select Filters */}
            {attributes.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-gray-500" />
                {attributes.map((attr) => {
                  const values = Array.from(
                    new Set(
                      skus.flatMap((s) =>
                        s.sales_attributes
                          .filter((a) => a.name === attr)
                          .map((a) => a.value_name)
                      )
                    )
                  );
                  return (
                    <MultiSelectDropdown
                      key={attr}
                      attribute={attr}
                      values={values}
                      selectedValues={filters[attr] || []}
                      onSelectionChange={handleMultiFilterChange}
                    />
                  );
                })}
              </div>
            )}
          </div>
          <div>
            {/* Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Select All Checkbox */}
              <div className="flex items-center gap-3">
                {filteredSkus.length > 0 && (
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">Chọn tất cả</span>
                  </label>
                )}

                {/* Results count */}
                <span className="text-sm text-gray-500">
                  {filteredSkus.length} / {skus.length} SKUs
                  {selectedSkus.length > 0 && ` (${selectedSkus.length} đã chọn)`}
                </span>
              </div>

              {/* Remove Design Button */}
              {selectedWithDesign.length > 0 && (
                <button
                  onClick={() => removeDesignFromSku(selectedWithDesign)}
                  className="inline-flex items-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Remove Design ({selectedWithDesign.length})
                </button>
              )}
            </div>
            {/* Active Filters */}
            <ActiveFilters
              filters={filters}
              onRemoveFilter={handleRemoveFilter}
              onClearAll={handleClearAllFilters}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 p-2 overflow-y-auto">
        {!hasResults ? (
          <EmptyState hasSearch={hasSearch} hasFilter={hasFilter} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <tbody className="bg-white divide-y divide-gray-100">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <SkeletonCard key={index} />
                  ))
                ) : (
                  filteredSkus.map((sku) => (
                    <tr
                      key={sku.id}
                      className={`hover:bg-gray-50 transition-colors ${hasDesign(sku.id) ? 'bg-blue-50' : ''
                        } ${selectedSkus.includes(sku.id) ? 'ring-2 ring-blue-200' : ''
                        }`}
                    >
                      <td className="py-4 px-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedSkus.includes(sku.id)}
                            onChange={() => toggleSku(sku.id)}
                            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </label>
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {hasDesign(sku.id) ? (
                            <ThumbPreview
                              thumbUrl={designMap[sku.id].thumbnail || ""}
                              alt={designMap[sku.id]?.name || ""}
                              size={64}
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No Design</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900 mb-1">{sku.id}</div>
                        <div className="flex flex-wrap gap-1">
                          {sku.sales_attributes.map((a) => (
                            <span
                              key={a.value_name}
                              className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                            >
                              {a.value_name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {hasDesign(sku.id) && (
                          <button
                            onClick={() => removeDesignFromSku([sku.id])}
                            className="inline-flex items-center px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors flex-shrink-0"
                          >
                            <Trash className="w-3 h-3 mr-1" />
                            Remove
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}