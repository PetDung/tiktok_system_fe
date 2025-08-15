"use client"
import { getMyShop } from "@/service/shop/shop-service";
import { ShopResponse } from "@/service/types/ApiResponse";
import { useEffect, useState } from "react";
import ShopTable from "../_components/ShopTable";
import { useRouter } from "next/navigation";

export const SelectShopView = () => {

    const [shops, setShops] = useState<ShopResponse[]>([]); // Adjust type as needed
    const router = useRouter();
    useEffect(() => {

        (async () => {
            try {
                const response = await getMyShop();
                setShops(
                    response.result
                    ? Array.isArray(response.result)
                        ? response.result
                        : [response.result]
                    : []
                );
                console.log("Shop data:", response);

            } catch (error) {
                console.error("Error in OrderInShopComponents:", error);
            }
        })()


    }, []);

    const handleShopClick = (shopId: string) => {
        router.push(`/order-in-shop/${shopId}`);
    }


    return (
        <div>
            <ShopTable data={shops} hanlderClick={handleShopClick} />
        </div>
    )

}