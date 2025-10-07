"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getProdcDetails } from "@/service/product/product-service";
import {
  mappingDesign,
  ParamMapping,
} from "@/service/design/design-service";

import { ShopResponse } from "@/service/types/ApiResponse";
import { ProductDetails, Sku } from "@/service/types/productDetails";
import ProductCard from "../_components/ProductCard";
import LoadingOverlay from "@/components/UI/LoadingOverlay";
import SearchBar from "../_components/SearchBar";
import SkuTable from "../_components/SkuTable";
import DesignTable from "../_components/DesignTable";
import { useShops } from "@/lib/customHooks/useShops";

export default function MappingDesignPage() {
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get("product_id") || "";
  const shopIdParam = searchParams.get("shop_id") || "";
  const skuIdParam = searchParams.get("sku_id") || "";

  const [productId, setProductId] = useState(productIdParam);
  const [shop, setShop] = useState(shopIdParam);
  const [skuSearch, setSkuSearch] = useState(skuIdParam);

  const [productDetails, setProductDetails] = useState<ProductDetails>();
  const [skus, setSkus] = useState<Sku[]>([]);

  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string>("");

  const [loading, setLoading] = useState(false);

  const { data: shopsResponse, isLoading: shopLoading } = useShops();
  const shops = (shopsResponse?.result ?? []).sort(
    (a: ShopResponse, b: ShopResponse) =>
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );

  // Updated filters to support multiple values per attribute
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        if (productIdParam && shopIdParam) {
          await handleSearch();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await getProdcDetails({
        productId: productId,
        shopId: shop,
      });
      setSkus(response.result.skus);
      setProductDetails(response.result);
      
      // Reset filters when searching new product to avoid confusion
      setFilters({});
      setSelectedSkus([]);
    } catch (error: any) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!productId?.trim()) {
      alert("Vui lòng nhập Product ID");
      return;
    }
    if (!selectedSkus || selectedSkus.length === 0) {
      alert("Vui lòng chọn ít nhất 1 SKU");
      return;
    }
    if (!selectedDesign) {
      alert("Vui lòng chọn Design");
      return;
    }

    const payload: ParamMapping = {
      productId: productId.trim(),
      skuIds: selectedSkus,
      designId: selectedDesign,
    };

    setLoading(true);
    try {
      await mappingDesign(payload);
      await handleSearch();
      const successMessage = `Mapping thành công!'}`;
      alert(successMessage);
      setSelectedSkus([]);
      setSelectedDesign("");
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 shadow-lg h-[calc(100vh-56px)] flex flex-col overflow-hidden">
      {/* Search Bar - Fixed height */}
      <div className="flex-shrink-0 mb-4">
        <SearchBar
          productId={productId}
          setProductId={setProductId}
          shop={shop}
          shops={shops}
          setShop={setShop}
          handleSearch={handleSearch}
          handleSubmit={handleSubmit}
        />
      </div>

      {/* Product Card - Fixed height */}
      <div className="flex-shrink-0 mb-2">
        <ProductCard productDetails={productDetails} />
      </div>
      {/* Main Content Grid - Takes remaining space */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="grid grid-cols-2 gap-6 h-full">
          {/* SKU Table */}
          <div className="h-full overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <SkuTable
                  skus={skus}
                  skuSearch={skuSearch}
                  setSkuSearch={setSkuSearch}
                  filters={filters}
                  setFilters={setFilters}
                  selectedSkus={selectedSkus}
                  setSelectedSkus={setSelectedSkus}
                  productId={productId}
                />
              </div>
            </div>
          </div>

          {/* Design Table */}
          <div className="h-full overflow-hidden">
            <div className="h-full flex flex-col">
              <div className="flex-1 min-h-0">
                <DesignTable
                  selectedDesign={selectedDesign}
                  setSelectedDesign={setSelectedDesign}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals and Overlays */}
      <LoadingOverlay show={loading} />
    </div>
  );
}