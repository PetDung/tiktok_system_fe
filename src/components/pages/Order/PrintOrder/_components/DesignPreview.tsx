import ThumbPreview from "@/components/pages/Design/_components/ThumbPreview";
import { Design, LineItem } from "@/service/types/ApiResponse";
import { X } from "lucide-react";

export default function DesignPreview({
    design,
    disabledSelect,
    clear,
    ids,
    item,
    openAddDesign,
}: {
    design: Design;
    disabledSelect?: boolean;
    clear: (ids: string[]) => void;
    ids: string[];
    item: LineItem
    openAddDesign: (lineItem: any) => void;
}) {
    const imageUrls = [
        { url: design.front, label: "Front" },
        { url: design.back, label: "Back" },
        { url: design.leftUrl, label: "Left" },
        { url: design.rightUrl, label: "Right" },
    ].filter((item): item is { url: string; label: string } => !!item.url);

    if (imageUrls.length === 0) {
        return (
            <div
                onClick={() => openAddDesign({ item, design })}
                className="w-15 h-15 flex items-center justify-center border border-gray-300 rounded cursor-pointer"
            >
                <span className="text-2xl text-gray-400">+</span>
            </div>
        );
    }

    return (
        <div className="relative flex gap-2">
            {/* Nhóm ảnh */}
            {imageUrls.map((item, index) => (
                <div key={index} className="flex flex-col items-center">
                    <ThumbPreview size={60} thumbUrl={item.url} />
                    <span className="text-xs text-gray-500 mt-1">{item.label}</span>
                </div>
            ))}

            {/* Nút X bao toàn bộ */}
            {!disabledSelect && (
                <button
                    type="button"
                    onClick={() => clear(ids)}
                    className="absolute -top-2 -right-2 bg-white rounded-full w-5 h-5 flex items-center justify-center text-red-500 shadow-md hover:bg-gray-100"
                >
                    <X size={20} />
                </button>
            )}
        </div>
    );
}