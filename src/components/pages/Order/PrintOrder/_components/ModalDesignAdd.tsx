import ThumbPreview from "@/components/pages/Design/_components/ThumbPreview";
import { getAllDesigns, mappingDesign, ParamMapping } from "@/service/design/design-service";
import { Design, LineItem } from "@/service/types/ApiResponse";
import { X, Image, Package, Search, Grid, List, Eye } from "lucide-react";
import { useEffect, useState } from "react";

type ModalProps = {
    onClose: () => void;
    item: LineItem | null;
};

export default function ModalDesignAdd({ onClose, item }: ModalProps) {
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDesign, setSelectedDesign] = useState<Design | null>(item?.design || null);
    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                await fetchDesign();
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const fetchDesign = async () => {
        const responseDesignFetch = await getAllDesigns();
        setDesigns(responseDesignFetch.result);
    };

    const filteredDesigns = designs.filter(design =>
        design.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDesignSelect = (design: Design) => {
        setSelectedDesign(design);
        // Thêm logic để apply design vào item ở đây
    };

    const handleSubmit = async () => {
        if (!item?.product_id?.trim()) {
            alert("Vui lòng nhập Product ID");
            return;
        }
        if (!item?.sku_id) {
            alert("Vui lòng chọn ít nhất 1 SKU");
            return;
        }
        if (!selectedDesign) {
            alert("Vui lòng chọn Design");
            return;
        }

        const payload: ParamMapping = {
            productId: item?.product_id,
            skuIds: [item?.sku_id],
            designId: selectedDesign.id,
        };

        setLoading(true);
        try {
            const response = await mappingDesign(payload);
            console.log(response);;
            setSelectedDesign(null);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Có lỗi xảy ra: " + error);
        } finally {
            setLoading(false);
        }
    };

    const getDesignImages = (design: Design) => {
        const images = [];
        if (design.frontSide) images.push({ type: 'Front', url: design.frontSide });
        if (design.backSide) images.push({ type: 'Back', url: design.backSide });
        if (design.leftSide) images.push({ type: 'Left', url: design.leftSide });
        if (design.rightSide) images.push({ type: 'Right', url: design.rightSide });
        return images;
    };
    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 via-black/50 to-black/40 backdrop-blur-md p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 px-6 py-4 z-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <Package className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Chọn Design</h2>
                                    {item && (
                                        <p className="text-sm text-gray-600">cho sản phẩm: {item.product_name}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Search and View Controls */}
                        <div className="flex items-center gap-4 mt-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm design..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-auto p-6">
                        {loading ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-gray-500">Đang tải designs...</p>
                                </div>
                            </div>
                        ) : filteredDesigns.length === 0 ? (
                            <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                    <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy design</h3>
                                    <p className="text-gray-500">
                                        {searchTerm ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có design nào được tạo'}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            /* List View */
                            <div className="space-y-4">
                                {filteredDesigns.map((design) => (
                                    <div
                                        key={design.id}
                                        className={`group bg-white rounded-xl border-2 p-6 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                                            selectedDesign?.id === design.id 
                                                ? 'border-purple-500 shadow-lg' 
                                                : 'border-gray-200 hover:border-purple-300'
                                        }`}
                                        onClick={() => handleDesignSelect(design)}
                                    >
                                        <div className="flex gap-6">
                                            {/* Thumbnail */}
                                             <ThumbPreview
                                                thumbUrl={design.thumbnail || ""}
                                                size={100}
                                            />

                                            {/* Design Info */}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{design.name}</h3>
                                                <p className="text-sm text-gray-500 mb-3">ID: {design.id}</p>
                                                
                                                {/* Design Images */}
                                                <div className="flex flex-wrap gap-2">
                                                    {getDesignImages(design).map((img, idx) => (
                                                        <button
                                                            key={idx}
                                                            className="px-3 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600 hover:bg-purple-100 hover:text-purple-700 transition-colors flex items-center gap-1"
                                                        >
                                                            <Eye className="w-3 h-3" />
                                                            {img.type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {selectedDesign && (
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Đã chọn:</p>
                                    <p className="font-semibold text-gray-900">{selectedDesign.name}</p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                                    >
                                        Áp dụng Design
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}