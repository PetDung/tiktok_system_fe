import { ApiResponse, Design, Product, ProductReport } from "./ApiResponse";

export interface CursorPageResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor: string;
  total: number;
}
    

export type ProductSaleCursorPageResponse = ApiResponse<CursorPageResponse<ProductReport>>;

export type ProductCursorPageResponse = ApiResponse<CursorPageResponse<Product>>;

export type DesignCursorPageResponse = ApiResponse<CursorPageResponse<Design>>;