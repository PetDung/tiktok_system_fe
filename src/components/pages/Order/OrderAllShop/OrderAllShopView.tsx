"use client"
import { exportOrderSelected, getOrderAllShop, updatePrinterOrder } from "@/service/order/order-service";
import { Order, PrintShop, ShopResponse } from "@/service/types/ApiResponse";
import { useCallback, useEffect, useRef, useState } from "react";
import OrderTable from "../_components/OrderTable";
import MultiSelect, { Option } from "../_components/MultiSelect";
import { debounce } from "lodash";
import { useWebSocket } from "@/Context/WebSocketContext";
import { IMessage } from "@stomp/stompjs";
import LoadingOverlay from "@/components/UI/LoadingOverlay";
import ImportDropdown from "../_components/ImportDropdown";
import { useSearchParams } from "next/navigation";
import { usePrinters } from "@/lib/customHooks/usePrinters";
import { useShops } from "@/lib/customHooks/useShops";
import { Message } from "@/service/types/websocketMessageType";

const statusOptions = [
    { value: "UNPAID", label: "Unpaid" },
    { value: "ON_HOLD", label: "On Hold" },
    { value: "AWAITING_SHIPMENT", label: "Awaiting Shipment" },
    { value: "PARTIALLY_SHIPPING", label: "Partially Shipping" },
    { value: "AWAITING_COLLECTION", label: "Awaiting Collection" },
    { value: "IN_TRANSIT", label: "In Transit" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "COMPLETED", label: "Completed" },
    { value: "CANCELLED", label: "Cancelled" },
];

const shipTypeOption = [
    { value: "TIKTOK", label: "TikTok" },
    { value: "SELLER", label: "Seller" }
]

