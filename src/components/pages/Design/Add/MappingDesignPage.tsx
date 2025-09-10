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
import DesignModalView from "../_components/DesignModalView";
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
  const [openView, setOpenView] = useState(false);
  const [designView, setDesignView] = useState<Design | null>(null);

  const [filters, setFilters] = useState<{ [key: string]: string }>({});

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
      alert("Mapping thành công");
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
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!confirm("Bạn có chắc muốn xóa design này?")) return;
    try {
      const response = await deleteDesign(designId);
      if (response.code === 1000) {
        alert("Xóa design thành công");
        await fetchDesign();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlerClickSku = async (skuId: string, proudctId: string) => {
    try {
      const response = await getDesignBSkuAndProduct(skuId, proudctId);
      if (response.code === 1000) {
        setDesignView(response.result);
        setOpenView(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col items-center p-6">
      <div className="w-full h-[85vh] bg-white rounded-2xl shadow p-6 flex flex-col">
        <SearchBar
          productId={productId}
          setProductId={setProductId}
          shop={shop}
          shops={shops}
          setShop={setShop}
          handleSearch={handleSearch}
        />

        <ProductCard productDetails={productDetails} />

        <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden mt-2">
          <SkuTable
            skus={skus}
            skuSearch={skuSearch}
            setSkuSearch={setSkuSearch}
            filters={filters}
            setFilters={setFilters}
            selectedSkus={selectedSkus}
            setSelectedSkus={setSelectedSkus}
            handlerClickSku={handlerClickSku}
            productId={productId}
          />

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

        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-2 rounded-xl flex items-center gap-2 hover:bg-green-700"
          >
            <Upload size={18} />
            Submit
          </button>
        </div>
      </div>

      <LoadingOverlay show={loading} />
      <DesignModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={handleSubmitDesign}
      />
      <DesignModalView
        open={openView}
        onClose={() => setOpenView(false)}
        initial={
          designView || {
            id: "",
            name: "",
            frontSide: "",
            backSide: "",
            leftSide: "",
            rightSide: "",
          }
        }
        title="Design hiện tại"
      />
    </div>
  );
}
