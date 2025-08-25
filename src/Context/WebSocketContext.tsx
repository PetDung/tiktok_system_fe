"use client";

import WebSocketClient from "@/lib/webSocketClient";
import React, { createContext, useContext, useEffect } from "react";

const WebSocketContext = createContext<WebSocketClient | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
  const wsClient = WebSocketClient.getInstance();

  useEffect(() => {
    const token = localStorage.getItem("token") || "";
    wsClient.connect({ token });
  }, []);

  return <WebSocketContext.Provider value={wsClient}>{children}</WebSocketContext.Provider>;
};

// Hook tiện lợi để lấy instance WebSocket
export const useWebSocket = (): WebSocketClient => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};
