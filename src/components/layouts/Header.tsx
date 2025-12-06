"use client";
import { useAuth } from "@/Context/AuthContext";
import { LogOut, Settings, UserPen } from "lucide-react";
import { useState } from "react";

type HeaderProps = {
  collapsed: boolean;
    setCollapsed: (value: boolean) => void;
  isMobile: boolean;
  sidebarOpen: boolean;
};

export default function Header({ collapsed, setCollapsed, isMobile, sidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="h-14 bg-gradient-to-r from-orange-400 to-orange-700 text-white flex items-center px-4 relative z-50">
      {/* Menu Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="group mr-3 p-2 rounded-lg bg-transparen transition-all duration-200 hover:bg-black/15"
        aria-label={isMobile ? (sidebarOpen ? "Close menu" : "Open menu") : (collapsed ? "Expand sidebar" : "Collapse sidebar")}
      >
        {isMobile ? (
          // Hamburger menu for mobile
          <div className="w-5 h-5 flex flex-col justify-center items-center">
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 ${sidebarOpen ? 'rotate-45 translate-y-0.5' : ''}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 mt-1 ${sidebarOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-white transition-all duration-300 mt-1 ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
          </div>
        ) : (
          // Arrow icons for desktop
          <div className="w-5 h-5 flex items-center justify-center">
            <svg 
              className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </div>
        )}
      </button>
      {/* Brand/Title */}
      <div className="flex items-center flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold">
              <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-fill" />
            </span>
          </div>
          <div className="truncate">
            <h1 className="font-semibold text-lg leading-tight">
              Xin chào, <span className="font-bold">{user?.name || "Guest"}</span>
            </h1>
            <p className="text-xs text-blue-100 truncate">
              {user?.team || "Chưa xác định team"}
            </p>
          </div>
        </div>
      </div>

      {/* User Menu */}
      {user && (
        <div className="relative ml-4">
          <div
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-black/15 hover:bg-opacity-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {/* Avatar */}
            <div className="w-8 h-8 bg-blue-400 rounded-full flex items-center justify-center text-sm font-bold">
              {user.name?.charAt(0).toUpperCase() || "G"}
            </div>   
            <button
                  onClick={()=>handleLogout()}
                  className=" w-full px-4 py-2 text-left text-sm text-white hover:bg-red-700 transition-colors duration-150 flex items-center space-x-2"
                >
                  <LogOut />
                  <span>Đăng xuất</span>
              </button>
          </div>
          
        </div>
      )}
    </header>
  );
}