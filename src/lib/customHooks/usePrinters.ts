import { ApiResponse, PrintShop } from "@/service/types/ApiResponse";
import { useFetch } from "../useFetch";
import { getAllPrinter } from "@/service/print/print-service";

export function usePrinters() {
  return useFetch<ApiResponse<PrintShop[]>>({
    fetcher: getAllPrinter,
    key: "printer"
  });
}
