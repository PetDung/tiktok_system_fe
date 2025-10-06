import { MoreVertical, Trash } from "lucide-react";
import ThumbPreview from "../pages/Design/_components/ThumbPreview";
import DesignView from "../pages/Design/_components/DesignView";
import { useState } from "react";
import { Design } from "@/service/types/ApiResponse";
import React from "react";

const DesignCard = React.memo(({ design, isSelected, onSelect, onDelete }: {
  design: Design;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div
      className={`relative group bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg cursor-pointer ${isSelected
        ? 'border-blue-500 shadow-md ring-2 ring-blue-200'
        : 'border-gray-200 hover:border-gray-300'
        }`}
      onClick={() => onSelect(design.id)}
    >
      <div className={`absolute top-3 left-3 z-10 w-5 h-5 rounded-full border-2 transition-all duration-200 ${isSelected
        ? 'bg-blue-500 border-blue-500'
        : 'bg-white border-gray-300 group-hover:border-blue-400'
        }`}>
        {isSelected && (
          <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="p-1 bg-white bg-opacity-80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-opacity-100"
        >
          <MoreVertical className="w-4 h-4 text-gray-600" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border py-2 min-w-[120px] z-20">
              <DesignView design={design} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(design.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <Trash className="w-4 h-4" />
                Xóa
              </button>
            </div>
          </>
        )}
      </div>

      <div className="aspect-square p-4 pb-2">
        <ThumbPreview thumbUrl={design.thumbnail || ""} alt={design.name} size={100} />
      </div>

      <div className="p-4 pt-2">
        <h3 className="font-medium text-gray-900 truncate mb-1">{design.name}</h3>
        <div className="flex items-center gap-2"><DesignView design={design} /></div>
      </div>
    </div>
  );
});
DesignCard.displayName = 'DesignCard';

export default DesignCard;