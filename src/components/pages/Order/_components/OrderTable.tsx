import { LineItem, Order, PrintShop } from "@/service/types/ApiResponse";
import React, { Fragment, useEffect, useRef, useState, useCallback } from "react";
import ModalProductOrderView from "./ModalProductOrderView";
import { buyLabel, viewLabel } from "@/service/label/label-service";
import { useParams } from "next/navigation";
import OptionalSelect, { Option } from "@/components/UI/OptionalSelect";
import EditableField from "@/components/UI/EditableField";
import { updateCostOrder } from "@/service/order/order-service";

interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  hasMore: boolean;
  printer?: PrintShop[]
  onLoadMore: () => void;
  isSelectable?: boolean;
  selectList?: Set<string>;
  onSelectChange?: (selected: Set<string>) => void;
  updatePOrder?: (orderId: string, printerId: string | null) => void
  type?: string;
}

export default function OrderTable(
  { orders, 
    loading,
    hasMore, 
    onLoadMore, 
    isSelectable = false, 
    selectList = new Set(), 
    onSelectChange = () => null,
    updatePOrder, 
    printer = [],
    type = "ONE"
  }: OrderTableProps) {
  
  const params = useParams();
  let shopId = params.id as string;

  const [selectedProducts, setSelectedProducts] = useState<LineItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [shopSelect, setShopSelect] = useState<string>(shopId || "");
  const [printerOption, setPrinterOption] = useState<Option[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);
  const loadingTriggerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  const handleShowProducts = (lineItems: LineItem[], shopIdSelected: string) => {
    setSelectedProducts(lineItems);
    setShopSelect(shopIdSelected);
    setModalOpen(true);
  };

  useEffect(() => {
    if (type === "ONE") return;
    const options: Option[] = printer.map(item => ({
      value: item.id,
      label: item.name
    }))
    setPrinterOption(options)
  }, [printer])

  // Intersection Observer để phát hiện khi scroll đến cuối
  const setupIntersectionObserver = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading && !isLoadingMore) {
          setIsLoadingMore(true);
          onLoadMore();
        }
      },
      {
        root: tableRef.current,
        rootMargin: '50px', // Trigger 50px before reaching the bottom
        threshold: 0.1
      }
    );

    if (loadingTriggerRef.current) {
      observerRef.current.observe(loadingTriggerRef.current);
    }
  }, [hasMore, loading, isLoadingMore, onLoadMore]);

  // Setup observer khi component mount
  useEffect(() => {
    setupIntersectionObserver();
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [setupIntersectionObserver]);

  // Reset loading state khi orders update
  useEffect(() => {
    if (!loading) {
      setIsLoadingMore(false);
    }
  }, [loading]);

  // Fallback scroll handler (backup method)
  const handleScroll = useCallback(() => {
    if (!tableRef.current || isLoadingMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Trigger when 90% scrolled and conditions are met
    if (scrollPercentage >= 0.9 && !loading && hasMore) {
      setIsLoadingMore(true);
      onLoadMore();
    }
  }, [loading, hasMore, isLoadingMore, onLoadMore]);

  const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
    });

  const isBuyLabel = (order: Order) => order.shipping_type !== "SELLER" && order.status === "AWAITING_SHIPMENT";
  const isAddTrack = (order: Order) => order.shipping_type !== "TIKTOK" && order.status === "AWAITING_SHIPMENT";
  const isGetLabel = (order: Order) => order.shipping_type !== "SELLER" && order.status === "AWAITING_COLLECTION";

  const viewLabelHandler = async (order: Order) => {
    const shopIdReal = shopId || order.shop_id;
    let url;
    try {
      const response = await viewLabel({ orderId: order.id, shopId: shopIdReal });
      url = response?.result?.doc_url;
    } catch (e) {
      console.error(e);
    }
    if (order.label) { url = order.label; }
    if (url) window.open(url, "_blank");
  };

  const handlerUpdaterPrintOrder = (orderId: string, value: string | null) => {
    updatePOrder?.(orderId, value)
  }

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

  const hasId = (id: string) => selectList.has(id);

  const onSelect = (value: string, checked: boolean) => {
    const newSelected = new Set(selectList);
    if (checked) newSelected.add(value);
    else newSelected.delete(value);
    onSelectChange(newSelected);
  };

  const selectAll = (checked: boolean) => {
    if (checked) {
      onSelectChange(new Set(orders.map(o => o.id)));
    } else {
      onSelectChange(new Set());
    }
  };

  const saveCost = async (value: any, orderId: string) => {
    const num = Number(value);
    if (isNaN(num)) {
      alert("Giá trị không phải là số: " + value);
      return;
    }

    try {
      await updateCostOrder(orderId, value);
    } catch (e) {
      console.error(e);
    }
  };

  const isAllSelected = orders.length > 0 && selectList.size === orders.length;

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="flex items-center justify-center py-6 space-x-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      <span className="text-gray-600 font-medium">Đang tải thêm đơn hàng...</span>
    </div>
  );

  // No more data indicator
  const NoMoreDataIndicator = () => (
    <div className="flex items-center justify-center py-4">
      <div className="flex items-center space-x-2 text-gray-500">
        <div className="w-12 h-px bg-gray-300"></div>
        <span className="text-sm font-medium">Đã hiển thị tất cả đơn hàng</span>
        <div className="w-12 h-px bg-gray-300"></div>
      </div>
    </div>
  );

  return (
    <>
      <div 
        ref={tableRef} 
        onScroll={handleScroll} 
        className="relative h-full overflow-y-auto shadow-md rounded-lg bg-white"
        style={{ scrollBehavior: 'smooth' }}
      >
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-300 sticky top-0 z-20 shadow-sm text-xs">
            <tr>
              <th className="px-1 py-1 text-left">
                <div className="flex" style={{ alignItems: "center"}}>
                  {isSelectable && (
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => selectAll(e.currentTarget.checked)}
                      className="mt-2 h-5 w-5 cursor-pointer accent-blue-600 rounded transition duration-200"
                    />
                  )}
                </div>
              </th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">Order ID</th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">Products</th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">Status</th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">Tiền</th>
              {type === "ALL" && <th className="px-1 py-1 text-left font-semibold text-gray-700">In</th>}
              <th className="px-1 py-1 text-left font-semibold text-gray-700">Customer</th>
              <th className="px-1 py-1 text-left font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order, idx) => (
              <Fragment key={order.id}>
                <tr className="hover:bg-blue-50 cursor-pointer transition-all duration-200 relative group">
                  <td className="px-1 py-1 font-medium">
                    <div className="flex flex-col justify-center items-center space-y-1">
                      <div className="text-gray-700 font-semibold">{idx + 1}</div>
                      {isSelectable && 
                        <input 
                          type="checkbox"  
                          name="orderId" 
                          value={order.id}  
                          className="h-5 w-5 cursor-pointer accent-blue-600 rounded transition duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          checked={hasId(order.id)}
                          onChange={(e) => onSelect(e.currentTarget.value, e.currentTarget.checked)}
                        />
                      }
                    </div>
                  </td>
                  <td className="px-1 py-1 text-xs">
                    {type === "ALL" && <div className="text-gray-800 font-bold mb-1">{order.shop_name}</div>}
                    <div className="text-gray-600 font-medium">ID: {order.id}</div>
                    <div className="text-gray-500">
                      Tracking: {order.tracking_number || <span className="text-red-500 font-medium">Chưa có</span>}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">{formatDate(order.create_time)}</div>
                  </td>
                  <td 
                    className="px-1 py-1 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer" 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      let temp: string = shopId || order.shop_id || "";
                      handleShowProducts(order.line_items, temp);
                    }}
                  >
                    <div className="flex flex-wrap gap-2 w-56">
                      {order.line_items.map((item, i) => (
                        <div key={i} className="relative group">
                          <img
                            src={item.sku_image}
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded-lg border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                          />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-1 py-1">
                    <span
                      className={`px-2 py-1 rounded-full text-white shadow-sm text-[10px] ${
                        order.status === "CANCELLED" ? "bg-red-500" : 
                        order.status === "COMPLETED" ? "bg-green-500" :
                        order.status === "DELIVERED" ? "bg-blue-500" :
                        "bg-orange-500"
                      }`}
                    >
                      {order.status}
                    </span>
                    {order.status === "CANCELLED" && (
                      <div className="text-xs text-red-500 mt-1 font-medium">
                        Reason: {order.cancel_reason}
                      </div>
                    )}
                    {order.returns && order.returns?.length > 0 && (
                      <div className="mt-2 rounded-lg text-xs text-red-600">
                        <a href={`/refund?order_id=${order.id}`} className="underline hover:text-red-800 transition-colors" target="_blank">
                          <div className="flex items-center">
                            <span className="font-semibold">Status:</span>
                            <span>{order.returns?.[0]?.returnType}</span>
                          </div>
                        </a>
                      </div>
                    )}
                    <div className="text-gray-500 text-xs mt-1 font-medium">
                      Ship: <span className="font-bold">{order.shipping_type}</span>
                    </div>
                  </td>
                  <td className="px-1 py-1">
                    <div>
                      <p className="text-gray-800 font-bold text-xs">
                        <span className="text-gray-600">Total:</span>{" "}
                        {order.payment.total_amount} {order.payment.currency}
                      </p>
                      <p className="text-gray-600 text-xs">
                        <span className="font-medium">Dự kiến:</span>{" "}
                        {order.payment_amount} {order.payment.currency}
                      </p>
                      <p className="text-gray-600 text-xs">
                        <span className="font-medium">Thực tế:</span>{" "}
                        {order?.settlement?.settlement_amount || 0} {order.payment.currency}
                      </p>
                      <div className="text-gray-600 text-xs">
                        <EditableField
                          value={`${order?.cost?.toString() || 0}`}
                          onSave={(value) => saveCost(value, order.id)}
                          label="Chỉnh cost"
                          type="number"
                          fistText="Cost:"
                        />
                      </div>
                    </div>
                  </td>

                  {type === "ALL" && (
                    <td className="px-1 py-1">
                      <OptionalSelect
                        value={order?.printer?.id ?? null}
                        options={printerOption}
                        placeholder="Nhà in"
                        size={150}
                        onChange={(value) => handlerUpdaterPrintOrder(order.id, value)}
                      />
                    </td>
                  )}
                  
                  <td className="px-1 py-1 text-gray-700">
                    <div>
                      <div className="font-semibold text-gray-800">{order.recipient_address.name}</div>
                      <div className="text-xs text-gray-600">{order.recipient_address.phone_number}</div>
                      <div className="text-xs text-gray-500">{order.recipient_address.address_detail}</div>
                      <div className="text-xs text-gray-500">
                        {order.recipient_address.district_info.map(d => d.address_name).join(", ")}
                      </div>
                      <div className="text-xs text-gray-500">{order.recipient_address.postal_code}</div>
                    </div>
                  </td>
                  
                  <td className="px-1 py-1">
                    <div className="space-y-2 items-center">
                      {isBuyLabel(order) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); buyLabelHandler(order); }}
                          className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 transition-all text-white px-1 py-1 text-[10px] rounded-lg font-medium w-full shadow-sm hover:shadow-md"
                        >
                          Create Label
                        </button>
                      )}
                      {isAddTrack(order) && (
                        <button className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 transition-all text-white px-1 py-1 text-[10px] rounded-lg font-medium w-full shadow-sm hover:shadow-md">
                          Tracking
                        </button>
                      )}
                      {isGetLabel(order) && (
                        <button
                          onClick={(e) => { e.stopPropagation(); viewLabelHandler(order); }}
                          className="bg-green-600 hover:bg-green-700 active:bg-green-800 transition-all text-white px-1 py-1 text-[10px] rounded-lg font-medium w-full shadow-sm hover:shadow-md"
                        >
                          Get Label
                        </button>
                      )}
                    </div>
                    {order.is_note && (
                      <span className="absolute top-0 right-2 h-4 w-4 bg-red-500 rounded-bl-lg flex items-center justify-center text-white text-xs font-bold shadow-sm">
                        !
                      </span>
                    )}
                  </td>
                </tr>
              </Fragment>
            ))}
          </tbody>
        </table>

        {/* Loading trigger element for Intersection Observer */}
        {hasMore && (
          <div ref={loadingTriggerRef} className="h-20 flex items-center justify-center">
            {(loading || isLoadingMore) ? <LoadingIndicator /> : null}
          </div>
        )}

        {/* No more data indicator */}
        {!hasMore && orders.length > 0 && <NoMoreDataIndicator />}

        {/* Empty state */}
        {!loading && orders.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-semibold mb-2">Không có đơn hàng nào</h3>
            <p className="text-sm">Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác</p>
          </div>
        )}
      </div>

      <ModalProductOrderView
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        lineItems={selectedProducts}
        shopId={shopSelect}
      />
    </>
  );
}