"use client";
import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { getMyShop } from "@/service/shop/shop-service";
import { getProdcDetails } from "@/service/product/product-service";
import {
  createDesign,
  deleteDesign,
  getAllDesigns,
  getDesignBSkuAndProduct,
  mappingDesign,
  ParamMapping,
} from "@/service/design/design-service";

import { Design, ShopResponse } from "@/service/types/ApiResponse";
import { ProductDetails, Sku } from "@/service/types/productDetails";
import ProductCard from "../_components/ProductCard";
import LoadingOverlay from "@/components/UI/LoadingOverlay";
import DesignModal, { DesignRequest } from "../_components/AddDesign";
import SearchBar from "../_components/SearchBar";
import SkuTable from "../_components/SkuTable";
import DesignTable from "../_components/DesignTable";

export default function MappingDesignPage() {
  const searchParams = useSearchParams();
  const productIdParam = searchParams.get("product_id") || "";
  const shopIdParam = searchParams.get("shop_id") || "";
  const skuIdParam = searchParams.get("sku_id") || "";

  const [productId, setProductId] = useState(productIdParam);
  const [shop, setShop] = useState(shopIdParam);
  const [skuSearch, setSkuSearch] = useState(skuIdParam);
  const [designSearch, setDesignSearch] = useState("");

  const [shops, setShops] = useState<ShopResponse[]>([]);
  const [productDetails, setProductDetails] = useState<ProductDetails>();
  const [skus, setSkus] = useState<Sku[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);

  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Updated filters to support multiple values per attribute
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await fetchShop();
        await fetchDesign();
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

  const fetchShop = async () => {
    const responseShopFetch = await getMyShop();
    setShops(responseShopFetch.result);
  };

  const fetchDesign = async () => {
    const responseDesignFetch = await getAllDesigns();
    setDesigns(responseDesignFetch.result);
  };

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
      const response = await mappingDesign(payload);
      console.log(response);
      await handleSearch();
      
      // Show success message with more details
      const successMessage = `Mapping thành công!\n- SKUs: ${selectedSkus.length}\n- Design: ${designs.find(d => d.id === selectedDesign)?.name || 'N/A'}`;
      alert(successMessage);
      
      // Reset selections after successful mapping
      setSelectedSkus([]);
      setSelectedDesign("");
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDesign = async (data: DesignRequest) => {
    try {
      await createDesign(data);
      await fetchDesign();
      alert("Thêm design thành công!");
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi thêm design: " + error);
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    const designName = designs.find(d => d.id === designId)?.name || 'design này';
    if (!confirm(`Bạn có chắc muốn xóa "${designName}"?`)) return;
    
    setLoading(true);
    try {
      const response = await deleteDesign(designId);
      if (response.code === 1000) {
        alert("Xóa design thành công");
        await fetchDesign();
        
        // Clear selected design if it was the deleted one
        if (selectedDesign === designId) {
          setSelectedDesign("");
        }
      }
    } catch (error) {
      console.error(error);
      alert("Có lỗi khi xóa design: " + error);
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
                  designs={designs}
                  designSearch={designSearch}
                  setDesignSearch={setDesignSearch}
                  selectedDesign={selectedDesign}
                  setSelectedDesign={setSelectedDesign}
                  handleDeleteDesign={handleDeleteDesign}
                  setOpen={setOpen}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals and Overlays */}
      <LoadingOverlay show={loading} />
      <DesignModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmitDesign}
      />
    </div>
  );
}