import { useState } from "react";
import { Eye } from "lucide-react";
import { Design } from "@/service/types/ApiResponse";

export default function DesignView({ design }: { design: Design }) {
  const [isOpen, setIsOpen] = useState(false);

  // Các mặt có ảnh
  const sides: { key: keyof Design; label: string; url: string | undefined }[] = [
    { key: "frontSide" as keyof Design, label: "Front", url: design.frontSide },
    { key: "backSide" as keyof Design, label: "Back", url: design.backSide },
    { key: "leftSide" as keyof Design, label: "Left", url: design.leftSide },
    { key: "rightSide" as keyof Design, label: "Right", url: design.rightSide },
  ].filter((s) => s.url); // chỉ lấy những mặt có ảnh

  return (
    <div className="relative inline-block">
      {/* Nút View */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1"
      >
        <Eye className="w-4 h-4" />
        View
      </button>

      {/* Dropdown chọn mặt */}
      {isOpen && (
        <div className="absolute mt-2 bg-white border rounded shadow-md w-32 z-50">
          {sides.map((side) => (
            <a
              key={side.key}
              href={side.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-sm"
              onClick={() => setIsOpen(false)}
            >
              {side.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
