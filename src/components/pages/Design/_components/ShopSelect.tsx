"use client";
import { useState } from "react";

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

  const filtered = shops.filter((s) =>
    s.userShopName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedShop = shops.find((s) => s.id === value);

  return (
    <div className="relative w-64">
      {/* Trigger */}
      <button
        type="button"
        className="w-full rounded-xl border bg-white px-3 py-2 text-left shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setOpen(!open)}
      >
        {selectedShop ? selectedShop.userShopName : "Chọn shop"}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-1 w-full rounded-xl border bg-white shadow-lg z-30">
          {/* Search input */}
          <div className="p-2">
            <input
              type="text"
              placeholder="Tìm shop..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {/* List */}
          <ul className="max-h-60 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((s) => (
                <li
                  key={s.id}
                  className={`cursor-pointer px-3 py-2 text-sm hover:bg-blue-100 ${
                    s.id === value ? "bg-blue-50 font-medium" : ""
                  }`}
                  onClick={() => {
                    onChange(s.id);
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  {s.userShopName}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500">
                Không tìm thấy
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
