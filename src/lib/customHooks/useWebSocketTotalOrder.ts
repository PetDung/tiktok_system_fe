import { useEffect, useRef } from 'react';
import { useWebSocket } from '@/Context/WebSocketContext';
import { IMessage } from '@stomp/stompjs';
import { Order } from '@/service/types/ApiResponse';
import { Message } from '@/service/types/websocketMessageType';
import {TotalOrder} from "@/components/pages/Order/OrderInShopPage/SelectShopView";


interface WebSocketOrderTotalProps {
    action: (totalOrder : TotalOrder) => void;
}

export function useWebSocketOrderTotal({action}: WebSocketOrderTotalProps) {
  const wsClient = useWebSocket();

    const actionsRef = useRef<WebSocketOrderTotalProps>({action});

    useEffect(() => {
        actionsRef.current = {action};
    }, [action]);


    useEffect(() => {
    const handleWebSocketMessage = (msg: IMessage) => {
      try {
        const updated: Message<TotalOrder> = JSON.parse(msg.body);
        if(updated.event === 'RETURN_TOTAL_ORDER') {
            actionsRef.current.action(updated.data)
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error, msg);
      }
    };

    // Subscribe once
    wsClient.subscribe('/user/queue/total-order', handleWebSocketMessage);

    // Cleanup on unmount
    return () => {
      wsClient.unsubscribe('/user/queue/total-order');
    };
  }, [wsClient]);
}
