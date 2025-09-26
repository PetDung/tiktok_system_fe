import { ShopResponseData } from "@/service/types/ApiResponse";
import { useFetch } from "../useFetch";
import { getMyShop } from "@/service/shop/shop-service";

export function useShops() {
  return useFetch<ShopResponseData>({
    fetcher: getMyShop,
    key: "shop"
  });
}
