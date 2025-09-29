"use client";
import { Search, Upload, Sparkles } from "lucide-react";
import ShopSelect from "../_components/ShopSelect";
import { ShopResponse } from "@/service/types/ApiResponse";

interface Props {
  productId: string;
  setProductId: (val: string) => void;
  shop: string;
  shops: ShopResponse[];
  setShop: (val: string) => void;
  handleSearch: () => void;
  handleSubmit: () => void;
}

export default function SearchBar({
  productId,
  setProductId,
  shop,
  shops,
  setShop,
  handleSearch,
  handleSubmit
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const isSearchDisabled = !productId.trim() || !shop;
  const isSubmitDisabled = !productId.trim() || !shop;

  return (
    <div className="flex items-center gap-3 w-full">
      {/* Product ID Input */}
      <div className="relative flex-1">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <Sparkles className="w-4 h-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Nhập Product ID..."
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full pl-11 pr-4 py-3 text-sm font-medium
                   border-2 border-gray-200 rounded-xl bg-white
                   transition-all duration-200
                   hover:border-blue-400 hover:shadow-md
                   focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                   placeholder:text-gray-400"
        />
      </div>

      {/* Shop Select */}
      <div className="w-64">
        <ShopSelect shops={shops} value={shop} onChange={(val) => setShop(val)} />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={isSearchDisabled}
          className={`
            flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium
            transition-all duration-200
            ${isSearchDisabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:scale-105 active:scale-100"
            }
            focus:outline-none focus:ring-4 focus:ring-blue-100
          `}
        >
          <Search className="w-4 h-4" />
          <span className="whitespace-nowrap">Tìm kiếm</span>
        </button>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium
            transition-all duration-200
            ${isSubmitDisabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:scale-105 active:scale-100"
            }
            focus:outline-none focus:ring-4 focus:ring-green-100
          `}
        >
          <Upload className="w-4 h-4" />
          <span className="whitespace-nowrap">Submit</span>
        </button>
      </div>
    </div>
  );
}