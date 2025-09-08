import { ProductDetails } from "./productDetails";


export interface UserData {
    id: string;
    username: string;
    name: string;
    role: string;
    team: string;
    accessToken: string;
}

export interface ApiResponse<T> {
    code: number;
    message?: string;
    result: T;
}


export interface Order {
  id: string;
  label : string | null;
  tracking_number: string;
  shop_name?: string;
  shop_id?: string;
  cancel_reason? : string;
  payment: {
    currency: string;
    total_amount: string;
  };
  payment_amount: number | null
  recipient_address: {
    name: string;
    phone_number: string;
    address_detail: string;
    district_info: {
      address_level_name: string;
      address_name: string;
      address_level: string;
    }[];
    postal_code: string;
  };
  status: string;
  shipping_type: string;
  create_time: number;
  line_items: LineItem[];
  is_note : boolean | null;
}

export interface LineItem {
  id: string;
  product_name: string;
  product_id: string;
  sku_image: string;
  sku_id: string;
  sku_name : string;
  sale_price: string;
  currency: string;
}

export interface OrderResponse {
    total_count: number;
    next_page_token?: string;
    orders: Order[];
    last? : boolean;
    current_page?: number;
}

export interface ResponsePage<T> {
    total_count: number;
    next_page_token?: string;
    orders: T[];
    last? : boolean;
    current_page?: number;
}

export interface ShopResponse {
    id: string;
    name?: string;
    createdAt: Date;
    tiktokShopName? : string;
    userShopName : string;
}
export interface Label {
  doc_url : string;
  tracking_number : string;
}

export interface AuditFailedReason {
    listing_platform: string; // ví dụ: "TIKTOK_SHOP"
    position: string;        // ví dụ: "Product"
    reasons: string[];       // danh sách lý do
    suggestions: string[];   // danh sách gợi ý
}


export interface Product {
    id: string;
    title: string;
    status: string;
    activeTime: number;
    auditFailedReasons?: AuditFailedReason[];
    shop: ShopResponse;   // lấy từ getShop()
    createTime: number;
    categoryChains: Category[] | null;
    updateTime: number;
}


interface Category {
  id: string;
  is_leaf: boolean;
  local_name: string;
  parent_id: string;
}

export interface ProductResponse {
  products :  Product []
  last? : boolean;
  currentPage?: number;
  totalCount: number;
  
}
export interface ProductReport{
  productId : string;
  productName: string;
  soldCount: number;
  shopName: string;
} 
export interface ProductReportResponse{
  products : ProductReport[];
  endEnd: number;
  startDate: number;
}

export interface Design {
  id: string;        // nếu kế thừa từ Base có id
  name: string;
  frontSide?: string;
  backSide?: string;
  leftSide?: string;
  rightSide?: string;
}


// Type alias for specific user response
export type UserLoginResponse = ApiResponse<UserData>;
export type OrderListResponse = ApiResponse<OrderResponse>;
export type ShopResponseData = ApiResponse<ShopResponse[]>;
export type ProductApiResponse = ApiResponse<ProductResponse>;
export type ProductReportApiResponse = ApiResponse<ProductReportResponse>;
export type ProductDetailsResponse = ApiResponse<ProductDetails>;
export type LabelRespone = ApiResponse<Label>;
export type DesignResponse = ApiResponse<Design[]>;
export class AuthError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export function getCategoryPathText(chains: Category[]): string {
  console.log("getCategoryPathText chains", chains);  
  if (!chains.length) return "";
  // Tạo map id -> category
  const map = new Map(chains.map(c => [c.id, c]));

  // Tìm danh mục lá (leaf). Nếu không có leaf, lấy phần tử cuối
  const leaf = chains.find(c => c.is_leaf) || chains[chains.length - 1];

  const path: string[] = [];
  let current: Category | undefined = leaf;

  // Duyệt lên tới root
  while (current) {
    path.unshift(current.local_name); // thêm từ leaf lên root
    current = current.parent_id && map.get(current.parent_id) ? map.get(current.parent_id) : undefined;
  }
  console.log("getCategoryPathText path", path);

  return path.join(" > ");
}

export const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleString("vi-VN", {
      weekday: "long",   // Thứ
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
  });