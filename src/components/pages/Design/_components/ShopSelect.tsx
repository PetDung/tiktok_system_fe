"use client";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check, X } from "lucide-react";

interface Shop {
  id: string;
  userShopName: string;
}

interface ShopSelectProps {
  shops: Shop[];
  value: string;
  onChange: (value: string) => void;
}

export default function ShopSelect({ shops, value, onChange }: ShopSelectProps) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = shops.filter((s) =>
    s.userShopName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedShop = shops.find((s) => s.id === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [open]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setSearch("");
    }
  };

  const handleClearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <div className="relative w-full max-w-sm" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        className={`
          w-full flex items-center justify-between gap-2
          rounded-xl border-2 bg-white px-4 py-3
          text-left text-sm font-medium
          transition-all duration-200
          hover:border-blue-400 hover:shadow-md
          focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500
          ${open ? "border-blue-500 shadow-md ring-4 ring-blue-100" : "border-gray-200"}
        `}
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
      >
        <span className={selectedShop ? "text-gray-900" : "text-gray-400"}>
          {selectedShop ? selectedShop.userShopName : "Chọn shop..."}
        </span>
        <div className="flex items-center gap-1">
          {selectedShop && (
            <div
              className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              onClick={handleClearSelection}
            >
              <X className="w-3 h-3 text-gray-400 hover:text-gray-600" />
            </div>
          )}
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`} 
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div 
          className="absolute mt-2 w-full rounded-xl border-2 border-gray-200 bg-white shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Tìm kiếm shop..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border-2 border-gray-200 
                         focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none
                         transition-all duration-200"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <ul className="max-h-64 overflow-y-auto py-2">
            {filtered.length > 0 ? (
              filtered.map((s) => {
                const isSelected = s.id === value;
                return (
                  <li
                    key={s.id}
                    className={`
                      flex items-center justify-between gap-2
                      cursor-pointer px-4 py-3 text-sm
                      transition-colors duration-150
                      ${isSelected 
                        ? "bg-blue-50 text-blue-700 font-medium" 
                        : "text-gray-700 hover:bg-gray-50"
                      }
                    `}
                    onClick={() => {
                      onChange(s.id);
                      setOpen(false);
                      setSearch("");
                    }}
                  >
                    <span className="flex-1">{s.userShopName}</span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </li>
                );
              })
            ) : (
              <li className="px-4 py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium">
                    Không tìm thấy shop
                  </p>
                  <p className="text-xs text-gray-400">
                    Thử tìm kiếm với từ khóa khác
                  </p>
                </div>
              </li>
            )}
          </ul>

          {/* Footer with count */}
          {filtered.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                {filtered.length} {filtered.length === 1 ? "shop" : "shops"} tìm thấy
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}