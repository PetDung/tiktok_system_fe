import axiosClient from "@/lib/axiosClient";
import { ApiResponse, AuthError, RefundResponse } from "../types/ApiResponse";
import axios from "axios";


export interface FetchReturnParams {
  page?: number;
  size?: number;
  keyword?: string;
}


export const getRefundAllShop = async (
  param: FetchReturnParams
): Promise<ApiResponse<RefundResponse>> => {
  try {
    const response = await axiosClient.get<ApiResponse<RefundResponse>>(
      `/returns`,
      {
        params: {
          page: param.page,
          keyword: param.keyword,
          size: 15
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
        serverError?.code || 500,
        serverError?.message || "Login failed. Please try again."
      );
    }
    throw new AuthError(500, "An unexpected error occurred. Please try again.");
  }
};