import axiosClient from "@/lib/axiosClient";
import { ApiResponse, AuthError, LabelRespone } from "../types/ApiResponse";
import axios from "axios";

type param  = {
    orderId: string;
    shopId?: string;
}


export const viewLabel = async (param : param) => {
  try {
    const response = await axiosClient.get<LabelRespone>(
      `/shipping/label`,
      {
        params: {
          shop_id: param.shopId,
          order_id : param.orderId,
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

export const buyLabel = async (param : param) => {
  try {
    const response = await axiosClient.get<LabelRespone>(
      `/label/buy`,
      {
        params: {
          shop_id: param.shopId,
          order_id : param.orderId,
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