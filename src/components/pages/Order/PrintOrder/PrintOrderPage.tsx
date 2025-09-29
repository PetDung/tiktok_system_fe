"use client"
import { Eye, History, PrinterCheck, SquareCheckBig } from "lucide-react";
import { useEffect, useState } from "react";
import ReviewPrint from "./_components/ReviewPrint";
import AwaitDesign from "./_components/AwaitDesign";
import Printing from "./_components/Printing";
import { ApiResponse, Order, PrintShop } from "@/service/types/ApiResponse";
import { useWebSocket } from "@/Context/WebSocketContext";
import { IMessage } from "@stomp/stompjs";
import { CategoryPrintPrinteesHub, fetchSkuMKP, getVariationsMenPrint, getVariationsPrinteesHub, MenPrintData, ProductMenPrint } from "@/service/print-order/getSKU";
import { usePrinters } from "@/lib/customHooks/usePrinters";
import { useFetch } from "@/lib/useFetch";
import { getOrderCantPrint, getPrintShippingMethod } from "@/service/print-order/print-order-service";
import { Message } from "@/service/types/websocketMessageType";
import { PrintShippMethod } from "@/service/types/PrintOrder";
import PrintSucc from "./_components/PrintSuccess";
import { SKUMPK } from "@/service/print-order/data";

const tabs = [
  { id: "Review", label: "Cần xét duyệt", icon: <Eye /> },
  { id: "AwaitDesign", label: "Chờ thiết kế", icon: <History /> },
  { id: "Printing", label: "Sẵn sàng in", icon: <PrinterCheck /> },
  { id: "OrderPrint", label: "Đã đặt in", icon: <SquareCheckBig /> },
];

