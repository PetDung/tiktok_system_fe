"use client";
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { AlertCircle } from "lucide-react";

type Props = {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onClose: (confirmed: boolean) => void;
};

export default function ConfirmAlert({ 
  title = "Xác nhận", 
  message = "Bạn có chắc chắn muốn thực hiện hành động này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onClose 
}: Props) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleConfirm = () => {
    setIsVisible(false);
    setTimeout(() => onClose(true), 200);
  };

  const handleCancel = () => {
    setIsVisible(false);
    setTimeout(() => onClose(false), 200);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleConfirm();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
            <AlertCircle className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
        </div>
        
        <p className="text-gray-600 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2.5 rounded-lg font-medium text-white bg-gray-800 hover:bg-gray-900 active:scale-95 transition-all"
            autoFocus
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function showConfirmAlert(options?: { 
  title?: string; 
  message?: string;
  confirmText?: string;
  cancelText?: string;
}): Promise<boolean> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const handleClose = (confirmed: boolean) => {
      root.unmount();
      container.remove();
      resolve(confirmed);
    };

    root.render(
      <ConfirmAlert
        title={options?.title}
        message={options?.message}
        confirmText={options?.confirmText}
        cancelText={options?.cancelText}
        onClose={handleClose}
      />
    );
  });
}