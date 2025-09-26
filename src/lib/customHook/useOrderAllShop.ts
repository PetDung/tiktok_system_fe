import { getOrderAllShop, GetOrderParam } from "@/service/order/order-service";
import {OrderListResponse } from "@/service/types/ApiResponse";
import { useFetch } from "../useFetch";

export function useOrderAllShop(param: GetOrderParam) {
  return useFetch<OrderListResponse>({
    fetcher: getOrderAllShop,
    key: "orders-all-shop",
    param,
  });
}
