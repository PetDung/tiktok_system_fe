import { useEffect, useCallback } from 'react';
import { useWebSocket } from '@/Context/WebSocketContext';
import { IMessage } from '@stomp/stompjs';
import { Message, Order } from '@/service/types/ApiResponse';

interface OrderTabActions {
  upsertOrder: (newOrder: Order) => void;
  removeOrder: (orderId: string) => void;
}

interface WebSocketOrderUpdatesProps {
  reviewActions: OrderTabActions;
  awaitActions: OrderTabActions;
  printingActions: OrderTabActions;
  successActions: OrderTabActions;
  printRequestActions: OrderTabActions;
}

export function useWebSocketOrderUpdates({
  reviewActions,
  awaitActions,
  printingActions,
  successActions,
  printRequestActions,
}: WebSocketOrderUpdatesProps) {
  const wsClient = useWebSocket();

  const handleWebSocketMessage = useCallback((msg: IMessage) => {
    const updated: Message<Order> = JSON.parse(msg.body);
    if (updated.event === "UPDATE") {
      const newOrder = updated.data;
      console.log('WebSocket order update:', newOrder);

      switch (newOrder.print_status) {
        case "REVIEW":
        case "PRINT_REQUEST_FAIL":
          reviewActions.upsertOrder(newOrder);
          break;
        case "AWAITING":
          awaitActions.upsertOrder(newOrder);
          break;
        case "PRINTED":
          printingActions.upsertOrder(newOrder);
          break;
        case "PRINT_REQUEST_SUCCESS":
        case "PRINT_CANCEL":
        case "USER_PRINT":
          successActions.upsertOrder(newOrder);
          // Remove from print request list when moving to success
          printRequestActions.removeOrder(newOrder.id);
          break;
        case "PRINT_REQUEST":
          printRequestActions.upsertOrder(newOrder);
          break;
        default:
          console.warn('Unknown print status:', newOrder.print_status);
      }
    }
  }, [reviewActions, awaitActions, printingActions, successActions, printRequestActions]);

  useEffect(() => {
    wsClient.subscribe("/user/queue/orders", handleWebSocketMessage);
    return () => {
      wsClient.unsubscribe("/user/queue/orders");
    };
  }, [wsClient, handleWebSocketMessage]);
}
