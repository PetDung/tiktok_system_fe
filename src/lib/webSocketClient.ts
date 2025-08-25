import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

export interface PendingSubscription {
  destination: string;
  callback: (msg: IMessage) => void;
}

class WebSocketClient {
  private static instance: WebSocketClient;

  private client!: Client; // dùng definite assignment assertion
  private subscriptions: Record<string, StompSubscription> = {};
  private pendingSubscriptions: PendingSubscription[] = [];
  private baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  private constructor() {
    this.initClient();
  }

  /** Khởi tạo STOMP client */
  private initClient() {
  
    this.client = new Client({
      webSocketFactory: () =>
        new SockJS(this.baseURL + "/ws-order", undefined, {
          transports: ["websocket", "xhr-streaming", "xhr-polling"],
        }),
      debug: (str) => console.log("STOMP: " + str),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    this.client.onConnect = () => {
      console.log("✅ WebSocket connected");

      // đăng ký các subscription đang chờ
      this.pendingSubscriptions.forEach((sub) => {
        if (!this.subscriptions[sub.destination]) {
          this.subscriptions[sub.destination] = this.client.subscribe(
            sub.destination,
            sub.callback
          );
          console.log(`📌 Subscribed to pending topic: ${sub.destination}`);
        }
      });
      this.pendingSubscriptions = [];
    };

    this.client.onStompError = (frame) => {
      console.error("STOMP error:", frame.headers["message"], frame.body);
    };

    this.client.onDisconnect = () => {
      console.log("❌ WebSocket disconnected");
    };
  }

  /** Lấy instance singleton */
  public static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  /** Kết nối WebSocket */
  public connect(options?: { token?: string }) {
    const token = options?.token || "";
    this.client.connectHeaders = token ? { Authorization: token } : {};
    if (!this.client.active) {
      this.client.activate();
    }
  }

  /** Ngắt kết nối toàn app - chỉ gọi khi logout hoặc unload app */
  public disconnect(options?: { token?: string }) {
    if (this.client.active) {
      this.client.deactivate();
    }
  }

  /** Subscribe topic, tự động queue nếu chưa connect */
  public subscribe(destination: string, callback: (msg: IMessage) => void) {
    if (this.client.connected) {
      if (!this.subscriptions[destination]) {
        this.subscriptions[destination] = this.client.subscribe(destination, callback);
      }
    } else {
      this.pendingSubscriptions.push({ destination, callback });
    }
  }

  /** Hủy subscription */
  public unsubscribe(destination: string) {
    if (this.subscriptions[destination]) {
      this.subscriptions[destination].unsubscribe();
      delete this.subscriptions[destination];
    }
    // loại bỏ khỏi pending nếu chưa subscribe
    this.pendingSubscriptions = this.pendingSubscriptions.filter(
      (sub) => sub.destination !== destination
    );
  }

  /** Gửi message đến topic */
  public send(destination: string, body: any) {
    if (this.client.connected) {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn("⚠️ Cannot send message, client not connected");
    }
  }

  /** Refresh token nếu user login/logout */
  public refreshToken(newToken: string) {
    if (this.client.active) {
      this.client.disconnectHeaders = { Authorization: newToken };
      console.log("✅ STOMP token refreshed");
    }
  }
}

export default WebSocketClient;
