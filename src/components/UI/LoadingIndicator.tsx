const LoadingIndicator = () => (
    <div className="flex items-center justify-center py-6 space-x-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
      <span className="text-gray-600 font-medium">Đang tải thêm...</span>
    </div>
);

export default LoadingIndicator;