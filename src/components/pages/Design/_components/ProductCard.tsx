import { useState } from "react";
import { Eye, X, Package } from "lucide-react";
import ThumbPreview from "./ThumbPreview";

export default function ProductCard({ productDetails }: { productDetails: any }) {
  const image = productDetails?.main_images?.[0]?.urls?.[0];
  const hasImage = !!image;

  return (
    <>
      {/* Card */}
      <div className="rounded-2xl border-2 border-gray-200 p-6 bg-white w-full shadow-sm hover:shadow-md transition-all duration-200">
        {productDetails ? (
          <div className="flex items-start gap-4">
            {/* Product Image */}
            {hasImage ? (
               <div className="aspect-square">
                  <ThumbPreview
                    thumbUrl={image}
                    alt={productDetails.title}
                    size={60}
                  />
                </div>
            ) : (
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center flex-shrink-0">
                <Package className="w-8 h-8 text-gray-300" />
              </div>
            )}

            {/* Product Title */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-gray-900 leading-tight">
                {productDetails.title || "Chưa có tên sản phẩm"}
              </h4>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Package className="w-6 h-6 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">Chưa có thông tin sản phẩm</p>
          </div>
        )}
      </div>
    </>
  );
}