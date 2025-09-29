import { ApiResponse, Design, PrintShop } from "@/service/types/ApiResponse";
import { useFetch } from "../useFetch";
import { getAllDesigns } from "@/service/design/design-service";

export function useDesigns() {
  return useFetch<ApiResponse<Design[]>>({
    fetcher: getAllDesigns,
    key: "designs"
  });
}
