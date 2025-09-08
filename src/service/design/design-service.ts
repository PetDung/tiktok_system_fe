import axiosClient from "@/lib/axiosClient";
import { ApiResponse, AuthError, Design, DesignResponse } from "../types/ApiResponse";
import axios from "axios";
import { DesignRequest } from "@/components/pages/Design/_components/AddDesign";


export type ParamMapping = {
    productId : string;
    designId: string;
    skuIds : string [];
}

export async function getAllDesigns() {

     try {
        const response = await axiosClient.get<DesignResponse>(`/design`);
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


export async function getDesignBSkuAndProduct(skuId: string, productId: string) {

     try {
        const response = await axiosClient.get<ApiResponse<Design>>(`/design/get-design-by-sku-product`,
            {
                params: {
                    sku_id: skuId,
                    product_id: productId
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



export async function mappingDesign(param : ParamMapping) {

     try {
        const response = await axiosClient.post<any>(`/design/mapping-design`,
            param
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



export async function createDesign(param : DesignRequest) {

     try {
        const response = await axiosClient.post<any>(`/design`,
            param
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

export async function deleteDesign(id: string) {

     try {
        const response = await axiosClient.delete<any>(`/design/${id}`);
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