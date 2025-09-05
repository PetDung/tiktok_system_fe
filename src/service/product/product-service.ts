import axiosClient from "@/lib/axiosClient";
import { ApiResponse, AuthError, Product, ProductApiResponse, ProductDetailsResponse, ProductReportApiResponse, ProductReportResponse } from "../types/ApiResponse";
import axios from "axios";



export type GetOrderParam = {
    status? : string;
    startTime?: number | null;
    endTime? : number | null ;
    keyword? : string | null ; 
    page :  number | null;
    filter? : string | null;
    pageSize? : number | null;
}

export type GetProductSaleParam = {
    startTime?: number | null;
    endTime? : number | null ;
}


export async function getProdcDetails ({shopId, productId} :  {shopId : string, productId: string}){
     try {
        const response = await axiosClient.get<ProductDetailsResponse>(`/product/details/${productId}/${shopId}`);
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


export async function getProductActive(param: GetOrderParam) {
    try {
        const response = await axiosClient.get<ProductApiResponse>("/product/active",
                            {
                                params :{
                                    start_time : param.startTime,
                                    end_time : param.endTime,
                                    keyword: param.keyword,
                                    page : param.page,
                                    filter: "ACTIVE",
                                    page_size: param.pageSize || 20
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

export async function getAllProductActive() {
    try {
        const response = await axiosClient.get<ApiResponse<Product[]>>("/product/active/all",);
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
export async function getProductRecord(param: GetOrderParam) {
    try {
        const response = await axiosClient.get<ProductApiResponse>("/product/record",
                            {
                                params :{
                                    start_time : param.startTime,
                                    end_time : param.endTime,
                                    keyword: param.keyword,
                                    page : param.page,
                                    filter: "UPDATE"
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
export async function getProductSales(param: GetProductSaleParam) {
    try {
        const response = await axiosClient.get<ProductReportApiResponse>("/reports/product-sales",
                            {
                                params :{
                                    start_time : param.startTime,
                                    end_time : param.endTime,
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