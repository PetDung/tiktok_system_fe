import axiosClient from "@/lib/axiosClient";
import { ApiResponse, AuthError, Design, DesignResponse } from "../types/ApiResponse";
import axios from "axios";
import { DesignRequest } from "@/components/pages/Design/_components/AddDesign";
import { DesignCursorPageResponse } from "../types/ApiResponse_v2";


export type ParamMapping = {
    productId : string;
    designId: string;
    skuIds : string [];
}

export type ParamDesign = {
    search? : string | null;
    cursor? : string | null;
}


export type SkuDesignMap = Record<string, Design>;

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


export async function getDesignsCursor(param : ParamDesign = {}) {
     try {
        console.log("Fetching designs cursor...");
        const response = await axiosClient.get<DesignCursorPageResponse>(`/design/next-page`, {
            params: {
                search: param.search,
                next_cursor: param.cursor
            }
        });
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

export async function getAllDesignSkusAndProduct(skuIds: string[], productId: string) {
     try {
        const response = await axiosClient.get<ApiResponse<SkuDesignMap>>(`/design/get-design-by-batch-sku-product`,
            {
                params: {
                    sku_ids: skuIds.join(","),
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
        const response = await axiosClient.post<ApiResponse<Design>>(`/design`,
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

export async function removeSkusDesign(productId: string, ids: string[]) {
  try {
    const response = await axiosClient.delete<any>('/design/remove-skus', {
      params: {
        productId,
        skusToRemove: ids.join(',') // gửi mảng dưới dạng chuỗi "id1,id2,id3"
      }
    });

    if (response.data.code === 1000) {
      return response.data;
    }

    throw new AuthError(500, "Invalid response from server");
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const serverError = error.response?.data as ApiResponse<any>;
      throw new AuthError(
        serverError?.code || 500,
        serverError?.message || "Request failed. Please try again."
      );
    }
    throw new AuthError(500, "An unexpected error occurred. Please try again.");
  }
}
export async function clearDesignInItem(id: string[]) {
     try {
        const response = await axiosClient.delete<any>(`/design/clear`, {
            params:{
                item_order_ids: id.join(",")
            }
        });
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
