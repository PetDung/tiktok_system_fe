import axiosClient from "@/lib/axiosClient";
import { ApiResponse, AuthError, Setting } from "../types/ApiResponse";
import axios from "axios";


export const getSetting = async () => {
  try {
    const response = await axiosClient.get<ApiResponse<Setting>>("/setting");
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
