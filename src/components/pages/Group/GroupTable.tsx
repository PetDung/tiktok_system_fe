import { Group } from '@/service/group/group-service';

interface GroupTableProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onDelete: (groupId: string) => void;
  onManageShops: (group: Group) => void;
  onManageManagers: (group: Group) => void;
}

export const GroupTable = ({
  groups,
  onEdit,
  onDelete,
  onManageShops,
  onManageManagers,
}: GroupTableProps) => {
  return (
    <div className="bg-white rounded-lg shadow min-h-[650px] flex flex-col">
      <div className="overflow-x-auto flex-1">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Tên nhóm
                </th>
                <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Mô tả
                </th>
                <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Quản lý
                </th>
                <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Cửa hàng
                </th>
                <th scope="col" className="sticky top-0 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
          {groups.map((group) => (
            <tr key={group.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{group.groupName}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">{group.description}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{group.memberCount} managers</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{group.shopCount} shops</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onEdit(group)}
                    className="text-indigo-600 hover:text-indigo-900 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onManageManagers(group)}
                    className="text-blue-600 hover:text-blue-900 hover:underline"
                  >
                    Nhân viên
                  </button>
                  <button
                    onClick={() => onManageShops(group)}
                    className="text-green-600 hover:text-green-900 hover:underline"
                  >
                    Shop
                  </button>
                  <button
                    onClick={() => onDelete(group.id)}
                    className="text-red-600 hover:text-red-900 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};