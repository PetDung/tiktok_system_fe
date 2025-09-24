"use client"
import { Eye, History, PrinterCheck } from "lucide-react";
import { useEffect, useState } from "react";
import ReviewPrint from "./_components/ReviewPrint";
import AwaitDesign from "./_components/AwaitDesign";
import Printing from "./_components/Printing";
import { Order, PrintShop } from "@/service/types/ApiResponse";
import { getOrderCantPrint } from "@/service/print-order/print-order-service";
import { useWebSocket } from "@/Context/WebSocketContext";
import { IMessage } from "@stomp/stompjs";
import { CategoryPrintPrinteesHub, getVariationsMenPrint, getVariationsPrinteesHub, ProductMenPrint } from "@/service/print-order/getSKU";
import { getAllPrinter } from "@/service/print/print-service";

const tabs = [
  { id: "Review", label: "Cần xét duyệt", icon: <Eye />},
  { id: "AwaitDesign", label: "Chờ thiết kế", icon: <History />},
  { id: "Printing", label: "Sẵn sàng in", icon: <PrinterCheck />},
];

export default function PrintOrderPage() {
  const [activeTab, setActiveTab] = useState("Review");
  const [orderReviewList, setOrderRevieList] = useState<Order[]>([])
  const [orderAwaitList, setOrderAwaitList] = useState<Order[]>([])
  const [variationsPrinteesHub, setVariationsPrinteesHub] = useState<CategoryPrintPrinteesHub[]>([])
  const [productMenPrint, setProductMenPrint] = useState<ProductMenPrint[]>([])
  const [printers, setPrinter] = useState<PrintShop[]>([]);

  const wsClient = useWebSocket(); 
  useEffect(() =>{
    const load = async () =>{
        try{
              const [responseReview, responseAwait] = await Promise.all([
                  getOrderCantPrint({ printStatus: "REVIEW" }),
                  getOrderCantPrint({ printStatus: "AWAITING" }),
              ]);
              setOrderRevieList(responseReview.result.orders);
              setOrderAwaitList(responseAwait.result.orders);
        }catch(e: any) {
            alert(e?.message || "Fail load")
        }
    }   
    load();
    loadSetup()
  },[])
  const loadSetup = async () => {
    try {
      const [dataPrinteesHub, dataMenPrint, response] = await Promise.all([
        getVariationsPrinteesHub(),
        getVariationsMenPrint(),
        getAllPrinter()
      ]);
      const printer: PrintShop[] = response?.result || [];
      setVariationsPrinteesHub(dataPrinteesHub);
      setProductMenPrint(dataMenPrint.data);
      setPrinter(printer);

      console.log(dataMenPrint);
      console.log(dataPrinteesHub);
    } catch (e: any) {
      alert(e?.message || "Fail load");
    }
  };

  // WebSocket effect
  useEffect(() => {
    const callback = (msg: IMessage) => {
      const updatedOrder: Order = JSON.parse(msg.body);
      console.log(updatedOrder)
      setOrderRevieList((prev) => {
        const exists = prev.some((o) => o.id === updatedOrder.id);
        if (exists) {
          return prev.map((o) =>
            o.id === updatedOrder.id ? { ...o, ...updatedOrder } : o
          );
        } else {
          return [updatedOrder, ...prev];
        }
      });
    };

    wsClient.subscribe("/user/queue/orders", callback);
    return () => {
      wsClient.unsubscribe("/user/queue/orders");
    };
  }, [wsClient]);
  return (
    <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex flex-col">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">In đơn hàng</h1>
      </div>

      {/* Tab Navigation */}
      <div className="mb-2">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors flex items-center ${
                    activeTab === tab.id
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
      </div>

      {/* Tab Content */}
      <div className="transition-all duration-200 ease-in-out flex-1 overflow-auto">
        {activeTab === "Review" && 
          <ReviewPrint
            variationsPrinteesHub={variationsPrinteesHub}
            productMenPrint={productMenPrint}
            printers={printers}
            setOrders={setOrderRevieList}  
            orderList={orderReviewList}
          />
        }
        {activeTab === "AwaitDesign" && 
          <AwaitDesign 
            variationsPrinteesHub={variationsPrinteesHub}
            productMenPrint={productMenPrint}
            printers={printers}
            setOrders={setOrderAwaitList}  
            orderList={orderAwaitList}
          />
          }
        {activeTab === "Printing" && <Printing/>}
      </div>
    </div>
  );
}
