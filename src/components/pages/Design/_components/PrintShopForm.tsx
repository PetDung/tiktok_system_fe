import { PrintShop } from "@/service/types/ApiResponse";
import { Building2, Plus } from "lucide-react";
import { useState } from "react";

export type CreatePrintShopDto = {
  name: string;
  description: string;
};

export default function PrintShopFormModal({ 
  isOpen, 
  initialData, 
  onSubmit, 
  onClose 
}: {
  isOpen: boolean;
  initialData?: PrintShop;
  onSubmit: (data: CreatePrintShopDto) => void; 
  onClose: () => void;
}) {
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{name?: string; description?: string}>({});

  const isEditing = !!initialData;

  const validateForm = () => {
    const newErrors: {name?: string; description?: string} = {};
    
    if (!name.trim()) {
      newErrors.name = "Tên nhà in là bắt buộc";
    } else if (name.trim().length < 3) {
      newErrors.name = "Tên nhà in phải có ít nhất 3 ký tự";
    }
    
    if (!description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    } else if (description.trim().length < 10) {
      newErrors.description = "Mô tả phải có ít nhất 10 ký tự";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      onSubmit({ name: name.trim(), description: description.trim() });
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
    setTimeout(() => {
      setName(initialData?.name || "");
      setDescription(initialData?.description || "");
      setErrors({});
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              {isEditing ? (
                <Building2 className="w-4 h-4 text-white" />
              ) : (
                <Plus className="w-4 h-4 text-white" />
              )}
            </div>
            <h2 className="text-xl font-bold text-white">
              {isEditing ? "Chỉnh sửa nhà in" : "Thêm nhà in mới"}
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
          >
            <span className="text-white text-xl">×</span>
          </button>
        </div>

        {/* Form */}
        <div className="p-6">
          <div className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Building2 className="w-4 h-4 text-gray-500" />
                Tên nhà in
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors(prev => ({...prev, name: undefined}));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                  errors.name 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Nhập tên nhà in..."
                disabled={isSubmitting}
                maxLength={100}
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description Field */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <span className="text-gray-500">📝</span>
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) setErrors(prev => ({...prev, description: undefined}));
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                  errors.description 
                    ? 'border-red-300 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                placeholder="Mô tả về nhà in..."
                rows={4}
                disabled={isSubmitting}
                maxLength={500}
              />
              {errors.description && (
                <p className="text-red-600 text-sm mt-1">{errors.description}</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !name.trim() || !description.trim()}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  💾 {isEditing ? "Cập nhật" : "Thêm mới"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}