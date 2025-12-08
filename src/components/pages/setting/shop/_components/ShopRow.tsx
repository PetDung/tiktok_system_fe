// app/shops/ShopRow.tsx
"use client";

import { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { ShopResponse } from "@/service/types/ApiResponse";
import {deleteShop, updateUserNameShop} from "@/service/shop/shop-service";

type Props = {
  shop: ShopResponse;
  index: number;
  setShops: React.Dispatch<React.SetStateAction<ShopResponse[]>>;
};

export default function ShopRow({ shop, index, setShops }: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(shop.userShopName);

  const saveEdit = async () => {
    try {
      const response = await updateUserNameShop(shop.id, editValue);
      setShops((prev) =>
        prev.map((s) =>
          s.id === shop.id ? { ...s, userShopName: editValue } : s
        )
      );
      setEditing(false);
    } catch (err : any) {
      console.error(err);
      alert(err.message || "Failed to update shop name");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this shop?")) return;
    try {
      await deleteShop(shop.id);
      setShops((prev) => prev.filter((s) => s.id !== shop.id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-150">
      <td className="px-4 py-3 text-sm text-gray-600">{index + 1}</td>
      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
        {shop.tiktokShopName}
      </td>
      <td className="px-4 py-3 text-sm text-gray-800">
        {editing ? (
          <input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        ) : (
          shop.userShopName
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {new Date(shop.createdAt).toLocaleString()}
      </td>
      <td className="px-4 py-3 flex gap-2">
        {editing ? (
          <>
            <button
              onClick={saveEdit}
              className="bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setEditing(true)}
              className="text-blue-600 hover:text-blue-800 transition"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 transition"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </td>
    </tr>
  );
}
