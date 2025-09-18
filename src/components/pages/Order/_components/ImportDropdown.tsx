"use client"
import { useRef, useState } from "react";
import { ChevronDown, Download, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { PrintShop } from "@/service/types/ApiResponse";
import { importUpdateOrder } from "@/service/order/updateOrderCase";
import LoadingOverlay from "@/components/UI/LoadingOverlay";

type Props = {
  printers: PrintShop[];
};

export default function ImportDropdown({ printers }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<string[]>([]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
    setOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const reader = new FileReader();

    reader.onload = async (event: ProgressEvent<FileReader>) => {
      try {
        const arrayBuffer = event.target?.result;
        if (!arrayBuffer) return;

        const data = new Uint8Array(arrayBuffer as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        console.log("Excel data:", jsonData);

        const response = await importUpdateOrder({ data: jsonData });
        console.log(response);

        const result = response.result;

        if (result && Object.keys(result).length > 0) {
          const messages: string[] = [];
          Object.entries(result).forEach(([row, errors]) => {
            const errorList = Array.isArray(errors) ? errors : [];
            messages.push(`Row ${+row + 1}: ${errorList.join(", ")}`);
          });

          setModalTitle("Xứ lý thành công một số dòng lỗi");
          setModalContent(messages);
          setModalOpen(true);
        } else {
          setModalTitle("Thành công");
          setModalContent(["Xử lý file thành công!"]);
          setModalOpen(true);
        }
      } catch (error) {
        console.error("Error parsing Excel:", error);
        setModalTitle("Lỗi");
        setModalContent(["Có lỗi khi đọc file Excel"]);
        setModalOpen(true);
      } finally {
        setUploading(false);
        if (e.target) e.target.value = ""; // reset file input
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleDownloadTemplate = () => {
    // Sheet Template
    const templateHeader = [["orderId", "cost", "printerId"]];
    const wsTemplate = XLSX.utils.aoa_to_sheet(templateHeader);

    wsTemplate["!cols"] = [
      { wch: 25 },
      { wch: 12 },
      { wch: 15 },
    ];

    for (let i = 2; i <= 100; i++) {
      const orderCell = "A" + i;
      if (!wsTemplate[orderCell]) wsTemplate[orderCell] = { t: "s", v: "" };
      wsTemplate[orderCell].z = "@";

      const costCell = "B" + i;
      if (!wsTemplate[costCell]) wsTemplate[costCell] = { t: "n", v: null };
      wsTemplate[costCell].z = "0.00";

      const printerCell = "C" + i;
      if (!wsTemplate[printerCell]) wsTemplate[printerCell] = { t: "s", v: "" };
      wsTemplate[printerCell].z = "@";
    }

    // Sheet Printers
    let wsPrinters;
    if (printers.length > 0) {
      wsPrinters = XLSX.utils.json_to_sheet(printers, {
        header: Object.keys(printers[0]),
      });
    } else {
      wsPrinters = XLSX.utils.aoa_to_sheet([["No printer data"]]);
    }
    // Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsTemplate, "Template");
    XLSX.utils.book_append_sheet(wb, wsPrinters, "Printers");

    XLSX.writeFile(wb, "order-cost-template.xlsx");
  };

  return (
    <div className="relative inline-block text-left">
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border transition bg-blue-700 text-white border-gray-300"
      >
        Nhập cost
        <ChevronDown className="ml-2 h-4 w-4" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <button
            onClick={handleDownloadTemplate}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
          >
            <Download /> Tải template
          </button>
          <button
            onClick={handleUploadClick}
            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Upload /> Import file
          </button>
        </div>
      )}

      {/* File Input */}
      <input
        type="file"
        accept=".xlsx,.xls"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Loading Overlay */}
      <LoadingOverlay show={uploading} />

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg w-96 max-w-full p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{modalTitle}</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto text-sm text-gray-700">
              {modalContent.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            <div className="mt-4 text-right">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
