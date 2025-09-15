"use client";
import { Search, Trash } from "lucide-react";
import { Design } from "@/service/types/ApiResponse";
import DesignView from "../_components/DesignView";
import ThumbPreview from "./ThumbPreview";
import { useMemo, useCallback, useRef, useEffect } from "react";
import React from "react";

interface Props {
  designs: Design[];
  designSearch: string;
  setDesignSearch: (val: string) => void;
  selectedDesign: string;
  setSelectedDesign: (val: string) => void;
  handleDeleteDesign: (id: string) => void;
  setOpen: (val: boolean) => void;
}

function getPreviewImage(design: Design): string {
  return (
    design.frontSide ||
    design.backSide ||
    design.leftSide ||
    design.rightSide ||
    ""
  );
}
export function getFileIdFromDriveLink(driveLink: string): string {
  const fileIdMatch = driveLink.match(/[-\w]{25,}/);
  const fileId = fileIdMatch ? fileIdMatch[0] : driveLink;
  return fileId;
}

export function getDrivePreviewUrl(design: Design): string {
  const driveLink = getPreviewImage(design);
  const fileId = getFileIdFromDriveLink(driveLink);
  const basUrl = process.env.NEXT_PUBLIC_API_URL;
  return `${basUrl}/files/thumb?id=${fileId}`;
}

function DesignTableBase({
  designs,
  designSearch,
  setDesignSearch,
  selectedDesign,
  setSelectedDesign,
  handleDeleteDesign,
  setOpen,
}: Props) {
  const debouncedRef = useRef<number | null>(null);

  const filteredDesigns = useMemo(() => {
    const query = designSearch.toLowerCase();
    if (!query) return designs;
    return designs.filter((d) => d.name.toLowerCase().includes(query));
  }, [designs, designSearch]);

  const onChangeSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (debouncedRef.current) {
      window.clearTimeout(debouncedRef.current);
    }
    debouncedRef.current = window.setTimeout(() => {
      setDesignSearch(value);
    }, 250);
  }, [setDesignSearch]);

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (inputRef.current && inputRef.current.value !== designSearch) {
      inputRef.current.value = designSearch;
    }
  }, [designSearch]);

  const onSelectDesign = useCallback((id: string) => {
    setSelectedDesign(id);
  }, [setSelectedDesign]);

  const onDelete = useCallback((id: string) => {
    handleDeleteDesign(id);
  }, [handleDeleteDesign]);

  const openAdd = useCallback(() => setOpen(true), [setOpen]);

  return (
    <div className="border rounded-2xl p-4 flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <Search size={18} className="text-gray-500" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Tìm design..."
          defaultValue={designSearch}
          onChange={onChangeSearch}
          className="flex-1 border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="text-xs text-gray-500 whitespace-nowrap">
          {filteredDesigns.length}/{designs.length}
        </span>
        <div className="p-6">
          <button
            onClick={openAdd}
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Add design
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-1">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="p-2 text-left">Chọn</th>
              <th className="p-2 text-left">Ảnh</th>
              <th className="p-2 text-left">Tên</th>
              <th className="p-2 text-left">Preview</th>
            </tr>
          </thead>
          <tbody>
            {filteredDesigns.map((design) => (
              <tr key={design.id} className="border-t">
                <td className="p-2">
                  <input
                    type="radio"
                    name="design"
                    checked={selectedDesign === design.id}
                    onChange={() => onSelectDesign(design.id)}
                    className="w-4 h-4"
                  />
                </td>
                <td className="p-2 font-medium">
                    <ThumbPreview
                      thumbUrl={getDrivePreviewUrl(design)}
                      alt={design.name}
                      size={100}
                    />
                </td>
                <td className="p-2 font-medium">{design.name}</td>
                <td className="p-2 text-center">
                  <div className="flex gap-2 items-center justify-center">
                    <button
                      onClick={() => onDelete(design.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1"
                    >
                      <Trash className="w-4 h-4" />
                      Delete
                    </button>
                    <DesignView design={design} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default React.memo(DesignTableBase);
