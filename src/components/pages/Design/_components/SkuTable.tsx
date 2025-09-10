"use client";
import { Search, Filter } from "lucide-react";
import { Sku } from "@/service/types/productDetails";

interface Props {
  skus: Sku[];
  skuSearch: string;
  setSkuSearch: (val: string) => void;
  filters: { [key: string]: string };
  setFilters: (val: { [key: string]: string }) => void;
  selectedSkus: string[];
  setSelectedSkus: React.Dispatch<React.SetStateAction<string[]>>;
  handlerClickSku: (skuId: string, productId: string) => void;
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
  handlerClickSku,
  productId,
}: Props) {
  // danh sách attribute distinct
  const attributes = Array.from(
    new Set(skus.flatMap((sku) => sku.sales_attributes.map((a) => a.name)))
  );

  const handleFilterChange = (attr: string, value: string) => {
    setFilters({
      ...filters,
      [attr]: value,
    });
  };

  const toggleSku = (id: string) => {
    setSelectedSkus((prev: string[]) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const filteredSkus = skus.filter((sku) => {
    if (skuSearch && !sku.id.toLowerCase().includes(skuSearch.toLowerCase())) {
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

  const isAllSelected =
    filteredSkus.length > 0 &&
    filteredSkus.every((sku) => selectedSkus.includes(sku.id));

  const toggleSelectAll = () => {
    const allIds = filteredSkus.map((sku) => sku.id);
    const allSelected = allIds.every((id) => selectedSkus.includes(id));
    if (allSelected) {
      setSelectedSkus((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedSkus((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  return (
    <div className="border rounded-2xl p-4 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Search size={18} className="text-gray-500" />
        <input
          type="text"
          placeholder="Tìm SKU..."
          value={skuSearch}
          onChange={(e) => setSkuSearch(e.target.value)}
          className="flex-1 border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
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

      {/* SKU List */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="p-2 text-left">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={toggleSelectAll}
                  className="w-4 h-4"
                />
              </th>
              <th className="p-2 text-left">SKU</th>
              <th className="p-2 text-left">Thuộc tính</th>
            </tr>
          </thead>
          <tbody>
            {filteredSkus.map((sku) => (
              <tr key={sku.id} className="border-t">
                <td className="p-2">
                  <input
                    type="checkbox"
                    checked={selectedSkus.includes(sku.id)}
                    onChange={() => toggleSku(sku.id)}
                    className="w-4 h-4"
                  />
                  <div
                    onClick={() => handlerClickSku(sku.id, productId)}
                    className="text-blue-500 text-xs cursor-pointer hover:underline"
                  >
                    Xem design hiện tại
                  </div>
                </td>
                <td className="p-2 font-medium">{sku.id}</td>
                <td className="p-2">
                  {sku.sales_attributes.map((a) => (
                    <span
                      key={a.value_name}
                      className="px-2 py-0.5 bg-gray-100 rounded-lg text-xs mr-1"
                    >
                      {a.value_name}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
