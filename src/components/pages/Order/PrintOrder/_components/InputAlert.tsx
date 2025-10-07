"use client";
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { PenLine, X } from "lucide-react";

type Props = {
  title?: string;
  placeholder?: string;
  onClose: (value: string | null) => void;
};

export default function InputAlert({ title = "Nhập giá trị", placeholder, onClose }: Props) {
  const [value, setValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = () => {
    setIsVisible(false);
    setTimeout(() => onClose(value), 200);
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(() => onClose(null), 200);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/40 flex items-center justify-center z-[9999] transition-opacity duration-200 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleCancel}
    >
      <div 
        className={`bg-white p-6 rounded-lg shadow-lg w-96 transform transition-all duration-200 ${
          isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <PenLine className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        
        <div className="relative mb-4">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-gray-700 focus:border-gray-800 focus:ring-2 focus:ring-gray-200 transition-all outline-none"
            placeholder={placeholder ?? "Nhập tại đây..."}
            autoFocus
          />
          {value && (
            <button
              onClick={() => setValue("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-gray-800 hover:bg-gray-900 active:scale-95 transition-all"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export function showInputAlert(options?: { title?: string; placeholder?: string }): Promise<string | null> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const handleClose = (value: string | null) => {
      root.unmount();
      container.remove();
      resolve(value);
    };

    root.render(
      <InputAlert
        title={options?.title}
        placeholder={options?.placeholder}
        onClose={handleClose}
      />
    );
  });
}