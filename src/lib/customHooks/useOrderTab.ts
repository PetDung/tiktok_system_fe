import { useState, useCallback } from 'react';
import { Order } from '@/service/types/ApiResponse';
import { getOrderCantPrint } from '@/service/print-order/print-order-service';

export interface OrderTabState {
  orders: Order[];
  isLoading: boolean;
  page: number;
  hasMore: boolean;
}

export interface OrderTabActions {
  loadOrders: (pageInput?: number, append?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  refreshOrders: () => Promise<void>;
  upsertOrder: (newOrder: Order) => void;
  removeOrder: (orderId: string) => void;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export function useOrderTab(printStatuses: string[], sortBy: 'create_time' | 'create_print_time' = 'create_time') {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const loadOrders = useCallback(async (pageInput = 0, append = false) => {
    try {
      const response = await getOrderCantPrint({ 
        printStatus: printStatuses, 
        page: pageInput 
      });
      const newOrders: Order[] = response.result.data;
      
      if (!append) {
        setOrders(newOrders);
      } else {
        setOrders((prev) => {
          const map = new Map<string, Order>();
          [...prev, ...newOrders].forEach((o) => map.set(o.id, o));
          return Array.from(map.values()).sort((a, b) => 
            sortBy === 'create_print_time' 
              ? b.create_print_time - a.create_print_time 
              : b.create_time - a.create_time
          );
        });
      }
      
      setPage(response.result.current_page ?? 0);
      const isLast = response?.result?.last ?? true;
      setHasMore(!isLast);
    } catch (e: any) {
      console.error(`Error loading orders for status ${printStatuses.join(',')}:`, e);
      alert(e?.message || `Fail load orders for status ${printStatuses.join(',')}`);
    } finally {
      setIsLoading(false);
    }
  }, [printStatuses, sortBy]);

  const loadMore = useCallback(async () => {
    if (!hasMore) return;
    await loadOrders(page + 1, true);
  }, [hasMore, page, loadOrders]);

  const refreshOrders = useCallback(async () => {
    setIsLoading(true);
    await loadOrders();
  }, [loadOrders]);

  const upsertOrder = useCallback((newOrder: Order) => {
    setOrders(prevOrders => {
      const exists = prevOrders.some(o => o.id === newOrder.id);
      let updated = exists
        ? prevOrders.map(o => (o.id === newOrder.id ? newOrder : o))
        : [...prevOrders, newOrder];
      return updated.sort((a, b) => 
        sortBy === 'create_print_time' 
          ? b.create_print_time - a.create_print_time 
          : b.create_time - a.create_time
      );
    });
  }, [sortBy]);

  const removeOrder = useCallback((orderId: string) => {
    setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
  }, []);

  return {
    state: { orders, isLoading, page, hasMore },
    actions: { 
      loadOrders, 
      loadMore, 
      refreshOrders, 
      upsertOrder, 
      removeOrder, 
      setOrders 
    }
  };
}
