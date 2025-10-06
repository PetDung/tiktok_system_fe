"use client";

import React, { Fragment, useRef, useState } from "react";
import { formatDate, getCategoryPathText, Product, ShopResponse } from "@/service/types/ApiResponse";
import { Copy, RotateCcw } from "lucide-react";
import ModalShopAdd from "./ModalShopAdd";
import RoleGuard from "@/components/UI/RoleGuard";
import ThumbPreview from "../../Design/_components/ThumbPreview";

type Props = {
  products: Product[];
};

export default function ProductActiveTable({products}: Props) {
  const copiedIdRef = useRef<string | null>(null);
  const [productSelect, setProductSelect] = useState<Product | null>(null)
  const [openModal, setOpen] = useState<boolean>(false);

  const handleCopy = async (productUrl: string, id: string) => {
    try {
      await navigator.clipboard.writeText(productUrl);
      copiedIdRef.current = id;
      setTimeout(() => (copiedIdRef.current = null), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };
  return (
    <div className="h-full min-h-0 bg-white">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-300 sticky top-0 z-20">
          <tr>
            <th className="px-4 py-3 text-left font-bold text-gray-700">STT</th>
            <th className="px-4 py-3 text-left font-bold text-gray-700">ID</th>
            <th className="px-2 py-2 text-left font-bold text-gray-700">Images</th>
            <th className="px-4 py-3 text-left font-bold text-gray-700">Shop</th>
            <th className="px-4 py-3 text-left font-bold text-gray-700">Thời gian</th>
            <th className="px-4 py-3 text-left font-bold text-gray-700">Product</th>
            <th className="px-4 py-3 text-left font-bold text-gray-700">Category</th>
            <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
            <th className="px-4 py-3 text-left font-bold text-gray-700">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product, index) => {
            const productUrl = `https://shop.tiktok.com/view/product/${product.id}`;
            return (
              <Fragment key={product.id}>
                <tr
                  className={`hover:bg-gray-50 transition-colors`}
                >
                  <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                  <td className="px-4 py-3 text-gray-600">{product.id}</td>
                  <td className="px-2 py-2">
                    <div className="grid grid-cols-3 gap-1">
                      {product?.mainImages?.map((item) => (
                        <ThumbPreview
                          key={item.uri}
                          thumbUrl={item.thumb_urls[0]}
                          fullImageUrl={item.urls[0]}
                          size={40}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {product.shop.userShopName || "-"}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    <div className="flex flex-col space-y-1">
                      <span>
                        <span className="font-semibold text-gray-700 text-xs">
                          Create time (VN):
                        </span>{" "}
                        {formatDate(product.createTime)}
                      </span>
                      <span>
                        <span className="font-semibold text-gray-700 text-xs">
                          Active time (VN):
                        </span>{" "}
                          {formatDate(product.activeTime)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <p className="line-clamp-2">{product.title}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs">
                    <p className="line-clamp-2">{getCategoryPathText(product.categoryChains || [])}</p>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        product.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : product.status === "REJECTED"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {product.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                   <div className="flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                      <a
                        href={productUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Mở
                      </a>
                      <button
                        onClick={() => handleCopy(productUrl, product.id)}
                        className="text-gray-400 hover:text-gray-600 transition"
                        title="Copy link"
                      >
                        <Copy size={16} />
                      </button>
                      {copiedIdRef.current === product.id && (
                        <span className="text-xs text-green-600">Copied!</span>
                      )}
                    </div>
                      <RoleGuard role={"Admin"}>
                        <div
                          onClick={() => {
                            setProductSelect(product)
                            setOpen(true)
                          }}
                        >
                          <RotateCcw size={20} className=" hover:text-amber-300 " />
                        </div>
                      </RoleGuard>
                   </div>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {openModal && productSelect && (
        <RoleGuard role={"Admin"}>
            <ModalShopAdd 
              onClose={() => setOpen(false)}
              product={productSelect}
            />
        </RoleGuard>
      )}
    </div>
  );
}
