// app/shops/ShopTable.tsx
"use client";

import { ShopResponse } from "@/service/types/ApiResponse";
import ShopRow from "./ShopRow";

type Props = {
  shops: ShopResponse[];
  setShops: React.Dispatch<React.SetStateAction<ShopResponse[]>>;
  loading: boolean;
};

export default function ShopTable({ shops, setShops, loading }: Props) {
  return (
    <div className="rounded-lg shadow border border-gray-200 overflow-hidden">
      {/* Scroll container */}
      <div className="overflow-y-auto max-h-[70vh]">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-20">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                TikTok Shop Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User Shop Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : shops.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  No shops found
                </td>
              </tr>
            ) : (
              shops.map((shop, idx) => (
                <ShopRow
                  key={shop.id}
                  shop={shop}
                  index={idx}
                  setShops={setShops}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
