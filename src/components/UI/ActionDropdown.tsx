"use client";

import { useState } from "react";

type DropdownOption = {
  label: string;
  onClick: () => void;
};

type Props = {
  options: DropdownOption[];
};

export default function ActionDropdown({ options }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="px-1 py-1 relative">
      <div className="relative inline-block text-left">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="py-2 px-3 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none"
        >
          Actions
          <svg
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50">
            {options.map((opt, idx) => (
              <button
                key={idx}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  opt.onClick();
                  setOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
