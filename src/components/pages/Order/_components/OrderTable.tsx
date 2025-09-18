import { LineItem, Order, PrintShop } from "@/service/types/ApiResponse";
import React, { Fragment, useEffect, useRef, useState } from "react";
import ModalProductOrderView from "./ModalProductOrderView";
import { buyLabel, viewLabel } from "@/service/label/label-service";
import { useParams } from "next/navigation";
import OptionalSelect, { Option } from "@/components/UI/OptionalSelect";
import { getAllPrinter } from "@/service/print/print-service";
import EditableField from "@/components/UI/EditableField";
import { updateCostOrder } from "@/service/order/order-service";


interface OrderTableProps {
  orders: Order[];
  loading: boolean;
  hasMore: boolean;
  printer? : PrintShop[]
  onLoadMore: () => void;
  isSelectable?: boolean;
  selectList?: Set<string>;
  onSelectChange?: (selected: Set<string>) => void;
  updatePOrder?:(orderId: string, printerId : string | null) => void
  type?: string;
}

export default function  OrderTable(
  { orders, 
    loading,
     hasMore, 
     onLoadMore, 
     isSelectable = false, 
     selectList = new Set(), 
     onSelectChange = () => null ,
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

  const tableRef = useRef<HTMLDivElement>(null);
  
  const handleShowProducts = (lineItems: LineItem[], shopIdSelected: string) => {
    setSelectedProducts(lineItems);
    setShopSelect(shopIdSelected);
    setModalOpen(true);
  };

  useEffect(()=> {
    if(type === "ONE") return;
    const options : Option[] = printer.map(item => ({
          value : item.id,
          label : item.name
        }))
    setPrinterOption(options)
  }, [printer])

  const handleScroll = () => {
    if (!tableRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 50 && !loading && hasMore) {
      onLoadMore();
    }
  };

  const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleString("vi-VN", {
      weekday: "long",   // Thứ
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
    if (order.label) {url = order.label;}
    if (url) window.open(url, "_blank");
  };

  const handlerUpdaterPrintOrder = (orderId: string , value: string | null ) => {
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

    // Chọn/bỏ chọn từng item
    const onSelect = (value: string, checked: boolean) => {
      const newSelected = new Set(selectList);
      if (checked) newSelected.add(value);
      else newSelected.delete(value);
      onSelectChange(newSelected);
    };

    // Chọn/bỏ chọn tất cả
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
  // Kiểm tra trạng thái checkbox "tất cả"
  const isAllSelected = orders.length > 0 && selectList.size === orders.length;


  return (
    <>
      <div ref={tableRef} onScroll={handleScroll} className="relative h-[80vh] overflow-y-auto shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
            <tr>
              <th className="px-3 py-2 text-left">
                  <div>#</div>
                  {isSelectable && (
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => selectAll(e.currentTarget.checked)}
                      className="mt-1 h-5 w-5 cursor-pointer accent-green-600 rounded transition duration-200"
                    />
                  )}
              </th>
              <th className="px-3 py-2 text-left">Order ID</th>
              <th className="px-3 py-2 text-left">Products</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Tiền</th>
              {type === "ALL" && <th className="px-3 py-2 text-left">In</th>}
              <th className="px-3 py-2 text-left">Customer</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order, idx) => (
              <Fragment key={order.id}>
                <tr className="hover:bg-gray-50 cursor-pointer transition-all duration-150 relative" >
                  <td className="px-3 py-2 font-medium">
                    <div className="flex flex-col justify-center items-center">
                        <div>{idx + 1}</div>
                        {isSelectable && 
                        <input 
                          type="checkbox"  
                          name="orderId" 
                          value={order.id}  
                          className="mt-1 h-5 w-5 cursor-pointer accent-green-600 rounded transition duration-200"
                          checked={hasId(order.id)}
                          onChange={(e) => onSelect(e.currentTarget.value,  e.currentTarget.checked)}
                          />}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    {type === "ALL" && <div className="text-gray-700 font-semibold">{order.shop_name}</div>}
                    <div className="text-gray-500 text-xs">ID: {order.id}</div>
                    <div className="text-gray-500 text-xs">
                      Tracking: {order.tracking_number || <span className="text-red-500">Chưa có</span>}
                    </div>
                    <div className="text-gray-400 text-xs">{formatDate(order.create_time)}</div>
                  </td>
                  <td className="px-3 py-2" onClick={(e) => { 
                      e.stopPropagation(); 
                      let temp: string = shopId || order.shop_id || "";
                      console.log("shopId in OrderTable", temp);
                      handleShowProducts(order.line_items, temp);
                  }}>
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
                    {order.returns && order.returns?.length > 0 && (
                      <div className="mt-2 rounded-lg text-xs text-red-600">
                        <a href={`/refund?order_id=${order.id}`}>
                          <div className="flex items-center">
                            <span className="font-semibold">Status:</span>
                            <span>{order.returns?.[0]?.returnType}</span>
                          </div>
                        </a>
                      </div>
                    )}


                    <div className="text-gray-400 text-xs mt-1">Ship: {order.shipping_type}</div>
                  </td>
                  <td className="px-3 py-2 font-semibold">
                    <div className="flex flex-col gap-1">
                      <p className="text-gray-800">
                        <span className="font-bold">Total:</span>{" "}
                        {order.payment.total_amount} {order.payment.currency}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Dự kiến:</span>{" "}
                        {order.payment_amount} {order.payment.currency}
                      </p>
                       <p className="text-gray-600 text-sm">
                        <span className="font-medium">Thực tế:</span>{" "}
                        {order?.settlement?.settlement_amount || 0} {order.payment.currency}
                      </p>

                      <div className="text-gray-600 text-sm">
                        <EditableField
                          value={`${order?.cost?.toString() || 0 }`}
                          onSave={(value) => {
                            saveCost(value, order.id)
                          }}
                          label = "Chỉnh cost"
                          type="number"
                          fistText="Cost:"
                        />
                      </div>
                    </div>
                  </td>

                  {type === "ALL" &&  <td className="px-3 py-2 font-semibold">
                    <OptionalSelect
                      value={order?.printer?.id ?? null}
                      options={printerOption}
                      placeholder = "Nhà in"
                      size={150}
                      onChange={(value) => {
                        handlerUpdaterPrintOrder(order.id, value)
                      }}
                    />
                  </td>}
                  <td className="px-3 py-2 text-gray-700">
                    <div className="font-medium">{order.recipient_address.name}</div>
                    <div className="text-xs">{order.recipient_address.phone_number}</div>
                    <div className="text-xs">{order.recipient_address.address_detail}</div>
                    <div className="text-xs" >{order.recipient_address.district_info.map(d => d.address_name).join(", ")}</div>
                    <div className="text-xs">{order.recipient_address.postal_code}</div>
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
                     {order.is_note && (
                      <span
                      className="absolute top-0 right-0 h-6 w-4
                       bg-red-500 rounded-tr-lg 
                       rounded-bl-lg flex items-center 
                       justify-center text-white text-xs font-bold">
                    </span>
                    )}
                  </td>
                </tr>
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
        shopId = { shopSelect }
      />
    </>
  );
}
