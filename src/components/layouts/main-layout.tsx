"use client";
import { useState } from "react";
import { Menu } from "./Menu";
import { menuData } from "@/components/layouts/menuData";
import { WebSocketProvider } from "@/Context/WebSocketContext";
import { AuthProvider, useAuth } from "@/Context/AuthContext";
import Header from "./Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <AuthProvider>
      <WebSocketProvider>
        <div className="flex flex-col h-screen">
          {/* HEADER */}
          <Header collapsed={collapsed} setCollapsed={setCollapsed} />

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
    </AuthProvider>
    
  );
}
