"use client";

import React, { Fragment, useRef, useCallback, useState, useEffect } from "react";
import { Product, ProductReport } from "@/service/types/ApiResponse";
import { Copy, RotateCcw } from "lucide-react";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import RoleGuard from "@/components/UI/RoleGuard";
import ModalShopAdd from "./ModalShopAdd";
import ThumbPreview from "../../Design/_components/ThumbPreview";

type Props = {
  products: ProductReport[];
  onSelectionChange?: (selected: ProductReport[]) => void;
};

export default function ProductSaleTable({ products, onSelectionChange }: Props) {
  const copiedIdRef = useRef<string | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<ProductReport[]>([]);

  const [productSelect, setProductSelect] = useState<Product | null>(null)
  const [openModal, setOpen] = useState<boolean>(false)

  const handleCopy = async (productUrl: string, id: string) => {
    try {
      await navigator.clipboard.writeText(productUrl);
      copiedIdRef.current = id;
      setTimeout(() => (copiedIdRef.current = null), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  /** Toggle chọn 1 sản phẩm */
  const toggleSelectProduct = (product: ProductReport) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.productId === product.productId);
      if (exists) return prev.filter((p) => p.productId !== product.productId);
      else return [...prev, product];
    });
  };

  /** Toggle chọn tất cả sản phẩm */
  const toggleSelectAll = (checked: boolean) => {
    setSelectedProducts(checked ? [...products] : []);
  };

  /** Check nếu sản phẩm đang được chọn */
  const isSelected = (product: ProductReport) =>
    selectedProducts.some((p) => p.productId === product.productId);

  /** Check nếu tất cả sản phẩm đang được chọn */
  const isAllSelected = products.length > 0 && selectedProducts.length === products.length;

  useEffect(() => {
    onSelectionChange?.(selectedProducts);
  }, [selectedProducts, onSelectionChange]);

  return (
    <div className="h-full min-h-0 bg-white">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-300 sticky top-0 z-20">
          <tr>
            <th className="px-2 py-2">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              />
            </th>
            <th className="px-2 py-2 text-left font-bold text-gray-700">STT</th>
            <th className="px-2 py-2 text-left font-bold text-gray-700">ID</th>
            <th className="px-2 py-2 text-left font-bold text-gray-700">Shop</th>
            <th className="px-2 py-2 text-left font-bold text-gray-700">Images</th>
            <th className="px-2 py-2 text-left font-bold text-gray-700">Product</th>
            <th className="px-2 py-2 text-left font-bold text-gray-700">Sold</th>
            <th className="px-2 py-2 text-left font-bold text-gray-700">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map((product, index) => {
            const productUrl = `https://shop.tiktok.com/view/product/${product.productId}`;
            return (
              <Fragment key={product.productId}>
                <tr
                  className={`hover:bg-gray-50 transition-colors ${isSelected(product) ? "bg-blue-50" : ""
                    }`}
                >
                  <td className="px-2 py-2">
                    <input
                      type="checkbox"
                      checked={isSelected(product)}
                      onChange={() => toggleSelectProduct(product)}
                    />
                  </td>
                  <td className="px-2 py-2 text-gray-600">{index + 1}</td>
                  <td className="px-2 py-2 text-gray-600">{product.productId}</td>
                  <td className="px-2 py-2 font-medium text-gray-800">
                    {product.shop.shopName || "-"}
                  </td>
                  <td className="px-2 py-2">
                    <ThumbPreview
                      thumbUrl={product.skuImage}
                      fullImageUrl={product.skuImage}
                      size={60}
                    />

                  </td>
                  <td className="px-2 py-2 text-gray-600 max-w-xs">
                    <p className="line-clamp-2">{product.productName}</p>
                  </td>
                  <td className="px-2 py-2 text-gray-600 max-w-xs font-bold">
                    <p className="line-clamp-2">{product.soldCount}</p>
                  </td>
                  <td className="px-2 py-2">
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
                        onClick={() => handleCopy(productUrl, product.productId)}
                        className="text-gray-400 hover:text-gray-600 transition"
                        title="Copy link"
                      >
                        <Copy size={16} />
                      </button>
                      {copiedIdRef.current === product.productId && (
                        <span className="text-xs text-green-600">Copied!</span>
                      )}
                      <RoleGuard role={"Admin"}>
                        <div
                          onClick={() => {

                            const productItem: Product = {
                              id: product.productId,
                              activeTime: 1000,
                              categoryChains: null,
                              mainImages: [],
                              shop: {
                                id: product.shop.shopId,
                                name: product.shop.shopName,
                                createdAt: new Date(),
                                tiktokShopName: product.shop.shopName,
                                userShopName: product.shop.shopName,
                                ownerName: product.shop.shopName,
                                productUpload: []
                              },
                              createTime: 100,
                              status: "Active",
                              title: product.productName,
                              updateTime: 1000
                            }

                            setProductSelect(productItem)
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
