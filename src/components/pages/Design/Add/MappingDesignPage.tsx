"use client";
import { useEffect, useState } from "react";
import { Search, Upload, Filter, Trash, Eye } from "lucide-react";
import { getMyShop } from "@/service/shop/shop-service";
import { Design, ShopResponse } from "@/service/types/ApiResponse";
import { getProdcDetails } from "@/service/product/product-service";
import { ProductDetails, Sku } from "@/service/types/productDetails";
import { createDesign, deleteDesign, getAllDesigns, getDesignBSkuAndProduct, mappingDesign, ParamMapping } from "@/service/design/design-service";
import DesignModal, { DesignRequest } from "../_components/AddDesign";
import ShopSelect from "../_components/ShopSelect";
import LoadingOverlay from "@/components/UI/LoadingOverlay";
import ProductCard from "../_components/ProductCard";
import DesignView from "../_components/DesignView";
import {useSearchParams  } from "next/navigation";
import DesignModalView from "../_components/DesignModalView";


export default function MappingDesignPage() {

  const searchParams = useSearchParams(); // hook Next.js App Router
  const productIdParam = searchParams.get('product_id') || "";
  const shopIdParam = searchParams.get('shop_id') || "";
  const skuIdParam = searchParams.get('sku_id') || "";

  const [productId, setProductId] = useState(productIdParam);
  const [shop, setShop] = useState(shopIdParam);
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [openView, setOpenView] = useState(false);
  const [loading, setLoading] = useState(false);
  const [productDetails, setProductDetails] = useState<ProductDetails>();

  const [skuSearch, setSkuSearch] = useState(skuIdParam);
  const [designSearch, setDesignSearch] = useState("");
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [designView, setDesignView] = useState<Design | null>(null);

  const [shops, setShops] = useState<ShopResponse[]>([]);
  // fake sku data
  const [skus, setSkus] = useState<Sku[]>([]);

  const [designs, setDesigns] = useState<Design[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        await fetchShop();
        await fetchDesign();
        if(productIdParam && shopIdParam) {
          await handleSeacrch();
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
  }
  const fetchDesign = async () => {
    console.log("Fetch design result:");
    const responseDesignFetch = await getAllDesigns()
    console.log("Fetch design result:", responseDesignFetch);
    setDesigns(responseDesignFetch.result)
  };

  const handleSeacrch = async () => {
    setLoading(true);
    try {
      const response = await getProdcDetails({ productId: productId, shopId: shop });
      setSkus(response.result.skus);
      setProductDetails(response.result);
    } catch (error: any) {
      alert(error);
    } finally {
      setLoading(false); // tắt loading dù thành công hay thất bại
    }
  };

  const toggleSku = (id: string) => {
    setSelectedSkus((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleFilterChange = (attr: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [attr]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate
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

    setLoading(true); // bật loading trước khi gọi API
    try {
      const response = await mappingDesign(payload);
      console.log(response);
      alert("Mapping thành công");
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra: " + error);
    } finally {
      setLoading(false); // tắt loading dù thành công hay thất bại
    }
  };

  // lấy danh sách attribute distinct từ SKU
  const attributes = Array.from(
    new Set(skus.flatMap((sku) => sku.sales_attributes.map((a) => a.name)))
  );

  const filteredSkus = skus.filter((sku) => {
    // lọc theo search
    if (skuSearch && !sku.id.includes(skuSearch.toLowerCase())) {
      return false;
    }
    // lọc theo attribute
    for (let attr of Object.keys(filters)) {
      if (
        filters[attr] &&
        !sku.sales_attributes.some((a) => a.name === attr && a.value_name === filters[attr])
      ) {
        return false;
      }
    }
    return true;
  });

  const filteredDesigns = designs.filter((d) =>
    d.name.toLowerCase().includes(designSearch.toLowerCase())
  );

  // chọn tất cả sku hiện tại
  const toggleSelectAll = () => {
    const allIds = filteredSkus.map((sku) => sku.id);
    const allSelected = allIds.every((id) => selectedSkus.includes(id));
    if (allSelected) {
      setSelectedSkus((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedSkus((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const handleSubmitDesign = async (data: DesignRequest) => {
    try {
      await createDesign(data);
      console.log("Created design");
      await fetchDesign();
    } catch (error) {
      console.error(error);
    }
  }
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
  }

  const isAllSelected =
    filteredSkus.length > 0 &&
    filteredSkus.every((sku) => selectedSkus.includes(sku.id));

  const handlerClickSku = async (skuId: string, proudctId:string) => {
     try {
      const response = await getDesignBSkuAndProduct(skuId, proudctId);
      if (response.code === 1000) {
        console.log("Design hiện tại:", response.result);
        setDesignView(response.result);
        setOpenView(true);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="flex flex-col items-center p-6">
      <div className="w-full max-w-6xl h-[85vh] bg-white rounded-2xl shadow p-6 flex flex-col">
        {/* Search Row */}
        <div className="flex items-center space-x-4 mb-4">
          <input
            type="text"
            placeholder="Nhập Product ID..."
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="flex-1 border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <ShopSelect
            shops={shops}
            value={shop}
            onChange={(val) => setShop(val)}
          />
          <button
            onClick={handleSeacrch}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700"
          >
            <Search size={18} />
            Search
          </button>
        </div>
        <ProductCard productDetails={productDetails} />

        {/* Tables */}
        <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden mt-2">
          {/* SKU Column */}
          <div className="border rounded-2xl p-4 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Tìm SKU..."
                value={skuSearch}
                onChange={(e) => setSkuSearch(e.target.value)}
                className="flex-1 border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <Filter size={18} className="text-gray-500" />
            </div>

            {/* Filter by attribute */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {attributes.map((attr) => {
                const values = Array.from(
                  new Set(
                    skus.flatMap((s) =>
                      s.sales_attributes
                        .filter((a) => a.name === attr)
                        .map((a) => a.value_name)
                    )
                  )
                );
                return (
                  <select
                    key={attr}
                    value={filters[attr] || ""}
                    onChange={(e) => handleFilterChange(attr, e.target.value)}
                    className="border rounded-lg px-2 py-1 text-sm"
                  >
                    <option value="">{attr}</option>
                    {values.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                );
              })}
            </div>

            {/* SKU List */}
            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={toggleSelectAll}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="p-2 text-left">SKU</th>
                    <th className="p-2 text-left">Thuộc tính</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSkus.map((sku) => (
                    <tr key={sku.id} className="border-t">
                      <td className="p-2">
                        <input
                          type="checkbox"
                          checked={selectedSkus.includes(sku.id)}
                          onChange={() => toggleSku(sku.id)}
                          className="w-4 h-4"
                        />
                        <div onClick={() => handlerClickSku(sku.id, productId)} className="text-blue-500 text-xs cursor-pointer hover:underline">Xem desgin hiện tại</div>
                      </td>
                      <td className="p-2 font-medium">{sku.id}</td>
                      <td className="p-2">
                        {sku.sales_attributes.map((a) => (
                          <span
                            key={a.value_name}
                            className="px-2 py-0.5 bg-gray-100 rounded-lg text-xs mr-1"
                          >
                            {a.value_name}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Design Column */}
          <div className="border rounded-2xl p-4 flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <Search size={18} className="text-gray-500" />
              <input
                type="text"
                placeholder="Tìm design..."
                value={designSearch}
                onChange={(e) => setDesignSearch(e.target.value)}
                className="flex-1 border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <div className="p-6">
                <button onClick={() => setOpen(true)} className="rounded bg-green-600 px-4 py-2 text-white">
                  Add design
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              <table className="w-full text-sm border-collapse">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Chọn</th>
                    <th className="p-2 text-left">Tên</th>
                    <th className="p-2 text-left">Preview</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDesigns.map((design) => (
                    <tr key={design.id} className="border-t">
                      <td className="p-2">
                        <input
                          type="radio"
                          name="design"
                          checked={selectedDesign === design.id}
                          onChange={() => setSelectedDesign(design.id)}
                          className="w-4 h-4"
                        />
                      </td>
                      <td className="p-2 font-medium">{design.name}</td>
                      <td className="p-2 text-center">
                        <div className="flex gap-2 items-center justify-center">
                          <button
                            onClick={() => handleDeleteDesign(design.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition flex items-center gap-1"
                          >
                            <Trash className="w-4 h-4" />
                            Delete
                          </button>
                          <DesignView design={design} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Submit */}
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
        initial={designView || { id: "", name: "", frontSide: "", backSide: "", leftSide: "", rightSide: "" }}
        title="Design hiện tại"
      />
    </div>
  );
}
