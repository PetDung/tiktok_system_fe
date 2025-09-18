"use client";

import { useState, useMemo } from "react";

export type Option = {
  value: string;
  label: string;
};

interface Props {
  options: Option[];
  loading?: boolean;
  onChange?: (selected: Option[]) => void;
  title?: string;
}

type FilterType = "all" | "selected" | "unselected";

export default function AdvancedMultiSelect({ options, loading = false, onChange }: Props) {
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
    onChange?.(newSelected);
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
    <div className="relative w-64">
      {/* Select summary */}
      <div
        className="border border-gray-300 rounded-lg p-2 flex justify-between items-center cursor-pointer bg-white shadow-sm hover:ring-1 hover:ring-blue-400 transition"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm text-gray-700">
          {selected.length > 0 ? `${selected.length} selected` : "Select shops"}
        </span>
        <svg
          className={`w-4 h-2 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-1 w-full border border-gray-300 rounded-lg bg-white shadow-xl">
          {/* Search & Filters */}
          <div className="p-3 border-b border-gray-300 flex flex-col gap-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
            <div className="flex gap-2">
              {(["all", "selected", "unselected"] as FilterType[]).map((f) => (
                <button
                  key={f}
                  className={`px-2 py-1 text-sm rounded-lg transition ${
                    filter === f ? "bg-blue-500 text-white" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Options List */}
          <ul className="max-h-56 overflow-y-auto">
            {loading && <li className="p-2 text-gray-400 text-sm">Loading...</li>}

            {!loading && filteredOptions.length === 0 && (
              <li className="p-2 text-gray-400 text-sm">No options</li>
            )}

            {!loading &&
              filteredOptions.map((option) => {
                const isSelected = selected.find((o) => o.value === option.value);
                return (
                  <li
                    key={option.value}
                    className="flex justify-between items-center p-2 text-sm hover:bg-blue-50 cursor-pointer transition"
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
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
