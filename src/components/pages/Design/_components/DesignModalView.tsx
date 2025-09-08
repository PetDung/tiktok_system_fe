"use client";

import { Design } from "@/service/types/ApiResponse";

type Props = {
  open: boolean;
  onClose: () => void;
  initial: Design;
  title?: string;
};

export default function DesignModalView({ open, onClose, initial, title = "View Design" }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* modal */}
      <div className="relative z-10 w-[95%] max-w-2xl rounded-lg bg-white shadow-lg ring-1 ring-black/5">
        {/* header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md px-2 py-1 text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-4 space-y-4">
          <div>
            <span className="text-gray-800 font-medium">Name:</span> {initial.name || "-"}
          </div>
          <div>
            <span className="text-gray-800 font-medium">Front Side:</span> {initial.frontSide || "-"}
          </div>
          <div>
            <span className="text-gray-800 font-medium">Back Side:</span> {initial.backSide || "-"}
          </div>
          <div>
            <span className="text-gray-800 font-medium">Left Side:</span> {initial.leftSide || "-"}
          </div>
          <div>
            <span className="text-gray-800 font-medium">Right Side:</span> {initial.rightSide || "-"}
          </div>
        </div>
      </div>
    </div>
  );
}
