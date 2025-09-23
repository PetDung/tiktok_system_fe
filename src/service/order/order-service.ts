
import axios from 'axios';
import axiosClient from '@/lib/axiosClient';
import { ApiResponse, AuthError, Order, OrderListResponse } from '../types/ApiResponse';

export type GetOrderParam = {
    shopId?: string;
    nextPageToken?: string;
    status? : string;
    shipping? : string;
    orderId? : string;
    page?: number;
    shopIds?: string[];
}



export const getOrderInShop = async (param : GetOrderParam) => {
  try {
    const response = await axiosClient.post<OrderListResponse>(
      `/order/list/${param.shopId}`,
      {},
      {
        params: {
          next_page_token: param.nextPageToken,
          order_status : param.status,
          shipping_type: param.shipping,
          order_id : param.orderId,
        },
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

export const getOrderAllShop = async (param : GetOrderParam) => {
  try {
    const response = await axiosClient.get<OrderListResponse>(
      `/order-sync`,
      {
        params: {
          page : param.page,
          shop_id: param.shopId,
          order_status : param.status,
          shipping_type: param.shipping,
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


export const updatePrinterOrder = async (orderId: string, printerId : string | null) => {
  try {
    const response = await axiosClient.post<ApiResponse<Order>>(
      `/order/printer/${orderId}/${printerId}`,
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

export const updateCostOrder = async (orderId: string, costNumber : number) => {
  try {
    const response = await axiosClient.post<ApiResponse<Order>>(
      `/order/cost/${orderId}`, {}, {
        params:{
          cost: costNumber
        }
      },
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



export const exportOrderSelected = async (param: { orderIds: string[]}) => {
  try {
    const response = await axiosClient.get<ApiResponse<any>>(
      `/order/export`,
      {
        params: {
          orderIds: param.orderIds.join(',')
        },
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
