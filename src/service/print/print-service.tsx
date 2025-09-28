import axiosClient from "@/lib/axiosClient";
import { ApiResponse, AuthError, PrintShop } from "../types/ApiResponse";
import axios from "axios";
import { CreatePrintShopDto } from "@/components/pages/Design/_components/PrintShopForm";


export const getAllPrinter = async () => {
  try {
    const response = await axiosClient.get<ApiResponse<PrintShop[]>>("/printer");
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


export const craterPrinter = async (p : CreatePrintShopDto) => {
  try {
    const response = await axiosClient.post<ApiResponse<PrintShop>>("/printer", p);
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


export const deletePrinter = async (id :string) => {
  try {
    const response = await axiosClient.delete<ApiResponse<string>>(`/printer/${id}`);
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

export const updatePrinter = async (id :string, p : CreatePrintShopDto) => {
  try {
    const response = await axiosClient.put<ApiResponse<PrintShop>>(`/printer/${id}`, p);
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