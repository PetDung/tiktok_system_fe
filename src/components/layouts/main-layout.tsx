"use client";
import { useState } from "react";
import { Menu } from "./Menu";
import { menuData } from "@/components/layouts/menuData";
import { WebSocketProvider } from "@/Context/WebSocketContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <WebSocketProvider>
        <div className="flex flex-col h-screen">
        {/* HEADER */}
        <header className="h-14 bg-blue-600 text-white flex items-center px-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="mr-3 p-1 bg-blue-500 rounded hover:bg-blue-700"
          >
            {collapsed ? "➡️" : "⬅️"}
          </button>
          <h1 className="font-bold">My App</h1>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR */}
          <aside
            className={`bg-gray-800 text-white transition-all duration-300 overflow-y-auto 
            ${collapsed ? "w-16" : "w-56"}`}
          >
            <Menu items={menuData} collapsed={collapsed} />
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 p-4 overflow-y-auto bg-gray-100">{children}</main>
        </div>
      </div>
    </WebSocketProvider>
  );
}
