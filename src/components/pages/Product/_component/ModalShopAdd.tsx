import { useState, useMemo } from 'react';
import { Search, X, Store, Plus, Check, Filter } from 'lucide-react';
import { Product, ShopResponse } from '@/service/types/ApiResponse';
import { uploadProduct, UploadProductParam } from '@/service/product/product-service';
import { useShops } from '@/lib/customHooks/useShops';
import LoadingIndicator from '@/components/UI/LoadingIndicator';

interface ModalProps {
    onClose: () => void;
    product: Product;
}

export default function ModalShopAdd({ onClose, product }: ModalProps) {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedShops, setSelectedShops] = useState<string[]>([]);
    const [selectedOwner, setSelectedOwner] = useState<string>("");

    const { data: shopsResponse, isLoading: loadingShop } = useShops();
    const shops = (shopsResponse?.result ?? []).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    const filteredShops: ShopResponse[] = useMemo(() =>{
        let filtered = shops;
        
        // Filter by search term
        if (searchTerm.trim() !== "") {
            filtered = filtered.filter(shop => 
                shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.userShopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                shop.tiktokShopName?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Filter by owner
        if (selectedOwner.trim() !== "") {
            filtered = filtered.filter(shop => shop.ownerName === selectedOwner);
        }

        return filtered
    }, [searchTerm, shops, selectedOwner])
    
    // Get unique owners for filter dropdown
    const uniqueOwners = Array.from(new Set(shops.map(shop => shop.ownerName))).sort();

    const handleShopSelect = (shopId: string) => {
        setSelectedShops(prev => 
            prev.includes(shopId) 
                ? prev.filter(id => id !== shopId)
                : [...prev, shopId]
        );
    };

    const handleSubmit = async () => {
        if (selectedShops.length === 0) return;
        setLoading(true);
        try {
            const param: UploadProductParam = {
                productId: product?.id || "",
                shopId: product?.shop.id || "",
                shopUploadId: selectedShops
            }
            const response = await uploadProduct(param);
            console.log(response);
            onClose();
        } catch (error) {
            console.error("Error adding product to shops:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 via-black/50 to-black/40 backdrop-blur-md p-4">
            <div className="flex flex-col bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Store className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Thêm sản phẩm vào shop</h2>
                            <p className="text-sm text-gray-500">Chọn các shop để thêm sản phẩm</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Search & Filter */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm shop..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        
                        {/* Owner Filter */}
                        <div className="relative min-w-[200px]">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                value={selectedOwner}
                                onChange={(e) => setSelectedOwner(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all appearance-none bg-white"
                            >
                                <option value="">Tất cả chủ shop</option>
                                {uniqueOwners.map(owner => (
                                    <option key={owner} value={owner}>{owner}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Shop List */}
               {loadingShop? <LoadingIndicator/> :  (<div className="flex-1 overflow-y-auto h-full">
                    {filteredShops.length === 0 ? (
                        <div className="p-8 text-center">
                            <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500">
                                {searchTerm || selectedOwner ? "Không tìm thấy shop nào" : "Chưa có shop nào"}
                            </p>
                        </div>
                    ) : (
                        <div className="p-4 space-y-2">
                            {filteredShops.map((shop) => {
                                const isSelected = selectedShops.includes(shop.id);
                                return (
                                    <div
                                        key={shop.id}
                                        onClick={() => handleShopSelect(shop.id)}
                                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200  ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                                : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3 flex-1">
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                                    isSelected ? 'bg-blue-100' : 'bg-gray-100'
                                                }`}>
                                                    <Store className={`w-6 h-6 ${
                                                        isSelected ? 'text-blue-600' : 'text-gray-500'
                                                    }`} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-medium text-gray-900 truncate">
                                                        {shop.name || shop.userShopName}
                                                    </h3>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        @{shop.userShopName}
                                                    </p>
                                                    <p className="text-sm text-green-600 truncate">
                                                        Chủ shop: {shop.ownerName}
                                                    </p>
                                                    {shop.tiktokShopName && (
                                                        <p className="text-xs text-blue-600 truncate">
                                                            TikTok: {shop.tiktokShopName}
                                                        </p>
                                                    )}
                                                    <p className="text-sm text-green-600 truncate">
                                                        {shop.productUpload && shop.productUpload.includes(product.id)? "Đã upload" : "Chưa upload"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                                isSelected
                                                    ? 'border-blue-500 bg-blue-500'
                                                    : 'border-gray-300'
                                            }`}>
                                                {isSelected && (
                                                    <Check className="w-4 h-4 text-white" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>)}

                {/* Footer */}
                <div className="p-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Đã chọn: <span className="font-medium text-blue-600">{selectedShops.length}</span> shop
                        </p>
                        <div className="flex space-x-3">
                            <button
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={selectedShops.length === 0 || loading  || loadingShop }
                                className={`px-6 py-2.5 rounded-xl font-medium transition-all flex items-center space-x-2 ${
                                    selectedShops.length === 0 || loading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                                }`}
                            >
                                {loading  || loadingShop ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>Đang thêm...</span>
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        <span>Thêm vào shop</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}