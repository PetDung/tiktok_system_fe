import { useEffect, useRef } from 'react';
import { useWebSocket } from '@/Context/WebSocketContext';
import { IMessage } from '@stomp/stompjs';
import { Order } from '@/service/types/ApiResponse';
import { Message } from '@/service/types/websocketMessageType';

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

  // Use ref to hold stable reference to actions
  const actionsRef = useRef<WebSocketOrderUpdatesProps>({
    reviewActions,
    awaitActions,
    printingActions,
    successActions,
    printRequestActions,
  });

  // Always update ref with latest actions
  useEffect(() => {
    actionsRef.current = { reviewActions, awaitActions, printingActions, successActions, printRequestActions };
  }, [reviewActions, awaitActions, printingActions, successActions, printRequestActions]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    const handleWebSocketMessage = (msg: IMessage) => {
      try {
        const updated: Message<Order> = JSON.parse(msg.body);

        if (updated.event === 'UPDATE') {
          const newOrder = updated.data;
          console.log('WebSocket order update:', newOrder);

          switch (newOrder.print_status) {
            case 'REVIEW':
            case 'PRINT_REQUEST_FAIL':
              actionsRef.current.reviewActions.upsertOrder(newOrder);
              break;
            case 'AWAITING':
              actionsRef.current.awaitActions.upsertOrder(newOrder);
              break;
            case 'PRINTED':
              actionsRef.current.printingActions.upsertOrder(newOrder);
              break;
            case 'PRINT_REQUEST_SUCCESS':
            case 'PRINT_CANCEL':
            case 'USER_PRINT':
              actionsRef.current.successActions.upsertOrder(newOrder);
              actionsRef.current.printRequestActions.removeOrder(newOrder.id);
              break;
            case 'PRINT_REQUEST':
              actionsRef.current.printRequestActions.upsertOrder(newOrder);
              break;
            default:
              console.warn('Unknown print status:', newOrder.print_status);
          }
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error, msg);
      }
    };

    // Subscribe once
    wsClient.subscribe('/user/queue/orders', handleWebSocketMessage);

    // Cleanup on unmount
    return () => {
      wsClient.unsubscribe('/user/queue/orders');
    };
  }, [wsClient]); // dependency chỉ chứa wsClient → subscribe 1 lần
}
