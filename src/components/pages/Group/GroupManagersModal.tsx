import { Group } from '@/service/group/group-service';
import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { UserData } from '@/service/types/ApiResponse';

interface GroupManagersModalProps {
  group: Group;
  allManagers: UserData[];
  manager: UserData[];
  onAddManager: (managerId: string) => Promise<void>;
  onRemoveManager: (managerId: string) => Promise<void>;
  onClose: () => void;
}

export const GroupManagersModal = ({
  group,
  allManagers,
  manager,
  onAddManager,
  onRemoveManager,
  onClose,
}: GroupManagersModalProps) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const groupManagerIds = new Set(manager.map((m) => m.id));

  // Filter and search managers
  const filteredManagers = useMemo(() => {
    return allManagers.filter((manager) => {
      const matchesSearch = 
        manager.name.toLowerCase().includes(search.toLowerCase()) ||
        manager.username.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || manager.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [allManagers, search, roleFilter]);

  // Get unique roles for filter
  const roles = useMemo(() => {
    const roleSet = new Set(allManagers.map(m => m.role));
    return ['all', ...Array.from(roleSet)];
  }, [allManagers]);

  // Pagination
  const totalPages = Math.ceil(filteredManagers.length / itemsPerPage);
  const paginatedManagers = filteredManagers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-bold text-gray-800">Quản lý người quản lý nhóm</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search, Filter, and Stats Section */}
        <div className="px-6">
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="sm:w-48">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role === 'all' ? 'Tất cả vai trò' : role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm text-blue-600">Tổng số</div>
              <div className="text-xl font-bold text-blue-700">{allManagers.length}</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-sm text-green-600">Đã thêm</div>
              <div className="text-xl font-bold text-green-700">{group.memberCount}</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-sm text-purple-600">Đang hiển thị</div>
              <div className="text-xl font-bold text-purple-700">{filteredManagers.length}</div>
            </div>
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="text-sm text-orange-600">Trang</div>
              <div className="text-xl font-bold text-orange-700">{currentPage}/{totalPages}</div>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-hidden flex-1">
          <div className="overflow-auto h-[calc(90vh-24rem)]">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                    Tên
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                    Vai trò
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedManagers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{manager.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{manager.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${manager.role === 'admin' ? 'bg-red-100 text-red-800' : 
                        manager.role === 'manager' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}">
                        {manager.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {groupManagerIds.has(manager.id) ? (
                        <button
                          onClick={() => onRemoveManager(manager.id)}
                          className="text-sm px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                        >
                          Gỡ bỏ
                        </button>
                      ) : (
                        <button
                          onClick={() => onAddManager(manager.id)}
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
  );
};