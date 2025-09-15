"use client";
import { Search } from "lucide-react";
import ShopSelect from "../_components/ShopSelect";
import { ShopResponse } from "@/service/types/ApiResponse";

interface Props {
  productId: string;
  setProductId: (val: string) => void;
  shop: string;
  shops: ShopResponse[];
  setShop: (val: string) => void;
  handleSearch: () => void;
}

export default function SearchBar({
  productId,
  setProductId,
  shop,
  shops,
  setShop,
  handleSearch,
}: Props) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <input
        type="text"
        placeholder="Nhập Product ID..."
        value={productId}
        onChange={(e) => setProductId(e.target.value)}
        className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <ShopSelect shops={shops} value={shop} onChange={(val) => setShop(val)} />
      <button
        onClick={handleSearch}
        className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
      >
        <Search size={18} />
        Search
      </button>
    </div>
  );
}
