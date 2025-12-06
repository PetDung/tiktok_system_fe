import axiosClient from "@/lib/axiosClient";
import { ApiResponse, AuthError, ResponsePage, ShopResponse, ShopResponseData } from "../types/ApiResponse";
import axios from "axios";

export const getMyShop = async () => {
  try {
    const response = await axiosClient.get<ShopResponseData>("/shop/");
    if (response.data.code === 1000) {
      return response.data; // Assuming the shop data is in the 'data' field
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
};

export const getMyShopWithTotalOrder = async () => {
    try {
        const response = await axiosClient.get<ShopResponseData>("/shop/with-total-order");
        if (response.data.code === 1000) {
            return response.data; // Assuming the shop data is in the 'data' field
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
};


export const getMyShopPage = async (page : number, size : number) => {
  try {
    const response = await axiosClient.get<ApiResponse<ResponsePage<ShopResponse>>>("/shop/shop-page",{
      params: {
        size: 50,
        page: page
      }
    });
    if (response.data.code === 1000) {
      return response.data; // Assuming the shop data is in the 'data' field
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
};

type infoConnect = {
  code: string;
  userName: string;
  userShopName : string;
}

export const connectShop = async ({code, userName, userShopName} : infoConnect) =>{

  try {
    const response = await axiosClient.post<ShopResponseData>("/connect", {code, userName, userShopName});
    if (response.data.code === 1000) {
      return response.data; // Assuming the shop data is in the 'data' field
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

export const updateUserNameShop = async (id: string, userNameshop: string) =>{

  try {
    const response = await axiosClient.put<ApiResponse<ShopResponse>>(`/shop/${id}`, {userShopName: userNameshop});
    if (response.data.code === 1000) {
      return response.data; // Assuming the shop data is in the 'data' field
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

