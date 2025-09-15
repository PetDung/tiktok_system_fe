"use client";

import { getSetting } from "@/service/setting/setting-service";
import { Setting } from "@/service/types/ApiResponse";
import { useEffect, useRef, useState } from "react";

export default function SettingPage() {
  const [data, setData] = useState<Setting | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [driverId, setDriverId] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSetting().then((res) => {
      setData(res.result);
      setDriverId(res.result.driverId || "");
    });
  }, []);

  const handleCopy = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSave = () => {
    console.log("Saved driverId:", driverId);
    // TODO: call API save
  };

  if (!data) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="mx-auto mt-10 p-6 bg-white rounded-2xl shadow-md max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Setting</h1>

      {/* Connect URL */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border">
        <div>
          <p className="text-gray-600 text-sm">Connect URL</p>
          <p className="font-mono text-blue-700">{data?.connectUrl || ""}</p>
        </div>
        <button
          onClick={() => handleCopy(data.connectUrl, "connect_url")}
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          {copied === "connect_url" ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Order Sheet ID */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg border">
        <div>
          <p className="text-gray-600 text-sm">Order Sheet</p>
          <p className="font-mono text-blue-700">{`https://docs.google.com/spreadsheets/d/${data.orderSheetId}`}</p>
        </div>
        <button
          onClick={() =>
            handleCopy(
              `https://docs.google.com/spreadsheets/d/${data.orderSheetId}`,
              "order_sheet_id"
            )
          }
          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          {copied === "order_sheet_id" ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Driver ID Input */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <p className="text-gray-600 text-sm mb-2">Driver ID</p>
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
            placeholder="Enter driver ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                       transition duration-200"
          />
          <button
            onClick={handleSave}
            className="ml-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
