"use client";
import { Search, Filter } from "lucide-react";
import { Sku } from "@/service/types/productDetails";
import { getAllDesignSkusAndProduct, removeSkusDesign, SkuDesignMap } from "@/service/design/design-service";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import ThumbPreview from "./ThumbPreview";
import { getDrivePreviewUrl } from "./DesignTable";

interface Props {
  skus: Sku[];
  skuSearch: string;
  setSkuSearch: (val: string) => void;
  filters: { [key: string]: string };
  setFilters: (val: { [key: string]: string }) => void;
  selectedSkus: string[];
  setSelectedSkus: React.Dispatch<React.SetStateAction<string[]>>;
  productId: string;
}

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

  // Fetch design mapping
  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const skuIds: string[] = skus.map((sku) => sku.id.toString());
        const response = await getAllDesignSkusAndProduct(skuIds, productId);
        setDesignMap(response.result);
      } catch (error) {
        alert(error);
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

  const handleFilterChange = useCallback((attr: string, value: string) => {
    setFilters({
      ...filters,
      [attr]: value,
    });
  }, [filters, setFilters]);

  const toggleSku = useCallback((id: string) => {
    setSelectedSkus((prev: string[]) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, [setSelectedSkus]);

  const debouncedRef = useRef<number | null>(null);
  const onChangeSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debouncedRef.current) window.clearTimeout(debouncedRef.current);
    debouncedRef.current = window.setTimeout(() => setSkuSearch(value), 250);
  }, [setSkuSearch]);

  const filteredSkus = useMemo(() => {
    const query = skuSearch.toLowerCase();
    return skus.filter((sku) => {
      if (query && !sku.id.toLowerCase().includes(query)) {
        return false;
      }
      for (let attr of Object.keys(filters)) {
        if (
          filters[attr] &&
          !sku.sales_attributes.some(
            (a) => a.name === attr && a.value_name === filters[attr]
          )
        ) {
          return false;
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
    }
  }, [productId]);

  // Remove Design button for selected SKUs
  const selectedWithDesign = useMemo(() => selectedSkus.filter((id) => hasDesign(id)), [selectedSkus, hasDesign]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== skuSearch) {
      inputRef.current.value = skuSearch;
    }
  }, [skuSearch]);

  return (
    <div className="border rounded-2xl p-4 flex flex-col overflow-hidden">
      {/* Search */}
      <div className="flex items-center gap-2 mb-3">
        <Search size={18} className="text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm SKU..."
          defaultValue={skuSearch}
          onChange={onChangeSearch}
          className="flex-1 border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {filteredSkus.length}/{skus.length}
        </span>
        <Filter size={18} className="text-gray-500" />
      </div>

      {/* Filter by attribute */}
      <div className="flex gap-2 mb-3 flex-wrap">
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
            <select
              key={attr}
              value={filters[attr] || ""}
              onChange={(e) => handleFilterChange(attr, e.target.value)}
              className="border rounded-lg px-2 py-1 text-sm"
            >
              <option value="">{attr}</option>
              {values.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          );
        })}
      </div>

      {/* Remove Design All Button */}
      {selectedWithDesign.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <button
            onClick={() => {
              if (confirm(`Remove design from ${selectedWithDesign.length} selected SKU(s)?`)) {
                removeDesignFromSku(selectedWithDesign);
              }
            }}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Remove Design from Selected
          </button>
          <span className="text-xs text-gray-600">{selectedWithDesign.length} selected</span>
        </div>
      )}

      {/* SKU List */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-2 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="p-2 text-left">Ảnh</th>
              <th className="p-2 text-left">SKU</th>
              <th className="p-2 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredSkus.map((sku) => (
              <tr key={sku.id} className={`${hasDesign(sku.id) ? 'bg-gray-300' : ''}`}>
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedSkus.includes(sku.id)}
                    onChange={() => toggleSku(sku.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="flex items-center gap-2">
                  <div className="p-2">
                    <ThumbPreview
                      thumbUrl={getDrivePreviewUrl(designMap[sku.id] || "")}
                      alt={designMap[sku.id]?.name || ""}
                      size={60}
                    />
                  </div>
                </td>
                <td className="p-2 font-medium">
                  <div>{sku.id}</div>
                  {sku.sales_attributes.map((a) => (
                    <span
                      key={a.value_name}
                      className="px-2 py-0.5 bg-gray-100 rounded-lg text-xs mr-1"
                    >
                      {a.value_name}
                    </span>
                  ))}
                </td>
                <td className="p-2">
                  {hasDesign(sku.id) && (
                    <button
                      onClick={() => removeDesignFromSku([sku.id])}
                      className="text-red-500 text-xs px-2 py-1 border rounded hover:bg-red-50"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
