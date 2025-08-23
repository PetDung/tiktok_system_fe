"use client"

import React, { Fragment, useState } from "react";
import { Product } from "@/service/types/ApiResponse";
import { Copy } from "lucide-react";

const mockProducts: Product[] = [
    {
        id: "prd_1001",
        title: "Portable Outdoor Folding Chair",
        status: "REJECTED",
        activeTime: 1724382900,
        auditFailedReasons: [
            {
                listingPlatform: "TIKTOK_SHOP",
                position: "Product",
                reasons: ["Trademark Infringement Claim"],
                suggestions: [
                    "Please modify product title/description to avoid brand infringement.",
                ],
            },
        ],
        shop: {
            id: "shop_001",
            userShopName: "DShop Official",
        },
        createdTime: 1724382000,
        updatedTime: 1724382950,
    },
    {
        id: "prd_1002",
        title: "Wireless Bluetooth Earbuds",
        status: "ACTIVE",
        activeTime: 1724383900,
        auditFailedReasons: [],
        shop: {
            id: "shop_002",
            userShopName: "TechHub",
        },
        createdTime: 1724383000,
        updatedTime: 1724383950,
    },
    {
        id: "prd_1003",
        title: "Cotton T-Shirt Unisex",
        status: "PENDING",
        activeTime: 1724384900,
        auditFailedReasons: [
            {
                listingPlatform: "TIKTOK_SHOP",
                position: "Image",
                reasons: ["Contains inappropriate watermark"],
                suggestions: ["Remove watermarks before resubmitting."],
            },
        ],
        shop: {
            id: "shop_003",
            userShopName: "FashionZone",
        },
        createdTime: 1724384000,
        updatedTime: 1724384950,
    },
];

export default function ProductActiveTable() {
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopy = async (productUrl: string, id: string) => {
        await navigator.clipboard.writeText(productUrl);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="relative h-[80vh] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 z-20">
                <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Shop</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Link</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {mockProducts.map((product) => {
                    const productUrl = `https://shop.tiktok.com/view/product/${product.id}`;
                    return (
                        <Fragment key={product.id}>
                            <tr className="hover:bg-gray-50 transition-colors">
                                <td className="px-4 py-3 text-gray-600">{product.id}</td>
                                <td className="px-4 py-3 font-medium text-gray-800">
                                    {product.shop.userShopName}
                                </td>
                                <td className="px-4 py-3 text-gray-600">{product.title}</td>
                                <td className="px-4 py-3">
                    <span
                        className={`px-2 py-1 text-xs rounded-full ${
                            product.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : product.status === "REJECTED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-yellow-100 text-yellow-700"
                        }`}
                    >
                      {product.status}
                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-2">
                                        <a
                                            href={productUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            Mở
                                        </a>
                                        <button
                                            onClick={() => handleCopy(productUrl, product.id)}
                                            className="text-gray-400 hover:text-gray-600 transition"
                                            title="Copy link"
                                        >
                                            <Copy size={16} />
                                        </button>
                                        {copiedId === product.id && (
                                            <span className="text-xs text-green-600">Copied!</span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        </Fragment>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}
