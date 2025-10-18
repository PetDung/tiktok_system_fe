"use client"
import { Eye, History, Loader, PrinterCheck, SquareCheckBig } from "lucide-react";
import { useEffect, useState, useCallback, useMemo } from "react";
import OrderTab from "./_components/OrderTab";
import PrintSucc from "./_components/PrintSuccess";
import { useOrderTab } from "@/lib/customHooks/useOrderTab";
import { usePrintOrderData } from "@/lib/customHooks/usePrintOrderData";
import { useWebSocketOrderUpdates } from "@/lib/customHooks/useWebSocketOrderUpdates";

const tabs = [
  { id: "Review", label: "Cần xét duyệt", icon: <Eye /> },
  { id: "AwaitDesign", label: "Chờ thiết kế", icon: <History /> },
  { id: "Printing", label: "Sẵn sàng in", icon: <PrinterCheck /> },
  { id: "PrintRequest", label: "Đang yêu cầu in", icon: <Loader /> }, // 👈 thêm mới
  { id: "OrderPrint", label: "Đã đặt in", icon: <SquareCheckBig /> },
];

export default function PrintOrderPage() {
  const [activeTab, setActiveTab] = useState("Review");

  // Use custom hooks for order management
  const reviewTab = useOrderTab(["REVIEW", "PRINT_REQUEST_FAIL"]);
  const awaitTab = useOrderTab(["AWAITING"]);
  const printingTab = useOrderTab(["PRINTED"]);
  const successTab = useOrderTab(["PRINT_REQUEST_SUCCESS", "PRINT_CANCEL", "USER_PRINT"], "create_print_time");
  const printRequestTab = useOrderTab(["PRINT_REQUEST"]);

  // Use custom hook for shared data
  const printOrderData = usePrintOrderData();

  // Initialize data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          reviewTab.actions.loadOrders(),
          awaitTab.actions.loadOrders(),
          printingTab.actions.loadOrders(),
          successTab.actions.loadOrders(),
          printRequestTab.actions.loadOrders()
        ]);
      } catch (err) {
        console.error("Error loading orders:", err);
      }
    };
    loadData();
  }, []);

  // Setup WebSocket updates
  useWebSocketOrderUpdates({
    reviewActions: reviewTab.actions,
    awaitActions: awaitTab.actions,
    printingActions: printingTab.actions,
    successActions: successTab.actions,
    printRequestActions: printRequestTab.actions,
  });

  // Memoized refresh function
  const refreshData = useCallback(async () => {
    const tabActions = {
      Review: reviewTab.actions.refreshOrders,
      AwaitDesign: awaitTab.actions.refreshOrders,
      Printing: printingTab.actions.refreshOrders,
      OrderPrint: successTab.actions.refreshOrders,
      PrintRequest: printRequestTab.actions.refreshOrders,
    };
    
    const refreshAction = tabActions[activeTab as keyof typeof tabActions];
    if (refreshAction) {
      await refreshAction();
    }
  }, [activeTab, reviewTab.actions, awaitTab.actions, printingTab.actions, successTab.actions, printRequestTab.actions]);

  // Memoized tab content
  const tabContent = useMemo(() => {
    const commonProps = {
      skuMPK: printOrderData.skuMPK,
      printShippingMethods: printOrderData.printShippingMethods,
      variationsPrinteesHub: printOrderData.variationsPrinteesHub,
      productMenPrint: printOrderData.productMenPrint,
      printers: printOrderData.printers,
      productMangoTeePrint: printOrderData.productMangoTeePrint,
    };

    switch (activeTab) {
      case "Review":
        return (
          <OrderTab
            {...commonProps}
            orderList={reviewTab.state.orders}
            setOrderList={reviewTab.actions.setOrders}
            isLoading={reviewTab.state.isLoading}
            loadMore={reviewTab.actions.loadMore}
            hasMore={reviewTab.state.hasMore}
          />
        );
      case "AwaitDesign":
        return (
          <OrderTab
            {...commonProps}
            orderList={awaitTab.state.orders}
            setOrderList={awaitTab.actions.setOrders}
            isLoading={awaitTab.state.isLoading}
            loadMore={awaitTab.actions.loadMore}
            hasMore={awaitTab.state.hasMore}
          />
        );
      case "Printing":
        return (
          <OrderTab
            {...commonProps}
            orderList={printingTab.state.orders}
            setOrderList={printingTab.actions.setOrders}
            isLoading={printingTab.state.isLoading}
            loadMore={printingTab.actions.loadMore}
            hasMore={printingTab.state.hasMore}
          />
        );
      case "PrintRequest":
        return (
          <OrderTab
            {...commonProps}
            orderList={printRequestTab.state.orders}
            setOrderList={printRequestTab.actions.setOrders}
            isLoading={printRequestTab.state.isLoading}
            loadMore={printRequestTab.actions.loadMore}
            hasMore={printRequestTab.state.hasMore}
          />
        );
      case "OrderPrint":
        return (
          <PrintSucc
            orderSuccesList={successTab.state.orders}
            setOrderSuccesList={successTab.actions.setOrders}
            isLoading={successTab.state.isLoading}
            loadMore={successTab.actions.loadMore}
            hasMore={successTab.state.hasMore}
          />
        );
      default:
        return null;
    }
  }, [
    activeTab,
    printOrderData,
    reviewTab.state,
    reviewTab.actions,
    awaitTab.state,
    awaitTab.actions,
    printingTab.state,
    printingTab.actions,
    printRequestTab.state,
    printRequestTab.actions,
    successTab.state,
    successTab.actions,
  ]);

  // Memoized loading state for refresh button
  const isRefreshing = useMemo(() => {
    const loadingStates = {
      Review: reviewTab.state.isLoading,
      AwaitDesign: awaitTab.state.isLoading,
      Printing: printingTab.state.isLoading,
      OrderPrint: successTab.state.isLoading,
      PrintRequest: printRequestTab.state.isLoading,
    };
    return loadingStates[activeTab as keyof typeof loadingStates] || false;
  }, [activeTab, reviewTab.state.isLoading, awaitTab.state.isLoading, printingTab.state.isLoading, successTab.state.isLoading, printRequestTab.state.isLoading]);

  return (
    <div className="bg-white px-6 py-2 shadow-lg h-[calc(100vh-56px)] flex flex-col">
      <div>
        <button
          onClick={refreshData}
          disabled={isRefreshing}
          className="px-3 sticky top-0 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center"
        >
          {isRefreshing ? (
            <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"></span>
          ) : null}
          Làm mới
        </button>
      </div>
      {/* Tab Navigation */}
      <div className="mb-2 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center ${activeTab === tab.id
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-200 ease-in-out flex-1 overflow-y-auto">
        {tabContent}
      </div>
    </div>
  );
}

