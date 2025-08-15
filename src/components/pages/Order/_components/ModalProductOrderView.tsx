import { LineItem } from "@/service/types/ApiResponse";
import { Eye } from "lucide-react";
import { useState } from "react";

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    lineItems: LineItem[];
}

export default function ModalProductOrderView({ isOpen, onClose, lineItems }: ProductModalProps) {
    if (!isOpen) return null;
    const [showImage, setShowImage] = useState(false);
    const [image, setImage] = useState("");

    const imageClick = (url: string) => {
        setImage(url);
        setShowImage(true);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", zIndex: "-1" }}
            ></div>

            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-4 z-10">
                {/* Header */}
                <div className="flex justify-between items-center border-b pb-2">
                    <h2 className="text-lg font-semibold">Danh sách sản phẩm</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800"
                    >
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="mt-4 space-y-3 overflow-y-auto  h-[500px]">
                    {lineItems.map((item) => (
                        <div
                            key={item.id}
                            className="flex items-center gap-3 border-b-1  p-2 hover:bg-gray-50"
                        >
                            <div>
                                <div className="relative group w-16 h-16 flex justify-center items-center">
                                    <img
                                        src={item.sku_image}
                                        alt={item.product_name}
                                        className="w-16 h-16 object-cover rounded"
                                    />

                                    {/* Overlay */}
                                    <div
                                        className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer rounded"
                                        onClick={() => imageClick(item.sku_image)}
                                    >
                                        <Eye className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">{item.product_name}</span>
                                <span className="text-xs text-gray-500">SKU: {item.sku_name}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Image modal */}
            {showImage && (
                <div
                    className="fixed inset-0 position  flex items-center justify-center z-50"
                    onClick={() => setShowImage(false)}
                >
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", zIndex: "-1" }}
                ></div>
                    <div className="bg-white p-4 rounded shadow-lg max-w-3xl max-h-[90%]">
                        <img
                            src={image}
                            alt="This show"
                            className="max-w-full max-h-[80vh] object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );

}