import { Group } from '@/service/group/group-service';
import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { ShopResponse } from '@/service/types/ApiResponse';

interface GroupShopsModalProps {
  group: Group;
  allShops: ShopResponse[];
  shopMember: ShopResponse[];
  onAddShop: (shopId: string) => Promise<void>;
  onRemoveShop: (shopId: string) => Promise<void>;
  onClose: () => void;
}

export const GroupShopsModal = ({
  group,
  allShops,
  shopMember,
  onAddShop,
  onRemoveShop,
  onClose,
}: GroupShopsModalProps) => {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const groupShopIds = new Set(shopMember.map((s) => s.id));

  // Filter and search shops
  const filteredShops = useMemo(() => {
    return allShops.filter((shop) => {
      const searchLower = search.toLowerCase();
      return (
        shop.userShopName.toLowerCase().includes(searchLower) ||
        shop.id.toLowerCase().includes(searchLower)
      );
    });
  }, [allShops, search]);

  // Pagination
  const totalPages = Math.ceil(filteredShops.length / itemsPerPage);
  const paginatedShops = filteredShops.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-bold text-gray-800">Quản lý cửa hàng trong nhóm</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Stats Section */}
        <div className="px-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên shop hoặc ID..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600">Tổng số</div>
              <div className="text-xl font-bold text-blue-700">{allShops.length}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600">Đã thêm</div>
              <div className="text-xl font-bold text-green-700">{group.shopCount}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-purple-600">Đang hiển thị</div>
              <div className="text-xl font-bold text-purple-700">{filteredShops.length}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-sm text-orange-600">Trang</div>
              <div className="text-xl font-bold text-orange-700">{currentPage}/{totalPages}</div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden flex-1 h-[500px]">
          <div className="overflow-auto h-[calc(90vh-24rem)]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                    Tên cửa hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                    ID cửa hàng
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{shop.userShopName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{shop.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {groupShopIds.has(shop.id) ? (
                        <button
                          onClick={() => onRemoveShop(shop.id)}
                          className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                        >
                          Gỡ bỏ
                        </button>
                      ) : (
                        <button
                          onClick={() => onAddShop(shop.id)}
                          className="text-sm px-3 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                        >
                          Thêm
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Đầu
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Sau
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                Cuối
              </button>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};