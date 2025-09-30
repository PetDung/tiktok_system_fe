import { Package } from "lucide-react";
import ThumbPreview from "./ThumbPreview";

export default function ProductCard({ productDetails }: { productDetails: any }) {
  const image = productDetails?.main_images?.[0]?.urls?.[0];
  const hasImage = !!image;

  return (
    <div className="rounded-xl border border-gray-200 p-3 bg-white w-full shadow-sm hover:shadow-md transition-all duration-200">
      {productDetails ? (
        <div className="flex items-center gap-2">
          {/* Product Image */}
          {hasImage ? (
            <div className="w-12 h-12 flex-shrink-0">
              <ThumbPreview
                thumbUrl={image}
                alt={productDetails.title}
                size={48} // nhỏ lại
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-md border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center flex-shrink-0">
              <Package className="w-5 h-5 text-gray-300" />
            </div>
          )}

          {/* Product Title */}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-medium text-gray-900 leading-snug truncate">
              {productDetails.title || "Chưa có tên sản phẩm"}
            </h4>
          </div>
        </div>
      ) : (
        <div className="text-center py-2">
          <Package className="w-4 h-4 text-gray-300 mx-auto mb-1" />
          <p className="text-[11px] text-gray-400">Chưa có thông tin</p>
        </div>
      )}
    </div>
  );
}
