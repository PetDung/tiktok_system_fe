"use client"
import { Building2, Plus, Search } from "lucide-react";
import ConfirmationModal from "../_components/ConfirmationModal";
import PrintShopFormModal, { CreatePrintShopDto } from "../_components/PrintShopForm";
import PrintShopList from "../_components/PrintShopList";
import { craterPrinter, deletePrinter, getAllPrinter, updatePrinter } from "@/service/print/print-service";
import { useMemo, useState } from "react";
import { PrintShop } from "@/service/types/ApiResponse";
import { usePrinters } from "@/lib/customHooks/usePrinters";

export default function PrintShopsPage() {
  const [editingPrinter, setEditingPrinter] = useState<PrintShop | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deletePrinterConfirm, setDeletePrinterConfirm] = useState<PrintShop | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: printersResponse, refresh } = usePrinters();
  const printers = (printersResponse?.result ?? []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  

  const filteredPrinters = useMemo(() => {
    return printers.filter((printer) =>
      printer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      printer.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [printers, searchTerm]);

  // Thêm mới printer
  const handleAdd = async (data: CreatePrintShopDto) => {
    try {
      await craterPrinter({ name: data.name, description: data.description });
      refresh();
    } catch (error: any) {
      alert(error.message || "Lỗi");
    }
    setShowAddModal(false);
  };

  // Update printer
  const handleUpdate = async (data: CreatePrintShopDto) => {
    if (!editingPrinter) return;
    try {
      await updatePrinter(editingPrinter.id, { name: data.name, description: data.description });
      refresh();
      setEditingPrinter(null);
    } catch (error: any) {
      alert(error.message || "Lỗi");
    }
  };

  // Delete printer
  const confirmDelete = async () => {
    if (!deletePrinterConfirm) return;
    try {
      await deletePrinter(deletePrinterConfirm.id);
      refresh();
      setDeletePrinterConfirm(null);
    } catch (error: any) {
      alert(error.message || "Lỗi");
    }
  };

  return (
    <div className="bg-gray-50 h-[90vh]">
      <div className="mx-auto p-2 flex flex-col h-full">
        {/* Header */}
        <div className="mb-8 flex gap-4 ">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản lý Nhà in</h1>
              <p className="text-gray-600 mt-1">Quản lý thông tin các nhà in và dịch vụ</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-1 flex-col sm:flex-row gap-4 items-end sm:items-center justify-end">
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhà in..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-[400px] pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="text-sm text-gray-500">
                {filteredPrinters.length} / {printers.length} nhà in
              </div>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center gap-2 shadow-md"
            >
              <Plus className="w-4 h-4" />
              Thêm nhà in
            </button>
          </div>
        </div>

        {/* Printers List */}
        <div className="flex-1">
          <PrintShopList
            data={filteredPrinters}
            onEdit={setEditingPrinter}
            onDelete={setDeletePrinterConfirm}
          />
        </div>

        {/* Add Modal */}
        <PrintShopFormModal
          isOpen={showAddModal}
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />

        {/* Edit Modal */}
        <PrintShopFormModal
          key={editingPrinter?.id ?? "new"}
          isOpen={!!editingPrinter}
          initialData={editingPrinter || undefined}
          onSubmit={handleUpdate}
          onClose={() => setEditingPrinter(null)}
        />

        {/* Delete confirmation */}
        <ConfirmationModal
          isOpen={!!deletePrinterConfirm}
          title="Xác nhận xóa nhà in"
          message={`Bạn có chắc chắn muốn xóa nhà in "${deletePrinterConfirm?.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDelete}
          onCancel={() => setDeletePrinterConfirm(null)}
          type="danger"
        />
      </div>
    </div>
  );
}
