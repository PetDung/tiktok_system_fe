import React, { useEffect, useState, useRef } from "react";
import { Eye, X } from "lucide-react";

// Props type
export type ThumbPreviewProps = {
  thumbUrl: string; // ✅ truyền trực tiếp URL thumbnail
  fullImageUrl?: string; // optional full-size image URL
  size?: number; // thumbnail size in px
  alt?: string;
};

/**
 * ThumbPreview
 * Component hiển thị ảnh thumbnail (URL truyền trực tiếp)
 * Hover có icon con mắt → click mở modal xem ảnh lớn.
 */
export default function ThumbPreview({
  thumbUrl,
  fullImageUrl,
  size = 100,
  alt = "",
}: ThumbPreviewProps) {
  const [open, setOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const largeUrl = fullImageUrl || thumbUrl;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // close when clicking outside image
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!open) return;
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <>
      <div
        className="relative inline-block"
        style={{ width: size, height: size }}
      >
        {/* gray background */}
        <div className="w-full h-full bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
          <img
            src={thumbUrl}
            alt={alt}
            width={size}
            height={size}
            loading="lazy"
            style={{ objectFit: "cover", display: "block", width: "100%", height: "100%" }}
          />
        </div>

        {/* eye overlay */}
        <button
          aria-label="Preview image"
          onClick={() => setOpen(true)}
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200"
        >
          <div className="p-2 rounded-full bg-black/40 backdrop-filter backdrop-blur-sm">
            <Eye className="w-6 h-6 text-white" strokeWidth={1.6} />
          </div>
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />

          <div
            ref={modalRef}
            className="relative max-w-[90vw] max-h-[90vh] p-4 rounded-lg z-10"
            style={{ outline: "none" }}
          >
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 z-20"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="rounded-md overflow-hidden bg-gray-100 p-2">
              <img
                src={largeUrl}
                alt={alt}
                style={{ display: "block", maxWidth: "80vw", maxHeight: "80vh", objectFit: "contain" }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}