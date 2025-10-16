import React, { useEffect, useState, useRef } from "react";
import { Eye, X } from "lucide-react";
import { Img } from "react-image";
import { FastAverageColor } from 'fast-average-color';

export type ThumbPreviewProps = {
  thumbUrl: string;
  fullImageUrl?: string;
  size?: number;
  alt?: string;
};

export default function ThumbPreview({
  thumbUrl,
  fullImageUrl,
  size = 100,
  alt = "",
}: ThumbPreviewProps) {
  const [open, setOpen] = useState(false);
  const [bgColor, setBgColor] = useState("#d1d5db"); // default gray-300
  const modalRef = useRef<HTMLDivElement | null>(null);

  const largeUrl = fullImageUrl || thumbUrl;

  // Tính màu nền dựa trên ảnh
  useEffect(() => {
    const fac = new FastAverageColor();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = thumbUrl;

    img.onload = () => {
      const color = fac.getColor(img);
      // Nếu ảnh tối -> nền sáng, nếu ảnh sáng -> nền tối
      setBgColor(color.isDark ? "#ffffff" : "#222222");
    };
  }, [thumbUrl]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

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
      <div className="relative inline-block" style={{ width: size, height: size }}>
        {/* background tự động */}
        <div
          className="w-full h-full rounded-lg flex items-center justify-center"
          style={{ backgroundColor: bgColor }}
        >
          <Img
            src={thumbUrl}
            alt={alt}
            className="w-full h-full object-contain"
            loader={<div className="w-full h-full bg-gray-200 animate-pulse" />}
            unloader={
              <div className="w-full h-full bg-red-200 flex items-center justify-center">
                Not exist
              </div>
            }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />

          {/* Modal content */}
          <div
            ref={modalRef}
            className="relative z-10 max-w-[90vw] max-h-[90vh] p-4 rounded-lg bg-white shadow-lg focus:outline-none"
          >
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Caption */}
            {alt && (
              <p className="mb-2 text-sm text-gray-700 max-w-[80vw] truncate">{alt}</p>
            )}

            {/* Image */}
            <div
              className="rounded-md overflow-hidden p-2 flex items-center justify-center"
              style={{ backgroundColor: bgColor }}
            >
              <Img
                src={largeUrl}
                alt={alt}
                loader={<div className="w-[80vw] h-[80vh] bg-gray-200 animate-pulse" />}
                unloader={
                  <div className="w-[80vw] h-[80vh] bg-red-200 flex items-center justify-center">
                    Not exist
                  </div>
                }
                className="block max-w-[80vw] max-h-[80vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
