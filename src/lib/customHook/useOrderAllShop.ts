import { getOrderAllShop, GetOrderParam } from "@/service/order/order-service";
import {Order, OrderListResponse } from "@/service/types/ApiResponse";
import { useFetch } from "../useFetch";
import { mutate } from "swr";
import { cache } from "swr/_internal";

export function useOrderAllShop(param: GetOrderParam) {
  return useFetch<OrderListResponse>({
    fetcher: getOrderAllShop,
    key: "orders-all-shop",
    param,
  });
}
export function updateOrderInAllOrdersCache(orderId: string, newOrder: Order) {
  // Lấy tất cả key trong cache
  const allKeys = Array.from(cache.keys());

  // Lọc những key thuộc 'orders-all-shop'
  const orderKeys = allKeys.filter(key =>
    (typeof key === 'string' && key.includes('orders-all-shop')) ||
    (Array.isArray(key) && key[0]?.includes('orders-all-shop'))
  );

  // Mutate từng cache key
  orderKeys.forEach(k => {
    mutate(k, (cachedData: any) => {
      if (!cachedData) return cachedData;

      // Xử lý infinite scroll (multi-page)
      if (Array.isArray(cachedData.pages)) {
        const updatedPages = cachedData.pages.map((page: any) => ({
          ...page,
          result: {
            ...page.result,
            data: page.result.data.map((o: Order) =>
              o.id === orderId ? newOrder : o
            )
          }
        }));
        return { ...cachedData, pages: updatedPages };
      }

      // Xử lý single page
      if (cachedData.result?.data) {
        const updatedData = cachedData.result.data.map((o: Order) =>
          o.id === orderId ? newOrder : o
        );
        return { ...cachedData, result: { ...cachedData.result, data: updatedData } };
      }

      return cachedData;
    }, false);
  });
}

export function addOrderToAllOrdersCache(newOrder: Order) {
  const allKeys = Array.from(cache.keys());
  const orderKeys = allKeys.filter(
    key =>
      (typeof key === "string" && key.includes("orders-all-shop")) ||
      (Array.isArray(key) && key[0]?.includes("orders-all-shop"))
  );

  orderKeys.forEach(k => {
    mutate(k, (cachedData: any) => {
      if (!cachedData) return cachedData;

      // Infinite scroll
      if (Array.isArray(cachedData.pages)) {
        const updatedPages = cachedData.pages.map((page: any, i: number) => {
          if (!page?.result?.data) return page;

          // Thêm mới chỉ vào page đầu tiên hoặc tuỳ logic của bạn
          if (i === 0) {
            return {
              ...page,
              result: {
                ...page.result,
                data: [newOrder, ...page.result.data],
              },
            };
          }
          return page;
        });
        return { ...cachedData, pages: updatedPages };
      }

      // Single page
      if (cachedData.result?.data) {
        return {
          ...cachedData,
          result: {
            ...cachedData.result,
            data: [newOrder, ...cachedData.result.data],
          },
        };
      }

      return cachedData;
    }, false);
  });
}

export function removeOrderFromAllOrdersCache(orderId: string) {
  const allKeys = Array.from(cache.keys());
  const orderKeys = allKeys.filter(
    key =>
      (typeof key === "string" && key.includes("orders-all-shop")) ||
      (Array.isArray(key) && key[0]?.includes("orders-all-shop"))
  );

  orderKeys.forEach(k => {
    mutate(k, (cachedData: any) => {
      if (!cachedData) return cachedData;

      // Infinite scroll
      if (Array.isArray(cachedData.pages)) {
        const updatedPages = cachedData.pages.map((page: any) => {
          if (!page?.result?.data) return page;
          return {
            ...page,
            result: {
              ...page.result,
              data: page.result.data.filter((o: Order) => o.id !== orderId),
            },
          };
        });
        return { ...cachedData, pages: updatedPages };
      }

      // Single page
      if (cachedData.result?.data) {
        return {
          ...cachedData,
          result: {
            ...cachedData.result,
            data: cachedData.result.data.filter((o: Order) => o.id !== orderId),
          },
        };
      }

      return cachedData;
    }, false);
  });
}

