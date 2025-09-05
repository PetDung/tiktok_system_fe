import { useState } from "react";
import { Eye } from "lucide-react";

export default function ProductCard({ productDetails }: { productDetails: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Card */}
      <div className="rounded-lg shadow-sm p-2 bg-white w-full max-w-md mx-auto flex items-start gap-2">
        {productDetails?.main_images?.[0]?.urls?.[0] && (
          <div className="relative w-16 h-16 cursor-pointer" onClick={() => setIsOpen(true)}>
            <img
              src={productDetails.main_images[0].urls[0]}
              alt={productDetails.title || "Product Image"}
              className="w-full h-full object-cover rounded"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 rounded transition-opacity">
              <Eye className="text-white w-5 h-5" />
            </div>
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">Thông tin sản phẩm</h3>
          {productDetails ? (
            <h4 className="text-md text-gray-700">{productDetails.title}</h4>
          ) : (
            <p className="text-gray-400">Chưa có thông tin sản phẩm</p>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {isOpen && productDetails?.main_images?.[0]?.urls?.[0] && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setIsOpen(false)}
        >
          <img
            src={productDetails.main_images[0].urls[0]}
            alt={productDetails.title || "Product Image"}
            className="max-w-full max-h-full rounded"
          />
        </div>
      )}
    </>
  );
}
