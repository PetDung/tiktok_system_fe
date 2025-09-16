"use client";

import { useState } from "react";
import { Pencil, Trash2, Search, Building2, FileText } from "lucide-react";
import { PrintShop } from "@/service/types/ApiResponse";
interface PrintShopListProps {
  data?: PrintShop[];
  onEdit?: (shop: PrintShop) => void;
  onDelete?: (p: PrintShop) => void;
}

export default function PrintShopList({ data = [], onEdit = () => {}, onDelete = () => {} }: PrintShopListProps) {``
  const [selectedShops, setSelectedShops] = useState<string[]>([]);
  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
          <Building2 className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có nhà in nào</h3>
        <p className="text-gray-500 text-center max-w-md">
          Hiện tại chưa có nhà in nào trong danh sách. Hãy thêm nhà in đầu tiên để bắt đầu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-1 flex-col">
      {/* Table */}
      <div className="bg-white rounded-xl flex-1 border border-gray-200 shadow-sm overflow-hidden">
        {/* Sticky Header */}
        <div>
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left">Tên</th>
                <th className="px-6 py-3 text-left">Mô tả</th>
                <th className="px-6 py-3 text-left">Hành động</th>
              </tr>
            </thead>
          </table>
          <div className="h-[500px] flex-1 overflow-y-auto">
            <table className="min-w-full border-collapse">
              <tbody className="divide-y divide-gray-200">
                {data.map(shop => (
                  <tr
                    key={shop.id}
                    className={`hover:bg-gray-50 transition-colors duration-150 ${
                      selectedShops.includes(shop.id) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{shop.name}</td>
                    <td className="px-6 py-4 text-gray-600">{shop.description}</td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => onEdit(shop)}
                        className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200"
                        title="Chỉnh sửa"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(shop)}
                        className="p-2.5 text-red-600 hover:bg-red-100 rounded-lg transition-all duration-200"
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {data.length === 0 && data.length > 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy kết quả</h3>
            <p className="text-gray-500">
              Không có nhà in nào khớp với từ khóa
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
