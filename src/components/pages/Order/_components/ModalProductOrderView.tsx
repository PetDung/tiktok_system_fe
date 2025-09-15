import { LineItem } from "@/service/types/ApiResponse";
import { Eye } from "lucide-react";
import { useState } from "react";

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
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                ></div>

                {/* Modal Container */}
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 z-10 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-2 mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Danh sách sản phẩm</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-800 transition"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Body */}
                    <div className="overflow-y-auto flex flex-col gap-3 max-h-[500px]">
                        {lineItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                            >
                                <div className="relative w-20 h-20 flex-shrink-0 group rounded-lg overflow-hidden shadow-sm">
                                    <img
                                        src={item.sku_image}
                                        alt={item.product_name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div
                                        className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                                        onClick={() => imageClick(item.sku_image)}
                                    >
                                        <Eye className="w-6 h-6 text-white" />
                                    </div>
                                </div>

                                <div className="flex flex-col justify-center">
                                    <span className="text-gray-800 font-medium text-sm">{item.product_name}</span>
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-800 font-medium text-sm">p_id: {item.product_id}</span>
                                        <a
                                            target="_blank"
                                            href={`/design/add?product_id=${item.product_id}&shop_id=${shopId}&sku_id=${item.sku_id}`}
                                            className="text-blue-500 font-medium text-sm hover:underline"
                                        >
                                            Thêm design
                                        </a>
                                    </div>
                                    <span className="text-gray-800 font-medium text-sm">sku_id: {item.sku_id}</span>
                                    <span className="text-gray-500 text-xs">SKU: {item.sku_name}</span>
                                    <a
                                        key={item.id}
                                        href={`https://shop.tiktok.com/view/product/${item.product_id}`}
                                        target="_blank"
                                        className="flex items-center gap-2 transition"
                                    >
                                        <span className="text-sm  text-blue-500 hover:text-gray-500 ">Link sản phẩm</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Lightbox for Image */}
            {showImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setShowImage(false)}
                >
                    <div className="relative p-4 max-w-4xl max-h-[90%]">
                        <button
                            onClick={() => setShowImage(false)}
                            className="absolute top-2 right-2 text-white text-xl hover:text-gray-200 transition z-20"
                        >
                            ✕
                        </button>
                        <img
                            src={image}
                            alt="Preview"
                            className="max-w-full max-h-[80vh] rounded-lg object-contain shadow-xl"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
