import { Grid, Plus } from "lucide-react";

const EmptyState = ({ hasSearch, onAddClick }: { hasSearch: boolean; onAddClick: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
      <Grid className="w-12 h-12 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">
      {hasSearch ? 'Không tìm thấy design' : 'Chưa có design nào'}
    </h3>
    <p className="text-gray-500 mb-6 max-w-sm">
      {hasSearch
        ? 'Hãy thử tìm kiếm với từ khóa khác hoặc tạo design mới.'
        : 'Bắt đầu bằng cách tạo design đầu tiên của bạn.'
      }
    </p>
    {!hasSearch && (
      <button
        onClick={onAddClick}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Tạo Design Mới
      </button>
    )}
  </div>
);
export default EmptyState;