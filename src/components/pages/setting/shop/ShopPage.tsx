"use client";

import { useEffect, useState } from "react";
import { ShopResponse } from "@/service/types/ApiResponse";
import ShopTable from "./_components/ShopTable";
import { getMyShopPage } from "@/service/shop/shop-service";

export default function ShopsPage() {
  const [shops, setShops] = useState<ShopResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(50);
  const [last, setLast] = useState(false);

  const fetchShops = async (pageNumber = 0, append = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getMyShopPage(pageNumber, size); // nếu BE support search
      setShops((prev) =>
        append ? [...prev, ...response.result.orders] : response.result.orders
      );
      setPage(response.result.current_page || 0);
      setLast(response.result.last || false);
    } catch (error) {
      console.error("Error fetching shops:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops(0, false);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShops(0, false);
  };

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">TikTok Shops</h1>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Search by userShopName or tiktokShopName"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Search
        </button>
      </form>

      <ShopTable
        shops={shops}
        setShops={setShops}
        loading={loading}
        last={last}
        fetchMore={() => fetchShops(page + 1, true)}
      />
    </div>
  );
}
