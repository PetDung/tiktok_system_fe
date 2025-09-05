"use client";

import React, { Fragment, useRef, useState, useCallback, useEffect } from "react";
import { AuditFailedReason, formatDate, getCategoryPathText, Product } from "@/service/types/ApiResponse";
import { Copy, Info } from "lucide-react";
import { debounce } from "lodash";

type Props = {
  products: Product[];
  loading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSelectionChange?: (selected: Product[]) => void; // callback khi chọn sản phẩm
};

export default function ProductRecordTable({
  products,
  loading = false,
  hasMore = false,
  onLoadMore,
  onSelectionChange,
}: Props) {
  const copiedIdRef = useRef<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReasons, setSelectedReasons] = useState<AuditFailedReason[]>([]);

  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const toggleSelectProduct = (product: Product) => {
    setSelectedProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.filter((p) => p.id !== product.id);
      else return [...prev, product];
    });
  };

  /** Toggle chọn tất cả sản phẩm */
  const toggleSelectAll = (checked: boolean) => {
    setSelectedProducts(checked ? products : []);
  };

  /** Khi selectedProducts thay đổi, báo parent */
  useEffect(() => {
    onSelectionChange?.(selectedProducts);
  }, [selectedProducts, onSelectionChange]);

  /** Check nếu sản phẩm đang được chọn */
  const isSelected = (product: Product) =>
    selectedProducts.some((p) => p.id === product.id);

  /** Scroll handler debounced */
  const handleScroll = useCallback(
    debounce(() => {
      const div = tableRef.current;
      if (!div || loading || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = div;
      if (scrollTop + clientHeight >= scrollHeight - 150) {
        onLoadMore?.();
      }
    }, 150),
    [loading, hasMore, onLoadMore]
  );

  useEffect(() => {
    const div = tableRef.current;
    if (!div) return;
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleCopy = async (productUrl: string, id: string) => {
    try {
      await navigator.clipboard.writeText(productUrl);
      copiedIdRef.current = id;
      setTimeout(() => (copiedIdRef.current = null), 2000);
    } catch (e) {
      console.error("Copy failed", e);
    }
  };

  const openReasonModal = (reasons: AuditFailedReason[] | undefined) => {
    if (!reasons || reasons.length === 0) return;
    setSelectedReasons(reasons);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  return (
    <>
      <div
        ref={tableRef}
        className="relative h-[80vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm"
      >
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 sticky top-0 z-20">
            <tr>
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </th>
              <th className="px-4 py-3 text-left font-bold text-gray-700">STT</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700">ID</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700">Shop</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700">Thời gian</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700">Product</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700">Category</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700">Status</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700">Reason</th>
              <th className="px-4 py-3 text-left font-bold text-gray-700">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product, index) => {
              const productUrl = `https://shop.tiktok.com/view/product/${product.id}`;
              return (
                <Fragment key={product.id}>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isSelected(product)}
                        onChange={() => toggleSelectProduct(product)}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-600">{index + 1}</td>
                    <td className="px-4 py-3 text-gray-600">{product.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {product.shop.userShopName}
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
                        className={`px-2 py-1 text-xs rounded-full ${product.status === "ACTIVE"
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
                      {product.auditFailedReasons && product.auditFailedReasons.length > 0 ? (
                        <button
                          onClick={() => openReasonModal(product.auditFailedReasons)}
                          className="flex items-center gap-1 text-sm text-blue-500 hover:underline"
                        >
                          <Info size={14} />
                          View
                        </button>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
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
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {loading && (
          <div className="p-4 text-center text-gray-500 text-sm">Loading more...</div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center  bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Audit Failed Reasons</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {selectedReasons.map((reason, idx) => (
                <div key={idx} className="border p-3 rounded">
                  <div>
                    <span className="font-semibold">Platform:</span> {reason.listing_platform}
                  </div>
                  <div>
                    <span className="font-semibold">Position:</span> {reason.position}
                  </div>
                  <div>
                    <span className="font-semibold">Reasons:</span>
                    <ul className="list-disc list-inside">
                      {reason.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <span className="font-semibold">Suggestions:</span>
                    <ul className="list-disc list-inside">
                      {reason.suggestions.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
