"use client"
import { Eye, History, PrinterCheck } from "lucide-react";
import { useEffect, useState } from "react";
import ReviewPrint from "./_components/ReviewPrint";
import AwaitDesign from "./_components/AwaitDesign";
import Printing from "./_components/Printing";
import { Order } from "@/service/types/ApiResponse";
import { getOrderCantPrint } from "@/service/print-order/print-order-service";

const tabs = [
  { id: "Review", label: "Cần xét duyệt", icon: <Eye />},
  { id: "AwaitDesign", label: "Chờ thiết kế", icon: <History />},
  { id: "Printing", label: "Sẵn sàng in", icon: <PrinterCheck />},
];

export default function PrintOrderPage() {
  const [activeTab, setActiveTab] = useState("Review");
  const [orderReviewList, setOrderRevieList] = useState<Order[]>([])
  useEffect(() =>{

    const load = async () =>{
        try{
            const response = await getOrderCantPrint({}); 
            setOrderRevieList(response.result.orders);
        }catch(e: any) {
            alert(e?.message || "Fail load")
        }
    }   
    load();
  },[])


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
        {activeTab === "Review" && <ReviewPrint orderList={orderReviewList}/>}
        {activeTab === "AwaitDesign" && <AwaitDesign/>}
        {activeTab === "Printing" && <Printing/>}
      </div>
    </div>
  );
}
