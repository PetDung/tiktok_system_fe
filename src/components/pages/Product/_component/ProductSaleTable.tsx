"use client";

import React, { Fragment, useRef, useCallback, useState, useEffect } from "react";
import { ProductReport } from "@/service/types/ApiResponse";
import { Copy } from "lucide-react";
import LoadingIndicator from "@/components/UI/LoadingIndicator";

type Props = {
  products: ProductReport[];
  onSelectionChange?: (selected: ProductReport[]) => void; 
  loading: boolean;
};

export default function ProductSaleTable({ products, onSelectionChange, loading }: Props) {
  const copiedIdRef = useRef<string | null>(null);

  const [selectedProducts, setSelectedProducts] = useState<ProductReport[]>([]);

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
    <div className="relative h-full min-h-0 overflow-auto shadow-md rounded-lg bg-white"
      style={{ scrollBehavior: 'smooth' }}
    >
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
                  className={`hover:bg-gray-50 transition-colors ${
                    isSelected(product) ? "bg-blue-50" : ""
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
                    {product.shopName || "-"}
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
                    </div>
                  </td>
                </tr>
              </Fragment>
            );
          })}
        </tbody>
      </table>
        {loading && (
        <LoadingIndicator/>
      )}
    </div>
  );
}
