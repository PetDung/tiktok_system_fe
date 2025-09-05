"use client";

import { Loader2 } from "lucide-react";

export default function LoadingOverlay({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-12 w-12 animate-spin text-white" />
        <span className="text-white text-lg font-medium">Đang tải...</span>
      </div>
    </div>
  );
}
