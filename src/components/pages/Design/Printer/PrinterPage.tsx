"use client";

import { useEffect, useState } from "react";
import { Plus, Building2, Search } from "lucide-react";
import PrintShopFormModal, { CreatePrintShopDto } from "../_components/PrintShopForm";
import ConfirmationModal from "../_components/ConfirmationModal";
import PrintShopList from "../_components/PrintShopList";
import { craterPrinter, deletePrinter, getAllPrinter, updatePrinter } from "@/service/print/print-service";
import { PrintShop } from "@/service/types/ApiResponse";

export interface PrintRequesst {
  name: string;
  description: string;
}

// Main Page Component
export default function PrintShopsPage() {
  const [shops, setShops] = useState<PrintShop[]>([]);

  const [editingShop, setEditingShop] = useState<PrintShop | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<PrintShop | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const loadPrinter = async () =>{
     try{
        const response = await getAllPrinter();
        setShops(response.result)
    }catch(error: any){
        alert(error.message || "Lỗi")
    }
  }

  useEffect(() =>{
    loadPrinter();
  },[])

  // Filter shops theo search
  const filteredShops = shops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Thêm mới nhà in
  const handleAdd = async (data: CreatePrintShopDto) => {
    const newPrinter: PrintRequesst ={
        name: data.name,
        description: data.description
    };
    
    try{
        const response = await craterPrinter(newPrinter);
        console.log(response)
        setShops(prev => [response.result,...prev])
    }catch(error: any){
        alert(error.message || "Lỗi")
    }


    setShowAddModal(false);
  };

  // Cập nhật nhà in
  const handleUpdate = async (data: CreatePrintShopDto) => {
    if (!editingShop) return;
     try{
        const newPrinter: PrintRequesst ={
            name: data.name,
            description: data.description
        };
        const response = await updatePrinter(editingShop.id, newPrinter);
        
        setShops(prev =>
            prev.map(shop => (shop.id === editingShop.id ? { ...response.result } : shop))
        );
        setEditingShop(null); // đóng modal edit
    }catch(error: any){
        alert(error.message || "Lỗi")
    }
  };

  // Xác nhận xóa
  const handleDelete = (shop: PrintShop) => {
    setDeleteConfirm(shop);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try{
        await deletePrinter(deleteConfirm.id);
        setShops((prev) => prev.filter(item => item.id !== deleteConfirm.id));
        setDeleteConfirm(null);
    }catch(error: any){
        alert(error.message || "Lỗi")
    }
  };

  // Mở modal edit
  const handleEdit = (shop: PrintShop) => {
    setEditingShop(shop); // modal sẽ tự mở vì isOpen = !!editingShop
  };

  return (
    <div className="bg-gray-50 h-[90vh]"  >
      <div className="mx-auto p-2 flex flex-col h-full">
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

          {/* Actions Bar */}
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
                {filteredShops.length} / {shops.length} nhà in
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

        {/* Shops List */}
        <div className="flex-1">
            <PrintShopList
                data={filteredShops}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>

        {/* Modals */}
        {/* Add Modal */}
        <PrintShopFormModal
          isOpen={showAddModal}
          onSubmit={handleAdd}
          onClose={() => setShowAddModal(false)}
        />

        {/* Edit Modal */}
        <PrintShopFormModal
          key={editingShop?.id ?? "new"} // bắt buộc remount khi edit shop khác
          isOpen={!!editingShop}
          initialData={editingShop || undefined}
          onSubmit={handleUpdate}
          onClose={() => setEditingShop(null)}
        />

        {/* Delete confirmation */}
        <ConfirmationModal
          isOpen={!!deleteConfirm}
          title="Xác nhận xóa nhà in"
          message={`Bạn có chắc chắn muốn xóa nhà in "${deleteConfirm?.name}"? Hành động này không thể hoàn tác.`}
          confirmText="Xóa"
          cancelText="Hủy"
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirm(null)}
          type="danger"
        />
      </div>
    </div>
  );
}

