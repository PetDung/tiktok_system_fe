"use client";

import { useState, useMemo, useEffect } from "react";

export type Option = {
  value: string;
  label: string;
};

interface Props {
  options: Option[];
  loading?: boolean;
  onChange?: (selected: Option[]) => void; // callback trả ra ngoài
  title?: string;
}

type FilterType = "all" | "selected" | "unselected";

export default function AdvancedMultiSelect({
  options,
  loading = false,
  onChange,
}: Props) {
  const [selected, setSelected] = useState<Option[]>([]);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");

  const toggleSelect = (option: Option) => {
    let newSelected: Option[];
    if (selected.find((o) => o.value === option.value)) {
      newSelected = selected.filter((o) => o.value !== option.value);
    } else {
      newSelected = [...selected, option];
    }
    setSelected(newSelected);
    onChange?.(newSelected); // gọi callback
  };

  const filteredOptions = useMemo(() => {
    return options.filter((o) => {
      const matchesSearch = o.label.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "selected" && selected.find((s) => s.value === o.value)) ||
        (filter === "unselected" && !selected.find((s) => s.value === o.value));
      return matchesSearch && matchesFilter;
    });
  }, [search, filter, selected, options]);

  return (
    <div className="relative w-60">
      {/* Thanh select hiển thị số lượng */}
      <div
        className="border rounded-lg p-1 flex justify-between items-center cursor-pointer bg-white"
        onClick={() => setOpen(!open)}
      >
        <span>
          {selected.length > 0
            ? `${selected.length} selected`
            : "Select fruits..."}
        </span>
        <svg
          className={`w-4 h-2 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full border rounded-lg bg-white shadow-lg">
          {/* Search + filter */}
          <div className="p-2 border-b">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border rounded px-2 py-1 mb-2 text-sm"
            />
            <div className="flex gap-2 text-sm">
              <button
                className={`px-2 py-1 rounded ${
                  filter === "all" ? "bg-blue-500 text-white" : "bg-gray-100"
                }`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`px-2 py-1 rounded ${
                  filter === "selected"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
                onClick={() => setFilter("selected")}
              >
                Selected
              </button>
              <button
                className={`px-2 py-1 rounded ${
                  filter === "unselected"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
                onClick={() => setFilter("unselected")}
              >
                Unselected
              </button>
            </div>
          </div>

          {/* List options */}
          <ul className="max-h-48 overflow-y-auto">
            {loading && (
              <li className="p-2 text-gray-400 text-sm">Đang load</li>
            )}

            {!loading && filteredOptions.length === 0 && (
              <li className="p-2 text-gray-400 text-sm">No options</li>
            )}
            {!loading &&
              filteredOptions.map((option) => {
                const isSelected = selected.find(
                  (o) => o.value === option.value
                );
                return (
                  <li
                    key={option.value}
                    className="flex justify-between items-center p-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => toggleSelect(option)}
                  >
                    <span>{option.label}</span>
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      )}
    </div>
  );
}
