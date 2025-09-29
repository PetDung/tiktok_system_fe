"use client";
import { useState, useEffect } from "react";
import { Menu } from "./Menu";
import { menuData } from "@/components/layouts/menuData";
import { WebSocketProvider } from "@/Context/WebSocketContext";
import { AuthProvider } from "@/Context/AuthContext";
import Header from "./Header";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(false);
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Handle sidebar toggle for mobile/desktop
  const handleSidebarToggle = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  // Close mobile sidebar when clicking outside
  const closeMobileSidebar = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <AuthProvider>
      <WebSocketProvider>
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
          {/* HEADER */}
          <Header 
            collapsed={collapsed} 
            setCollapsed={handleSidebarToggle}
            isMobile={isMobile}
            sidebarOpen={sidebarOpen}
          />

          <div className="flex flex-1 relative overflow-hidden">
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                onClick={closeMobileSidebar}
              />
            )}

            {/* SIDEBAR */}
            <aside
              className={`
                bg-gradient-to-b from-gray-800 to-gray-900 text-white 
                transition-all duration-300 ease-in-out
                ${isMobile 
                  ? `fixed left-0 top-14 bottom-0 z-50 w-64 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` 
                  : `relative ${collapsed ? "w-16" : "w-72"}`
                }
                shadow-xl border-r border-gray-700
              `}
            >
              <div
                className="
                    h-full overflow-auto
                    scrollbar-thin
                    scrollbar-thumb-gray-400 hover:scrollbar-thumb-gray-500
                    scrollbar-track-transparent
                    scrollbar-thumb-rounded-full
                  "
                >
                <Menu
                  items={menuData}
                  collapsed={!isMobile && collapsed}
                  onItemClick={() => isMobile && setSidebarOpen(false)}
                />
              </div>

            </aside>

            {/* MAIN CONTENT */}
            <main className={`flex-1 overflow-y-auto bg-gray-50 transition-all duration-300 ease-in-out${!isMobile && !collapsed ? 'ml-0' : ''}`}>
              <div className="min-h-full">
                <div className="mx-auto">
                  {children}
                </div>
              </div>
            </main>
          </div>
        </div>
      </WebSocketProvider>
    </AuthProvider>
  );
}