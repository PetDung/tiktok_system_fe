import { ExcelColumnConfig } from "@/components/UI/ExcelExportButton";
import { AuditFailedReason, getCategoryPathText, Product, ProductReport } from "@/service/types/ApiResponse";
import { get } from "lodash";


export const columnsProductActive: ExcelColumnConfig<Product>[] = [
  { header: "ID", key: "id" },
  { header: "Title", key: "title" },
  {
    header: "Category",
    key: "categoryChains",
    format: (value) => getCategoryPathText(value || []),

  },
  { header: "Shop", key: "shop.userShopName" }, // nested key
  { 
    header: "Create Time (UTC)", 
    key: "createTime",
    format: (value) => new Date(value * 1000).toLocaleString("vi-VN", { timeZone: "UTC" })
  },
  { 
    header: "Active Time (UTC)", 
    key: "activeTime",
    format: (value) => new Date(value * 1000).toLocaleString("vi-VN", { timeZone: "UTC" })
  },
  { header: "Status", key: "status" },
];

export const columnsProductRecord: ExcelColumnConfig<Product>[] = [
  { header: "ID", key: "id" },
  { header: "Title", key: "title" },
  { header: "Shop", key: "shop.userShopName" }, // nested key
  { 
    header: "Create Time (UTC)", 
    key: "createTime",
    format: (value) => new Date(value * 1000).toLocaleString("vi-VN", { timeZone: "UTC" })
  },
  { 
    header: "Update Time (UTC)", 
    key: "updateTime",
    format: (value) => new Date(value * 1000).toLocaleString("vi-VN", { timeZone: "UTC" })
  },
  { header: "Status", key: "status" },
  {
    header: "Audit Failed Reasons",
    key: "auditFailedReasons",
    format: (arr: AuditFailedReason[] = []) =>
      arr.map(a => 
        `[${a.listing_platform} - ${a.position}] Reasons: ${a.reasons.join(", ")}; Suggestions: ${a.suggestions.join(", ")}`
      ).join("\n") // mỗi object xuống dòng
  },
]

export const columnsProductSale: ExcelColumnConfig<ProductReport>[] = [
  { header: "ID", key: "productId" },
  { header: "Title", key: "productName" },
  { header: "Shop", key: "shopName" }, // nested key
  { header: "sold", key: "soldCount" }, // nested key
]