export default function PrintOrderPage() {
  const [activeTab, setActiveTab] = useState("Review");

  const [orderReviewList, setOrderReviewList] = useState<Order[]>([]);
  const [orderAwaitList, setOrderAwaitList] = useState<Order[]>([]);
  const [orderPrintingList, setOrderPringtingList] = useState<Order[]>([]);
  const [orderSuccessList, setOrderSuccessList] = useState<Order[]>([]);

  // loading state riêng cho từng tab
  const [isLoadingReview, setIsLoadingReview] = useState<boolean>(false);
  const [pageReview, setPageReview] = useState<number>(0);
  const [hasMoreReview, setHasMoreReview] = useState<boolean>(true);

  const [isLoadingAwait, setIsLoadingAwait] = useState<boolean>(false);
  const [pageAwait, setPageAwait] = useState<number>(0);
  const [hasMoreAwait, setHasMoreAwait] = useState<boolean>(true);

  const [isLoadingPrinting, setIsLoadingPrinting] = useState<boolean>(false);
  const [pagePrinting, setPagePrinting] = useState<number>(0);
  const [hasMorePrinting, setHasMorePrinting] = useState<boolean>(true);

  const [isLoadingPrintSuccess, setIsLoadingSuccess] = useState<boolean>(false);
  const [pageSuccess, setPageSuccess] = useState<number>(0);
  const [hasMoreSuccess, setHasMoreSuccess] = useState<boolean>(true);
  
  

  const wsClient = useWebSocket();

  const { data: printersResponse } = usePrinters();
  const { data: variationsPrinteesHubResponse } = useFetch<CategoryPrintPrinteesHub[]>({
    fetcher: getVariationsPrinteesHub,
    key: "variations-printeesHub"
  });

  const { data: SkuMPKRespoonse } = useFetch<SKUMPK[]>({
    fetcher: fetchSkuMKP,
    key: "variations-mpk"
  });

  const { data: productMenPrintResponse } = useFetch<MenPrintData<ProductMenPrint>>({
    fetcher: getVariationsMenPrint,
    key: "variations-menPrint"
  });

  const { data: printShippingMethod } = useFetch<ApiResponse<PrintShippMethod[]>>({
    fetcher: getPrintShippingMethod,
    key: "print-shipping-method"
  });


  const printers: PrintShop[] = printersResponse?.result ?? [];
  const skumpk: SKUMPK[] = SkuMPKRespoonse || [];
  const variationsPrinteesHub: CategoryPrintPrinteesHub[] = variationsPrinteesHubResponse ?? [];
  const productMenPrint: ProductMenPrint[] = productMenPrintResponse?.data ?? [];
  const printShippingMethods: PrintShippMethod[] = printShippingMethod?.result ?? [];

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoadingReview(true);
        setIsLoadingAwait(true);
        setIsLoadingPrinting(true);
        setIsLoadingSuccess(true)
        await Promise.all([
          loadOrderReview(), 
          loadOrderAwait(), 
          loadOrderPringting(), 
          loadOrderSuccess()
        ]);
      } catch (err) {
        console.error("Error loading orders:", err);
      }
    };
    loadData();
  }, []);

  const loadMoreAwait = async () => {
    if (!hasMoreAwait) return;
    await loadOrderReview(pageAwait + 1, true)
  }
  const loadOrderReview = async (pageInput = 0, append = false) => {
    try {
      const responseReview = await getOrderCantPrint({ printStatus: ["REVIEW", "PRINT_REQUEST_FAIL"], page: pageInput });
      const newOrders: Order[] = responseReview.result.data;
      if (!append) {
        setOrderReviewList(newOrders)
      } else {
        setOrderReviewList((prev) => {
          const map = new Map<string, Order>();
          [...prev, ...newOrders].forEach((o) => map.set(o.id, o));
          return Array.from(map.values()).sort((a, b) => b.create_time - a.create_time);
        });

      }
      setPageReview(responseReview.result.current_page ?? 0);
      const isLast = responseReview?.result?.last ?? true;
      setHasMoreReview(!isLast);
    } catch (e: any) {
      alert(e?.message || "Fail load Review orders");
    } finally {
      setIsLoadingReview(false);
    }
  };

  const loadMoreRevew = async () => {
    if (!hasMoreReview) return;
    await loadOrderReview(pageReview + 1, true)
  }

  const loadOrderAwait = async (pageInput = 0, append = false) => {
    try {
      const responseAwait = await getOrderCantPrint({ printStatus: ["AWAITING"], page: pageInput });
      const newOrders: Order[] = responseAwait.result.data;
      if (!append) {
        setOrderAwaitList(newOrders)
      } else {
        setOrderAwaitList((prev) => {
          const map = new Map<string, Order>();
          [...prev, ...newOrders].forEach((o) => map.set(o.id, o));
          return Array.from(map.values()).sort((a, b) => b.create_time - a.create_time);
        });

      }
      setPageAwait(responseAwait.result.current_page ?? 0);
      const isLast = responseAwait?.result?.last ?? true;
      setHasMoreAwait(!isLast);
    } catch (e: any) {
      alert(e?.message || "Fail load Await orders");
    } finally {
      setIsLoadingAwait(false);
    }
  };

  const loadMorePringting = async () => {
    if (!hasMorePrinting) return;
    await loadOrderPringting(pagePrinting + 1, true)
  }
  const loadOrderPringting = async (pageInput = 0, append = false) => {
    try {
      const responsePringting = await getOrderCantPrint({ printStatus: ["PRINTED"], page: pageInput });
      const newOrders: Order[] = responsePringting.result.data;
      if (!append) {
        setOrderPringtingList(newOrders)
      } else {
        setOrderPringtingList((prev) => {
          const map = new Map<string, Order>();
          [...prev, ...newOrders].forEach((o) => map.set(o.id, o));
          return Array.from(map.values()).sort((a, b) => b.create_time - a.create_time);
        });

      }
      setPagePrinting(responsePringting.result.current_page ?? 0);
      const isLast = responsePringting?.result?.last ?? true;
      setHasMorePrinting(!isLast);
    } catch (e: any) {
      alert(e?.message || "Fail load Await orders");
    } finally {
      setIsLoadingPrinting(false);
    }
  };

  const loadMoreSuccess = async () => {
    if (!hasMoreSuccess) return;
    await loadOrderSuccess(pageSuccess + 1, true)
  }
  const loadOrderSuccess = async (pageInput = 0, append = false) => {
    try {
      const responsePringting = await getOrderCantPrint({ printStatus: ["PRINT_REQUEST_SUCCESS", "PRINT_CANCEL"], page: pageInput });
      const newOrders: Order[] = responsePringting.result.data;
      if (!append) {
        setOrderSuccessList(newOrders)
      } else {
        setOrderSuccessList((prev) => {
          const map = new Map<string, Order>();
          [...prev, ...newOrders].forEach((o) => map.set(o.id, o));
          return Array.from(map.values()).sort((a, b) => b.create_time - a.create_time);
        });

      }
      setPageSuccess(responsePringting.result.current_page ?? 0);
      const isLast = responsePringting?.result?.last ?? true;
      setHasMoreSuccess(!isLast);
    } catch (e: any) {
      alert(e?.message || "Fail load Await orders");
    } finally {
      setIsLoadingSuccess(false);
    }
  };

  const refreshData = async () => {
    if (activeTab === "Review") {
      setIsLoadingReview(true)
      await loadOrderReview()
    }
    else if (activeTab === "AwaitDesign") {
      setIsLoadingAwait(true)
      await loadOrderAwait()
    }
    else if (activeTab === "Printing") {
      setIsLoadingPrinting(true)
      await loadOrderPringting()
    } else if (activeTab === "OrderPrint") {
      setIsLoadingSuccess(true)
      await loadOrderSuccess()
    }
  }

  // WebSocket effect
  useEffect(() => {
    const callback = (msg: IMessage) => {
      const updated: Message<Order> = JSON.parse(msg.body);
      if (updated.event === "UPDATE") {
        const newOrder = updated.data;
        console.log(newOrder)
        if (newOrder.print_status === "REVIEW" || newOrder.print_status === "PRINT_REQUEST_FAIL" ) {
          upsertOrderReview(newOrder);
        } else if (newOrder.print_status === "AWAITING") {
          upsertOrderAwait(newOrder);
        } else if (newOrder.print_status === "PRINTED") {
          upsertOrderPrinting(newOrder);
        } else if(newOrder.print_status === "PRINT_REQUEST_SUCCESS" || newOrder.print_status === "PRINT_CANCEL"){
          upsertOrderSuccess(newOrder)
        }
      }
    };
    wsClient.subscribe("/user/queue/orders", callback);
    return () => {
      wsClient.unsubscribe("/user/queue/orders");
    };
  }, [wsClient]);

  const upsertOrderReview = (newOrder: Order) => {
    setOrderReviewList(prevOrders => {
      const exists = prevOrders.some(o => o.id === newOrder.id);
      let updated = exists
        ? prevOrders.map(o => (o.id === newOrder.id ? newOrder : o))
        : [...prevOrders, newOrder];
      return updated.sort((a, b) => b.create_time - a.create_time);
    });
  };

  const upsertOrderAwait = (newOrder: Order) => {
    setOrderAwaitList(prevOrders => {
      const exists = prevOrders.some(o => o.id === newOrder.id);
      let updated = exists
        ? prevOrders.map(o => (o.id === newOrder.id ? newOrder : o))
        : [...prevOrders, newOrder];
      return updated.sort((a, b) => b.create_time - a.create_time);
    });
  };

  const upsertOrderPrinting = (newOrder: Order) => {
    setOrderPringtingList(prevOrders => {
      const exists = prevOrders.some(o => o.id === newOrder.id);
      let updated = exists
        ? prevOrders.map(o => (o.id === newOrder.id ? newOrder : o))
        : [...prevOrders, newOrder];
      return updated.sort((a, b) => b.create_time - a.create_time);
    });
  };

  const upsertOrderSuccess = (newOrder: Order) => {
    setOrderSuccessList(prevOrders => {
      const exists = prevOrders.some(o => o.id === newOrder.id);
      let updated = exists
        ? prevOrders.map(o => (o.id === newOrder.id ? newOrder : o))
        : [...prevOrders, newOrder];
      return updated.sort((a, b) => b.create_time - a.create_time);
    });
  };


  return (
    <div className="bg-white px-6 py-2 shadow-lg h-[calc(100vh-56px)] flex flex-col">
      <div>
        <button
          onClick={refreshData}
          disabled={isLoadingAwait || isLoadingReview}
          className="px-3 sticky top-0 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center"
        >
          {isLoadingAwait || isLoadingReview ? (
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
        {activeTab === "Review" && (
          <ReviewPrint
            skuMPK={skumpk}
            printShippingMethods = {printShippingMethods}
            hasMore={hasMoreReview}
            loadMore={loadMoreRevew}
            isLoading={isLoadingReview}
            orderReviewList={orderReviewList}
            setOrderReviewList={setOrderReviewList}
            variationsPrinteesHub={variationsPrinteesHub}
            productMenPrint={productMenPrint}
            printers={printers}
          />
        )}
        {activeTab === "AwaitDesign" && (
          <AwaitDesign
            skuMPK={skumpk}
            printShippingMethods = {printShippingMethods}
            hasMore={hasMoreAwait}
            loadMore={loadMoreAwait}
            isLoading={isLoadingAwait}
            orderAwaitList={orderAwaitList}
            setOrderAwaitList={setOrderAwaitList}
            variationsPrinteesHub={variationsPrinteesHub}
            productMenPrint={productMenPrint}
            printers={printers}
          />
        )}
        {activeTab === "Printing" && 
          <Printing
              skuMPK={skumpk}
              printShippingMethods = {printShippingMethods}
              hasMore={hasMorePrinting}
              loadMore={loadMorePringting}
              isLoading={isLoadingPrinting}
              orderReviewList={orderPrintingList}
              setOrderReviewList={setOrderPringtingList}
              variationsPrinteesHub={variationsPrinteesHub}
              productMenPrint={productMenPrint}
              printers={printers}
         />}
         {activeTab === "OrderPrint" && 
          <PrintSucc
              hasMore={hasMoreSuccess}
              loadMore={loadMoreSuccess}
              isLoading={isLoadingPrintSuccess}
              orderSuccesList={orderSuccessList}
              setOrderSuccesList={setOrderSuccessList}
         />}
      </div>
    </div>
  );
}

