import { ShopResponse } from "@/service/types/ApiResponse";
import { useState } from "react";

export type ShopTableProps = {
  data: ShopResponse[];
  hanlderClick : (shopId: string) => void;
};

export default function ShopTable({ data, hanlderClick }: ShopTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const totalPages = Math.ceil(data.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  return (
    <div className="p-4 bg-white rounded-xl shadow-lg min-h-[80vh]">
      <h2 className="text-lg font-bold mb-4">Danh sách Shop</h2>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border-b text-left">ID Shop</th>
              <th className="px-4 py-2 border-b text-left">TikTok Shop</th>
              <th className="px-4 py-2 border-b text-left">Tên hiển thị</th>
              <th className="px-4 py-2 border-b text-left">Ngày tạo</th>
              <th className="px-4 py-2 border-b text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((shop) => (
                <tr
                  key={shop.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-2 border-b">{shop.id}</td>
                  <td className="px-4 py-2 border-b">{shop.tiktokShopName}</td>
                  <td className="px-4 py-2 border-b">{shop.userShopName}</td>
                  <td className="px-4 py-2 border-b">
                    {new Date(shop.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-2 border-b text-center space-x-2">
                    <button onClick={() => hanlderClick(shop.id)} className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                       Check đơn
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-4 text-center text-gray-500"
                >
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
