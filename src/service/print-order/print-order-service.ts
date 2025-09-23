import axiosClient from "@/lib/axiosClient";
import { ApiResponse, AuthError, OrderListResponse } from "../types/ApiResponse";
import axios from "axios";


export type GetOrderParam = {
    shopId?: string;
    nextPageToken?: string;
    status? : string;
    shipping? : string;
    orderId? : string;
    page?: number;
    shopIds?: string[];
}

export const getOrderCantPrint = async (param : GetOrderParam) => {
  try {
    const response = await axiosClient.get<OrderListResponse>(
      `/print-order/order`,
      {
        params: {
          page : param.page,
          shop_id: param.shopId,
          order_id : param.orderId,
          shop_ids: param.shopIds?.join(',') || ''
        }
      }
    );
    if (response.data.code === 1000) {
      return response.data;
    }

    throw new AuthError(500, "Invalid response from server");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as ApiResponse<any>;
      throw new AuthError(
        serverError.code || 500,
        serverError.message || "Login failed. Please try again."
      );
    }
    throw new AuthError(500, "An unexpected error occurred. Please try again.");
  }
}