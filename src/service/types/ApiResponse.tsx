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
  tracking_number: string;
  shop_name?: string;
  shop_id?: string;
  cancel_reason? : string;
  payment: {
    currency: string;
    total_amount: string;
  };
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
}

export interface LineItem {
  id: string;
  product_name: string;
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

export interface ShopResponse {
    id: string;
    name: string;
    createdAt: Date;
    tiktokShopName : string;
    userShopName : string;
}
export interface Label {
  doc_url : string;
  tracking_number : string;
}


// Type alias for specific user response
export type UserLoginResponse = ApiResponse<UserData>;
export type OrderListResponse = ApiResponse<OrderResponse>;
export type ShopResponseData = ApiResponse<ShopResponse>;
export type LabelRespone = ApiResponse<Label>;
export class AuthError extends Error {
  constructor(public code: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}