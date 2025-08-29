"use client";
import { useEffect, useState } from "react";
import { Search, Upload, Filter } from "lucide-react";

export default function MappingDesignPage() {
  const [productId, setProductId] = useState("");
  const [shop, setShop] = useState("");
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);

  const [skuSearch, setSkuSearch] = useState("");
  const [designSearch, setDesignSearch] = useState("");
  const [filters, setFilters] = useState<{ [key: string]: string }>({});

  const shops = [
    { id: "shop1", name: "Shop 1" },
    { id: "shop2", name: "Shop 2" },
  ];

  // fake sku data
  const skus = [
    {
      id: "4324234324",
      seller_sku: "SKU-RED-M",
      sales_attributes: [
        { name: "Color", value_name: "Red" },
        { name: "Size", value_name: "M" },
      ],
    },
    {
      id: "3123123123",
      seller_sku: "SKU-BLUE-L",
      sales_attributes: [
        { name: "Color", value_name: "Blue" },
        { name: "Size", value_name: "L" },
        { name: "Type", value_name: "H" },
      ],
    },
    {
      id: "9988776655",
      seller_sku: "SKU-GREEN-XL",
      sales_attributes: [
        { name: "Color", value_name: "Green" },
        { name: "Size", value_name: "XL" },
        { name: "Type", value_name: "H" },
      ],
    },
  ];

  // fake design data
  const designs = [
    {
      id: "14a91c07-64fd-41b2-b01c-0bea0c95a540",
      name: "Custom design with logo on chest",
      frontSide: "https://cdn.example.com/designs/front.png",
    },
    {
      id: "22b11c07-64fd-41b2-b01c-0bea0c95a541",
      name: "Back print typography design",
      frontSide: "https://cdn.example.com/designs/back.png",
    },
  ];

  const toggleSku = (id: string) => {
    setSelectedSkus((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (attr: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [attr]: value,
    }));
  };

  const handleSubmit = () => {
    const payload = {
      productId,
      skuIds: selectedSkus,
      designId: selectedDesign,
    };
    alert(JSON.stringify(payload, null, 2));
  };

  // lấy danh sách attribute distinct từ SKU
  const attributes = Array.from(
    new Set(skus.flatMap((sku) => sku.sales_attributes.map((a) => a.name)))
  );

  const filteredSkus = skus.filter((sku) => {
    // lọc theo search
    if (skuSearch && !sku.seller_sku.toLowerCase().includes(skuSearch.toLowerCase())) {
      return false;
    }
    // lọc theo attribute
    for (let attr of Object.keys(filters)) {
      if (filters[attr] && !sku.sales_attributes.some((a) => a.name === attr && a.value_name === filters[attr])) {
        return false;
      }
    }
    return true;
  });

  const filteredDesigns = designs.filter((d) =>
    d.name.toLowerCase().includes(designSearch.toLowerCase())
  );

  function toDriveImageLink(link: string): string | null {
  const match = link.match(/\/d\/([^/]+)\//);
  if (!match) return null;
  const fileId = match[1];
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}


  return (
    <div className="flex flex-col items-center p-6">
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-2xl shadow p-6 flex flex-col">
        {/* Search Row */}
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="text"
            placeholder="Nhập Product ID..."
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={shop}
            onChange={(e) => setShop(e.target.value)}
            className="border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Chọn shop</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700">
            <Search size={18} />
            Search
          </button>
        </div>

        {/* Tables */}
        <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
          {/* SKU Column */}
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
                      s.sales_attributes.filter((a) => a.name === attr).map((a) => a.value_name)
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
                    <th className="p-2 text-left">Chọn</th>
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
                      </td>
                      <td className="p-2 font-medium">{sku.seller_sku}</td>
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

          {/* Design Column */}
          <div className="border rounded-2xl p-4 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Tìm design..."
                value={designSearch}
                onChange={(e) => setDesignSearch(e.target.value)}
                className="flex-1 border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Chọn</th>
                    <th className="p-2 text-left">Tên</th>
                    <th className="p-2 text-left">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDesigns.map((design) => (
                    <tr key={design.id} className="border-t">
                      <td className="p-2">
                        <input
                          type="radio"
                          name="design"
                          checked={selectedDesign === design.id}
                          onChange={() => setSelectedDesign(design.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="p-2 font-medium">{design.name}</td>
                      <td className="p-2">
                        <a
                            href={toDriveImageLink("https://drive.google.com/file/d/1sCNBqkF4N3aoCNWjWYp3rE8RYNs1DCjM/view") || ""}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                        >
                            View
                        </a>
                        </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700"
          >
            <Upload size={18} />
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
