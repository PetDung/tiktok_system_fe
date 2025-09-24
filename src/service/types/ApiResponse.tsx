import { ProductDetails } from "./productDetails";

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

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

export interface Setting {
  connectUrl: string;
  orderSheetId: string;
  driverId: string;
}

export interface Return {
  returnId: string;
  returnType: string;
  returnStatus: string;
  arbitrationStatus?: string;
  role?: string;
  returnReason?: string;
  returnReasonText?: string;
  shipmentType?: string;
  handoverMethod?: string;
  returnTrackingNumber?: string;
  returnProviderName?: string;
  returnProviderId?: string;
  preReturnId?: string;
  nextReturnId?: string;
  canBuyerKeepItem?: boolean;
  returnShippingDocumentType?: string;
  returnMethod?: string;
  isCombinedReturn?: boolean;
  combinedReturnId?: string;
  sellerProposedReturnType?: string;
  buyerRejectedPartialRefund?: boolean;
  updateTime: number;
  createTime: number;
  orderId: string;

  refundAmount?: RefundAmount;
  returnWarehouseAddress?: any;
  partialRefund?: any;
  sellerNextActionResponse?: any[];
  returnLineItems?: ReturnLineItem[];
  discountAmount?: DiscountAmount[];
  shippingFeeAmount?: ShippingFeeAmount[];
  shopId:string;
  shopName: string;
}
export interface RefundAmount {
  currency: string;
  refundTotal: number;
  refundSubtotal: number;
  refundShippingFee: number;
  refundTax: number;
  retailDeliveryFee: number | null;
  buyerServiceFee: number | null;
}

export interface ProductImage {
  url: string;
  width: number;
  height: number;
}

export interface ReturnLineItem {
  returnLineItemId: string;
  orderLineItemId: string;
  skuId: string;
  skuName: string;
  productName: string;
  sellerSku: string | null;
  productImage: ProductImage;
  refundAmount: RefundAmount;
}

export interface DiscountAmount {
  currency: string;
  productSellerDiscount: number;
  shippingFeePlatformDiscount: number;
  shippingFeeSellerDiscount: number;
  productPlatformDiscount: number;
}

export interface ShippingFeeAmount {
  currency: string;
  sellerPaidReturnShippingFee: number;
  platformPaidReturnShippingFee: number;
  buyerPaidReturnShippingFee: number;
}


export interface Settlement {
  id: string;
  currency: string | null;
  fee_and_tax_amount: number;
  order_create_time: number;
  revenue_amount: number;
  settlement_amount: number;
  shipping_cost_amount: number;
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
  settlement?: Settlement  | null; 
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
  printer: PrintShop;
  status: string;
  shipping_type: string;
  create_time: number;
  line_items: LineItem[];
  is_note : boolean | null;
  cost: number
  returns: Return[] | null;
  print_status: string;
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
  sku_print : string | null;
  design: Design | null;
}

export interface OrderResponse {
    total_count: number;
    next_page_token?: string;
    orders: Order[];
    last? : boolean;
    current_page?: number;
}


export interface RefundResponse {
    total_count: number;
    next_page_token?: string;
    orders: Return[];
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
    mainImages: MainImage[]
}

export interface MainImage {
  thumb_urls : string[];
  urls: string[];
  uri: string;
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
  thumbnail?: string;
}
export interface PrintShop {
  id: string;
  name: string;
  description: string;
  code: string;
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

export function getCategoryPathText(chains: Category[] = []): string {
  if (!chains.length) return "";

  // Tìm category lá (leaf). Nếu không có, lấy phần tử cuối
  const leaf = chains.find(c => c.is_leaf) || chains[chains.length - 1];

  // Trả về tên category, fallback thành chuỗi rỗng nếu không có
  return leaf?.local_name ?? "";
}

export const formatDate = (timestamp: number) =>
    new Date(timestamp * 1000).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
  });