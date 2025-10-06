import axiosClient from "@/lib/axiosClient";
import { ProductCursorPageResponse } from "../types/ApiResponse_v2";
import { ApiResponse, AuthError } from "../types/ApiResponse";
import axios from "axios";

export type GetProductParam = {
    startTime?: number | null;
    endTime? : number | null ;
    nextCursor? : string | null;
    productId? : string | null;
}



export async function getProductActiveCursor(param: GetProductParam) {
    try {
        const response = await axiosClient.get<ProductCursorPageResponse>("/product/active/next-page",
                            {
                                params :{
                                    start_time : param.startTime,
                                    end_time : param.endTime,
                                    next_cursor : param.nextCursor,
                                    product_id : param.productId
                                }
                            }
                        );
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
