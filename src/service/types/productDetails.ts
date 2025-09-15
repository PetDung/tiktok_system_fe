interface Image {
  height: number;
  width: number;
  thumb_urls: string[];
  uri: string;
  urls: string[];
}

interface Video {
  id: string;
  cover_url: string;
  format: string;
  url: string;
  width: number;
  height: number;
  size: number;
}

interface Category {
  id: string;
  parent_id: string;
  local_name: string;
  is_leaf: boolean;
}

interface Brand {
  id: string;
  name: string;
}

interface Dimension {
  length: string;
  width: string;
  height: string;
  unit: string;
}

interface Weight {
  value: string;
  unit: string;
}

interface Price {
  tax_exclusive_price: string;
  sale_price: string;
  currency: string;
  unit_price?: string;
}

interface Inventory {
  warehouse_id: string;
  quantity: number;
}

interface IdentifierCode {
  code: string;
  type: string;
}

interface SalesAttribute {
  id: string;
  name: string;
  value_id: string;
  value_name: string;
  sku_img?: Image;
  supplementary_sku_images?: Image[];
}

interface CombinedSku {
  product_id: string;
  sku_id: string;
  sku_count: number;
  seller_sku: string;
  title: string;
  sales_attributes: SalesAttribute[];
  price: {
    tax_exclusive_price: string;
    sale_price: string;
    currency: string;
  };
  inventory: Inventory[];
  product_main_image: Image;
  categories: Category[];
  brand: Brand;
  combined_listing_not_live_reasons: string[];
}

interface GlobalListingPolicy {
  price_sync: boolean;
  inventory_type: string;
  replicate_source: {
    product_id: string;
    shop_id: string;
    sku_id: string;
  };
}

interface StatusInfo {
  status: string;
  deactivation_source: string;
}

export interface Sku {
  designId: unknown;
  id: string;
  seller_sku: string;
  price: Price;
  inventory: Inventory[];
  identifier_code: IdentifierCode;
  sales_attributes: SalesAttribute[];
  external_sku_id: string;
  combined_skus: CombinedSku[];
  global_listing_policy: GlobalListingPolicy;
  sku_unit_count: string;
  external_urls: string[];
  extra_identifier_codes: string[];
  pre_sale: {
    type: string;
    fulfillment_type: {
      handling_duration_days: number;
      release_date: number;
    };
  };
  list_price: {
    amount: string;
    currency: string;
  };
  external_list_prices: {
    source: string;
    amount: string;
    currency: string;
  }[];
  status_info: StatusInfo;
}

interface CertificationFile {
  id: string;
  urls: string[];
  name: string;
  format: string;
}

interface Certification {
  id: string;
  title: string;
  files: CertificationFile[];
  images: Image[];
  expiration_date: number;
}

interface SizeChart {
  image: Image;
  template: { id: string };
}

interface ProductAttributeValue {
  id: string;
  name: string;
}

interface ProductAttribute {
  id: string;
  name: string;
  values: ProductAttributeValue[];
}

interface AuditFailedReason {
  position: string;
  reasons: string[];
  suggestions: string[];
  listing_platform: string;
}

interface DeliveryOption {
  id: string;
  name: string;
  is_available: boolean;
}

interface RecommendedCategory {
  id: string;
  local_name: string;
}

interface IntegratedPlatformStatus {
  platform: string;
  status: string;
}

interface Audit {
  status: string;
  pre_approved_reasons: string[];
}

interface GlobalProductAssociation {
  global_product_id: string;
  sku_mappings: {
    global_sku_id: string;
    local_sku_id: string;
    sales_attribute_mappings: {
      local_attribute_id: string;
      global_attribute_id: string;
      local_value_id: string;
      global_value_id: string;
    }[];
  }[];
}

interface ProductFamily {
  id: string;
  products: { id: string }[];
}

interface PrescriptionRequirement {
  needs_prescription: boolean;
}

export interface ProductDetails {
  id: string;
  status: string;
  title: string;
  category_chains: Category[];
  brand: Brand;
  main_images: Image[];
  video?: Video;
  description: string;
  package_dimensions: Dimension;
  package_weight: Weight;
  skus: Sku[];
  certifications: Certification[];
  size_chart?: SizeChart;
  is_cod_allowed: boolean;
  product_attributes: ProductAttribute[];
  audit_failed_reasons: AuditFailedReason[];
  update_time: number;
  create_time: number;
  delivery_options: DeliveryOption[];
  external_product_id: string;
  product_types: string[];
  is_not_for_sale: boolean;
  recommended_categories: RecommendedCategory[];
  manufacturer_ids: string[];
  responsible_person_ids: string[];
  listing_quality_tier: string;
  integrated_platform_statuses: IntegratedPlatformStatus[];
  shipping_insurance_requirement: string;
  minimum_order_quantity: number;
  is_pre_owned: boolean;
  audit: Audit;
  global_product_association: GlobalProductAssociation;
  prescription_requirement: PrescriptionRequirement;
  product_families: ProductFamily[];
  primary_combined_product_id: string;
  has_draft: boolean;
  product_status: string;
  is_replicated: boolean;
}
