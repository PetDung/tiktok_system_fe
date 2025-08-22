import { LineItem, Order } from "@/service/types/ApiResponse";
import React, { Fragment, useRef, useState } from "react";
import ModalProductOrderView from "./ModalProductOrderView";
import { buyLabel, viewLabel } from "@/service/label/label-service";
import { useParams } from "next/navigation";
import { PanelTopOpen } from "lucide-react";

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

interface ProductFilter {
  productName: string;
  id: string;
  product_image: string;
}

export default function OrderTable({ orders, loading, hasMore, onLoadMore }: OrderTableProps) {
  const params = useParams();
  const shopId = params.id as string;

  const [selectedProducts, setSelectedProducts] = useState<LineItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (orderId: string) => {
    const newSet = new Set(expandedRows);
    if (newSet.has(orderId)) newSet.delete(orderId);
    else newSet.add(orderId);
    setExpandedRows(newSet);
  };

  const handleShowProducts = (lineItems: LineItem[]) => {
    setSelectedProducts(lineItems);
    setModalOpen(true);
  };

  const handleScroll = () => {
    if (!tableRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && hasMore) {
      onLoadMore();
    }
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleString("en-GB", {
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });

  const isBuyLabel = (order: Order) => order.shipping_type !== "SELLER" && order.status === "AWAITING_SHIPMENT";
  const isAddTrack = (order: Order) => order.shipping_type !== "TIKTOK" && order.status === "AWAITING_SHIPMENT";
  const isGetLabel = (order: Order) => order.shipping_type !== "SELLER" && order.status === "AWAITING_COLLECTION";

  const viewLabelHandler = async (order: Order) => {
    const shopIdReal = shopId || order.shop_id;
    try {
      const response = await viewLabel({ orderId: order.id, shopId: shopIdReal });
      const url = response?.result?.doc_url;
      if (url) window.open(url, "_blank");
    } catch (e) {
      console.error(e);
    }
  };

  const buyLabelHandler = async (order: Order) => {
    const shopIdReal = shopId || order.shop_id;
    try {
      const response = await buyLabel({ orderId: order.id, shopId: shopIdReal });
      const url = response?.result?.doc_url;
      if (url) window.open(url, "_blank");
    } catch (e) {
      console.error(e);
    }
  };

  function getUniqueProducts(lineItems: LineItem[]): ProductFilter[] {
    const seen = new Set<string>();
    const result: ProductFilter[] = [];
    for (const item of lineItems) {
      if (!seen.has(item.product_id)) {
        seen.add(item.product_id);
        result.push({
          productName: item.product_name,
          id: item.product_id,
          product_image: item.sku_image,
        });
      }
    }
    return result;
  }

  return (
    <>
      <div ref={tableRef} onScroll={handleScroll} className="relative h-[80vh] overflow-y-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Order ID</th>
              <th className="px-3 py-2 text-left">Products</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Total</th>
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order, idx) => (
              <Fragment key={order.id}>
                <tr className="hover:bg-gray-50 cursor-pointer transition-all duration-150" >
                  <td className="px-3 py-2 font-medium" onClick={() => toggleRow(order.id)}>
                    <div className="flex flex-col justify-center items-center">
                        <div>{idx + 1}</div>
                        <div><PanelTopOpen  size={20}/></div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-gray-700 font-semibold">{order.shop_name}</div>
                    <div className="text-gray-500 text-xs">ID: {order.id}</div>
                    <div className="text-gray-500 text-xs">
                      Tracking: {order.tracking_number || <span className="text-red-500">Chưa có</span>}
                    </div>
                    <div className="text-gray-400 text-xs">{formatDate(order.create_time)}</div>
                  </td>
                  <td className="px-3 py-2" onClick={(e) => { e.stopPropagation(); handleShowProducts(order.line_items); }}>
                    <div className="flex flex-wrap gap-2">
                      {order.line_items.map((item, i) => (
                        <img
                          key={i}
                          src={item.sku_image}
                          alt={item.product_name}
                          className="w-10 h-10 object-cover rounded-lg border shadow-sm"
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded text-white text-xs font-medium ${
                        order.status === "CANCELLED" ? "bg-red-500" : "bg-blue-500"
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.status === "CANCELLED" && <div className="text-xs text-red-400 mt-1">Reason: {order.cancel_reason}</div>}
                    <div className="text-gray-400 text-xs mt-1">Ship: {order.shipping_type}</div>
                  </td>
                  <td className="px-3 py-2 font-semibold">{order.payment.total_amount} {order.payment.currency}</td>
                  <td className="px-3 py-2 text-gray-700">
                    <div className="font-medium">{order.recipient_address.name}</div>
                    <div className="text-xs">{order.recipient_address.phone_number}</div>
                    <div className="text-xs">{order.recipient_address.address_detail}</div>
                  </td>
                  <td className="px-3 py-2 space-y-1">
                    {isBuyLabel(order) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); buyLabelHandler(order); }}
                        className="bg-purple-600 hover:bg-purple-500 transition-all text-white px-3 py-1 rounded text-xs font-medium w-full"
                      >
                        Create Label
                      </button>
                    )}
                    {isAddTrack(order) && (
                      <button className="bg-indigo-600 hover:bg-indigo-500 transition-all text-white px-3 py-1 rounded text-xs font-medium w-full">
                        Tracking
                      </button>
                    )}
                    {isGetLabel(order) && (
                      <button
                        onClick={(e) => { e.stopPropagation(); viewLabelHandler(order); }}
                        className="bg-green-600 hover:bg-green-500 transition-all text-white px-3 py-1 rounded text-xs font-medium w-full"
                      >
                        Get Label
                      </button>
                    )}
                  </td>
                </tr>

                {/* Expandable row */}
                {expandedRows.has(order.id) && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-4 py-3">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {getUniqueProducts(order.line_items).map(item => (
                          <a
                            key={item.id}
                            href={`https://shop.tiktok.com/view/product/${item.id}`}
                            target="_blank"
                            className="flex items-center gap-2 bg-white p-2 rounded shadow hover:shadow-md transition"
                          >
                            <img src={item.product_image} alt={item.productName} className="w-10 h-10 rounded object-cover" />
                            <span className="text-gray-700 text-sm">{item.productName}</span>
                          </a>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {loading && (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ModalProductOrderView
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lineItems={selectedProducts}
      />
    </>
  );
}
