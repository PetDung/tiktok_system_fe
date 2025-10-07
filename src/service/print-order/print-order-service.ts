import axiosClient from "@/lib/axiosClient";
import { ApiResponse, AuthError, Order, OrderListResponse } from "../types/ApiResponse";
import axios from "axios";
import { PrintShippMethod } from "../types/PrintOrder";


export type GetOrderParam = {
    shopId?: string;
    nextPageToken?: string;
    status? : string;
    shipping? : string;
    orderId? : string;
    page?: number;
    shopIds?: string[];
    printStatus? : string[]
}

export type SynchronizePrintOrderParam = {
  orderId : string;
  orderFulfill : string;
}

export const getPrintShippingMethod = async () => {
  try {
    const response = await axiosClient.get<ApiResponse<PrintShippMethod[]>>(
      `/print-order/print-shipping-method`,
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


export const getOrderCantPrint = async (param : GetOrderParam) => {
  try {
    const response = await axiosClient.get<OrderListResponse>(
      `/print-order/order`,
      {
        params: {
          page : param.page,
          shop_id: param.shopId,
          order_id : param.orderId,
          shop_ids: param.shopIds?.join(',') || '',
          print_status : param.printStatus?.join(',') || '',
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

export const synchronizePrintOrder = async (param : SynchronizePrintOrderParam) => {
   try {
    const response = await axiosClient.put<ApiResponse<Order>>(
      `/print-order/synchronize`,param
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