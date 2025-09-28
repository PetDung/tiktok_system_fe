import React, { useState, useRef, useEffect } from "react";

export type Option = {
  value: string;
  label: string;
  description?: string;
  hidden? : boolean;
};

type Props = {
  options: Option[];
  value?: string | null;
  placeholder?: string;
  allowClear?: boolean;
  onChange?: (value: string | null) => void;
  className?: string;
  size?: number;
  disabled?: boolean; // 🔥 mới thêm
};

export default function OptionalSelect({
  options,
  value = null,
  placeholder = "Select...",
  allowClear = true,
  onChange,
  className = "",
  size = 200,
  disabled = false, // 🔥 default = false
}: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<"bottom" | "top">("bottom");
  const rootRef = useRef<HTMLDivElement | null>(null);

  // Close on outside click
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Tính toán vị trí khi mở dropdown
  useEffect(() => {
    if (open && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;

      if (spaceBelow < 224 && spaceAbove > spaceBelow) {
        setPosition("top");
      } else {
        setPosition("bottom");
      }
    }
  }, [open]);

  const selected = options.find((o) => o.value === value) || null;

  function toggle() {
    if (!disabled) setOpen((s) => !s); // 🔥 không mở nếu disabled
  }

  function handleSelect(value: string | null) {
    if (disabled) return; // 🔥 chặn chọn
    onChange?.(value);
    setOpen(false);
  }

  function clear() {
    if (disabled) return; // 🔥 chặn clear
    onChange?.(null);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={toggle}
        style={{ width: `${size}px` }}
        className={`text-left px-3 py-2 border rounded-lg shadow-sm flex items-center justify-between gap-2 focus:outline-none ${
          disabled
            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
            : "bg-white border-gray-200 hover:shadow-md focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400"
        }`}
      >
        <div className="flex flex-col">
          <span
            className={`truncate ${
              selected ? "text-gray-900 font-medium" : "text-gray-400"
            }`}
          >
            {selected ? selected.label : placeholder}
          </span>
          {selected?.description && (
            <small className="text-gray-500 text-xs">
              {selected.description}
            </small>
          )}
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform ${
            open ? "transform rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
        >
          <path
            d="M6 8l4 4 4-4"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && !disabled && (
        <ul
          role="listbox"
          tabIndex={-1}
          className={`absolute z-50 w-56 max-h-56 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg py-1 ${
            position === "bottom" ? "mt-2 top-full" : "mb-2 bottom-full"
          }`}
        >
          {allowClear && (
            <li
              key="none"
              role="option"
              onClick={() => handleSelect(null)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-50"
            >
              Không có
            </li>
          )}
          {options
            .filter(opt => (!opt.hidden && opt.value !== value))
            .map(opt => (
                <li
                key={opt.value}
                role="option"
                onClick={() => handleSelect(opt.value)}
                className="px-3 py-2 cursor-pointer hover:bg-gray-50"
                >
                <span className="truncate">{opt.label}</span>
                {opt.description && (
                    <small className="text-xs text-gray-500">{opt.description}</small>
                )}
                </li>
            ))}
          {options.length === 0 && (
            <li className="px-3 py-2 text-gray-500">No options</li>
          )}
        </ul>
      )}
    </div>
  );
}
