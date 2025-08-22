import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";

class WebSocketClient {
  private static instance: WebSocketClient;
  private client: Client;
  private subscriptions: Record<string, any> = {};
  private baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  private constructor() {
    const token = localStorage.getItem("token") || "";
    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(this.baseURL + "/ws-order", null, {
          transports: ["websocket", "xhr-streaming", "xhr-polling"],
        }),
      connectHeaders: token ? { Authorization: `${token}` } : {},
      debug: (str) => console.log("STOMP: " + str),
      reconnectDelay: 5000,
    });
  }

  public static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  connect(onConnect?: () => void, onDisconnect?: () => void) {
    this.client.onConnect = () => {
      console.log("✅ WebSocket connected");
      if (onConnect) onConnect();
    };

    this.client.onDisconnect = () => {
      console.log("❌ WebSocket disconnected");
      if (onDisconnect) onDisconnect();
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client.active) {
      this.client.deactivate();
    }
  }

  subscribe(destination: string, callback: (msg: IMessage) => void) {
    if (this.client.connected) {
      this.subscriptions[destination] = this.client.subscribe(
        destination,
        callback
      );
    } else {
      console.warn("⚠️ Client not connected yet!");
    }
  }

  unsubscribe(destination: string) {
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
      delete this.subscriptions[destination];
    }
  }

  send(destination: string, body: any) {
    if (this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    }
  }
}

export default WebSocketClient;
