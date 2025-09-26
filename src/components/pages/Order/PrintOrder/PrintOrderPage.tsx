"use client"
import { Eye, History, PrinterCheck } from "lucide-react";
import { useState } from "react";
import ReviewPrint from "./_components/ReviewPrint";
import AwaitDesign from "./_components/AwaitDesign";
import Printing from "./_components/Printing";
import { ApiResponse, PrintShop } from "@/service/types/ApiResponse";
import { getVariationsMenPrint, getVariationsPrinteesHub, MenPrintData, ProductMenPrint, CategoryPrintPrinteesHub } from "@/service/print-order/getSKU";
import { getAllPrinter } from "@/service/print/print-service";
import { useFetch } from "@/lib/useFetch";
import { usePrinters } from "@/lib/customHook/usePrinters";

const tabs = [
  { id: "Review", label: "Cần xét duyệt", icon: <Eye /> },
  { id: "AwaitDesign", label: "Chờ thiết kế", icon: <History /> },
  { id: "Printing", label: "Sẵn sàng in", icon: <PrinterCheck /> },
];

export default function PrintOrderPage() {
  const [activeTab, setActiveTab] = useState("Review");

  const { data: printersResponse } = usePrinters();

  const { data: variationsPrinteesHubResponse } = useFetch<CategoryPrintPrinteesHub[]>({
    fetcher: getVariationsPrinteesHub,
    key: "variations-printeesHub"
  });

  const { data: productMenPrintResponse } = useFetch<MenPrintData<ProductMenPrint>>({
    fetcher: getVariationsMenPrint,
    key: "variations-menPrint"
  });

  const printers: PrintShop[] = printersResponse?.result ?? [];
  const variationsPrinteesHub: CategoryPrintPrinteesHub[] = variationsPrinteesHubResponse ?? [];
  const productMenPrint: ProductMenPrint[] = productMenPrintResponse?.data ?? [];

  return (
    <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex flex-col">
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">In đơn hàng</h1>
      </div>

      {/* Tab Navigation */}
      <div className="mb-2 border-b border-gray-200">
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

      {/* Tab Content */}
      <div className="transition-all duration-200 ease-in-out flex-1 overflow-auto">
        {activeTab === "Review" && (
          <ReviewPrint
            variationsPrinteesHub={variationsPrinteesHub}
            productMenPrint={productMenPrint}
            printers={printers}
          />
        )}
        {activeTab === "AwaitDesign" && (
          <AwaitDesign
            variationsPrinteesHub={variationsPrinteesHub}
            productMenPrint={productMenPrint}
            printers={printers}
          />
        )}
        {activeTab === "Printing" && <Printing />}
      </div>
    </div>
  );
}
