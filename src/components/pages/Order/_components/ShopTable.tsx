import { ShopResponse } from "@/service/types/ApiResponse";

export type ShopTableProps = {
  data: ShopResponse[];
  hanlderClick: (shopId: string) => void;
};

export default function ShopTable({ data, hanlderClick }: ShopTableProps) {
  return (
    <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex flex-col">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Danh sách Shop</h2>

      <div  className="flex-1 min-h-0 overflow-auto">
        <div className="relative h-full overflow-auto rounded-lg border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">ID Shop</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">TikTok Shop</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Tên hiển thị</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Ngày tạo</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.length > 0 ? (
              data.map((shop) => (
                <tr key={shop.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3">{shop.id}</td>
                  <td className="px-4 py-3">{shop.tiktokShopName}</td>
                  <td className="px-4 py-3">{shop.userShopName}</td>
                  <td className="px-4 py-3">
                    {new Date(shop.createdAt).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => hanlderClick(shop.id)}
                      className="px-4 py-1 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition shadow-sm"
                    >
                      Check đơn
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-400">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}
