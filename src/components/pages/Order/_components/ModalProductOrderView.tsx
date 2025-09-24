import { LineItem } from "@/service/types/ApiResponse";
import { Eye, X, ExternalLink, Package, Hash, Tag } from "lucide-react";
import { useState } from "react";
import ThumbPreview from "../../Design/_components/ThumbPreview";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    lineItems: LineItem[];
    shopId?: string;
}

export default function ModalProductOrderView({ isOpen, onClose, lineItems, shopId }: ProductModalProps) {
    const [showImage, setShowImage] = useState(false);
    const [image, setImage] = useState("");

    if (!isOpen) return null;

    const imageClick = (url: string) => {
        setImage(url);
        setShowImage(true);
    };

    return (
        <>
            {/* Modal Overlay */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/40 backdrop-blur-md"
                    onClick={onClose}
                ></div>

                {/* Modal Container */}
                <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] z-10 flex flex-col overflow-hidden border border-gray-100">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <Package className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Danh sách sản phẩm</h2>
                            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                {lineItems.length} sản phẩm
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200 text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto flex-1 p-6">
                        <div className="grid gap-6">
                            {lineItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-200 hover:shadow-lg transition-all duration-300"
                                >
                                    <div className="flex gap-6">
                                        {/* Product Image */}
                                        <div className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden shadow-md group/image">
                                            <img
                                                src={item.sku_image}
                                                alt={item.product_name}
                                                className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-110"
                                            />
                                            <div
                                                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 cursor-pointer"
                                                onClick={() => imageClick(item.sku_image)}
                                            >
                                                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                                    <Eye className="w-4 h-4 text-gray-700" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
                                                        {item.product_name}
                                                    </h3>
                                                    
                                                    {/* Product IDs */}
                                                    <div className="flex flex-wrap gap-3 mb-3">
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                                                            <Hash className="w-3 h-3 text-gray-500" />
                                                            <span className="text-xs text-gray-600 font-mono">
                                                                P-ID: {item.product_id}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg">
                                                            <Tag className="w-3 h-3 text-gray-500" />
                                                            <span className="text-xs text-gray-600 font-mono">
                                                                SKU-ID: {item.sku_id}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="text-sm text-gray-500 mb-3">
                                                        SKU: <span className="font-medium text-gray-700">{item.sku_name}</span>
                                                    </div>
                                                </div>

                                                {/* Design Thumbnail */}
                                                {item.design && (
                                                    <div className="flex-shrink-0">
                                                        <div className="p-2 bg-gray-50 rounded-lg">
                                                            <ThumbPreview
                                                                thumbUrl={item.design.thumbnail || ""}
                                                                size={80}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center gap-3">
                                                <a
                                                    target="_blank"
                                                    href={`/design/add?product_id=${item.product_id}&shop_id=${shopId}&sku_id=${item.sku_id}`}
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                                                >
                                                    <Package className="w-4 h-4" />
                                                    Thêm design
                                                </a>
                                                
                                                <a
                                                    href={`https://shop.tiktok.com/view/product/${item.product_id}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Xem sản phẩm
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Enhanced Lightbox for Image */}
            {showImage && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    onClick={() => setShowImage(false)}
                >
                    <div className="relative p-6 max-w-6xl max-h-[95vh] w-full mx-4">
                        <button
                            onClick={() => setShowImage(false)}
                            className="absolute -top-2 -right-2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center text-gray-700 hover:text-gray-900 hover:shadow-2xl transition-all duration-200 z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="bg-white rounded-2xl p-4 shadow-2xl">
                            <img
                                src={image}
                                alt="Preview"
                                className="max-w-full max-h-[80vh] rounded-xl object-contain mx-auto shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}