export default function OrderAllShopView() {
    const searchParams = useSearchParams();
    const orderIdParam = searchParams.get("order_id") || "";

    // State management
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string>("");
    const [shipBy, setShipBy] = useState<string>("");
    const [orderId, setOrderId] = useState<string>(orderIdParam);
    const [page, setPage] = useState<number>(0);
    const [isLast, setIsLast] = useState<boolean>(true);
    const [selectedShops, setSelectedShops] = useState<string[]>([]);
    const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
    const [exportLoading, setExporting] = useState<boolean>(false);
    const [totalOrders, setTotalOrders] = useState<number>(0);
    
    const wsClient = useWebSocket(); 
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const { data: printersResponse } = usePrinters();
    const printers: PrintShop[] = (printersResponse?.result ?? []).sort(
        (a: PrintShop, b: PrintShop) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    
    const { data: shopsResponse, isLoading: shopLoading } = useShops();
    const shops = (shopsResponse?.result ?? []).sort(
        (a: ShopResponse, b: ShopResponse) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    const optionShops: Option[] = shops.map((item: ShopResponse) => ({
        value: item.id,
        label: item.userShopName,
    }));

    useEffect(() => {
        const callback = (msg: IMessage) => {
            const updated: Message<Order> = JSON.parse(msg.body);
            if(updated.event === "UPDATE") {
                const newOrder = updated.data;
                updateAOrder(newOrder)
            }
        };
        wsClient.subscribe("/user/queue/orders", callback);
        return () => {
            wsClient.unsubscribe("/user/queue/orders");
        };
    }, [wsClient]);

    // Fetch orders when filters change
    useEffect(() => {
        fetchOrders(0);
    }, [status, shipBy, selectedShops]);
    // Search handler with validation
    const handlerSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!orderId || is18Digit(orderId)) {
            await fetchOrders(0);
            setStatus("");
            setShipBy("");
            setPage(0);
            return;
        }

        // Better error handling
        if (searchInputRef.current) {
            searchInputRef.current.focus();
            searchInputRef.current.classList.add('border-red-500', 'ring-red-500');
            setTimeout(() => {
                searchInputRef.current?.classList.remove('border-red-500', 'ring-red-500');
            }, 3000);
        }
        alert("Không đúng định dạng ID! (Cần 18 chữ số)");
    };

    // Fetch orders with improved error handling
    const fetchOrders = async (newPage: number) => {
        if (loading) return;
        
        setLoading(true);
        try {
            const response = await getOrderAllShop({ 
                page: newPage, 
                status: status, 
                shipping: shipBy, 
                orderId: orderId, 
                shopIds: selectedShops 
            });
            
            const newOrders = response?.result?.data || [];
            
            if (newPage === 0) {
                setOrders(newOrders);
            } else {
               setOrders(prev => {
                    // Tạo set các id hiện có
                    const existingIds = new Set(prev.map(o => o.id));

                    // Lọc những order mới chưa có trong set
                    const uniqueNewOrders = newOrders.filter(o => !existingIds.has(o.id));

                    // Trả về mảng kết hợp
                    return [...prev, ...uniqueNewOrders];
               });
            }
            
            setPage(response.result?.current_page || 0);
            setIsLast(response.result?.last ?? true);
            setTotalOrders(response.result?.total_count || 0);

        } catch (error: any) {
            console.error('Fetch orders error:', error);
            alert(error.message || "Có lỗi khi tải đơn hàng");
        } finally {
            setLoading(false);
        }
    };
    // Validation function
    function is18Digit(str: string) {
        return /^\d{18}$/.test(str);
    }
    // Shop selection handler
    const handleSelected = (selected: Option[]) => {
        console.log("Selected (debounced):", selected);
        const selectIds = selected.map(item => item.value);
        setSelectedShops(selectIds);
    };

    // Debounced shop selection
    const debouncedHandleSelected = useCallback(
        debounce(handleSelected, 600),
        []
    );
    
    // Export orders with better UX
    const exportOrder = async () => {
        if (selectedOrders.size === 0) return;
        
        setExporting(true);
        try {
            const response = await exportOrderSelected({ 
                orderIds: Array.from(selectedOrders) 
            });
            
            const rs = response?.result;
            const keys = Object.keys(rs); 
            let message: string = "";
            const orderError = new Set<string>();
            
            keys.forEach(key => {
                if (rs[key]) {
                    message += `${key}: ${rs[key]}\n`;
                }
                orderError.add(key);
            });
            
            if (message) {
                alert(`Export completed with some issues:\n${message}`);
            } else {
                alert("Export completed successfully!");
            }
            
            setSelectedOrders(orderError);
        } catch (error: any) {
            console.error('Export error:', error);
            alert(error.message || "Có lỗi khi export đơn hàng");
        } finally {
            setExporting(false);
        }
    }

    // Update printer for order
    const updatePrinter = async (orderId: string, printerId: string | null) => {
        try {
            const finalPrinterId = !printerId ? "REMOVE" : printerId;
            const response = await updatePrinterOrder(orderId, finalPrinterId);
            const newOrder : Order = response.result;
            updateAOrder(newOrder)
        } catch (e: any) {
            console.error('Update printer error:', e);
            alert(e.message || "Lỗi khi cập nhật máy in");
        }
    }

    // Clear all filters
    const clearAllFilters = () => {
        setStatus("");
        setShipBy("");
        setSelectedShops([]);
        setOrderId("");
        setSelectedOrders(new Set());
    };

    // Custom dropdown component
    const CustomSelect = ({ value, onChange, options, placeholder, disabled = false }: {
        value: string;
        onChange: (value: string) => void;
        options: { value: string; label: string }[];
        placeholder: string;
        disabled?: boolean;
    }) => (
        <div className="relative inline-block w-44">
            <select
                className={`appearance-none w-full border rounded-lg px-4 py-2.5 text-sm bg-white cursor-pointer transition-all duration-200 ${
                    disabled 
                        ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' 
                        : 'border-gray-300 text-gray-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                } shadow-sm`}
                onChange={(e) => onChange(e.target.value)}
                value={value}
                disabled={disabled}
            >
                <option value="">{placeholder}</option>
                {options.map((item) => (
                    <option value={item.value} key={item.value}>
                        {item.label}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                    className={`w-4 h-4 transition-colors ${disabled ? 'text-gray-300' : 'text-gray-400'}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );

    const updateAOrder = ( newOrder : Order) =>{
        setOrders(prevOrders => prevOrders.map(o => o.id === newOrder.id ? newOrder : o));
    }

    return (
        <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex flex-col ">
            {/* Header with improved styling */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2 gap-4">
                <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-gray-900">Order Management</h2>
                    {totalOrders > 0 && (
                        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {orders.length} / {totalOrders} orders
                        </span>
                    )}
                    {selectedOrders.size > 0 && (
                        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
                            {selectedOrders.size} selected
                        </span>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        onClick={exportOrder}
                        disabled={selectedOrders.size === 0 || exportLoading}
                        className={`px-2 py-2 text-xs font-medium rounded-lg transition-all duration-200 flex items-center space-x-2 ${
                            selectedOrders.size === 0 || exportLoading
                                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                : "bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-lg"
                        }`}
                    >
                        {exportLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Exporting...</span>
                            </>
                        ) : (
                            <>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Export ({selectedOrders.size})</span>
                            </>
                        )}
                    </button>

                    <ImportDropdown printers={printers} />

                    <button
                        type="button"
                        onClick={clearAllFilters}
                        className="px-2 py-2 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Clear Filters</span>
                    </button>
                </div>
            </div>

            {/* Filters section with improved layout */}
            <div className="bg-gray-50 p-2 rounded-lg mb-2 border border-gray-200">
                <div className="flex flex-wrap items-end gap-4">
                    {/* Ship By Filter */}
                    <div>
                        <CustomSelect
                            value={shipBy}
                            onChange={setShipBy}
                            options={shipTypeOption}
                            placeholder="All Shipping Types"
                        />
                    </div>

                    {/* Status Filter */}
                    <div>
                        <CustomSelect
                            value={status}
                            onChange={setStatus}
                            options={statusOptions}
                            placeholder="All Statuses"
                        />
                    </div>

                    {/* Shops MultiSelect */}
                    <div>
                        <div className="min-w-[240px]">
                            <MultiSelect
                                options={optionShops}
                                loading={shopLoading}
                                onChange={debouncedHandleSelected}
                            />
                        </div>
                    </div>

                    {/* Search by Order ID */}
                    <div className="flex-1 min-w-[320px]">
                        <form onSubmit={handlerSearch} className="flex space-x-2">
                            <input
                                ref={searchInputRef}
                                type="search"
                                value={orderId}
                                onChange={(e) => setOrderId(e.target.value)}
                                placeholder="Enter 18-digit order ID..."
                                className="flex-1 border text-sm border-gray-300 rounded-lg px-2 outline-none transition-all duration-200"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Searching...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                        <span>Search</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="flex-1 min-h-0 overflow-auto">
                <OrderTable
                    orders={orders}
                    loading={loading}
                    hasMore={!isLast}
                    onLoadMore={() => fetchOrders(page + 1)}
                    isSelectable={true}
                    selectList={selectedOrders}
                    onSelectChange={setSelectedOrders}
                    updatePOrder={updatePrinter}
                    type="ALL"
                    printer={printers}
                />
            </div>
            
            <LoadingOverlay show={exportLoading} />
        </div>
    )
}