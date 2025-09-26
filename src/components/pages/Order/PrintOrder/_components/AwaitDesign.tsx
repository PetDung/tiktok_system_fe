"use client"

import { Order, OrderListResponse, PrintShop } from "@/service/types/ApiResponse";
import TablOrderPrint from "./TablOrderPrint";
import { useEffect, useState } from "react";
import { CategoryPrintPrinteesHub, ProductMenPrint } from "@/service/print-order/getSKU";
import { getOrderCantPrint } from "@/service/print-order/print-order-service";

type Props = {
    variationsPrinteesHub: CategoryPrintPrinteesHub[];
    productMenPrint: ProductMenPrint[];
    printers: PrintShop[]
}

export default function AwaitDesign({variationsPrinteesHub, productMenPrint, printers }: Props) {

    const [orderAwaitList, setOrderAwaitList] = useState<Order[]>([])

    useEffect(() => {
        load();
    }, [])

    const load = async () => {
        try {
            const [responseAwait] = await Promise.all([
                getOrderCantPrint({ printStatus: "AWAITING" }),
            ]);
            setOrderAwaitList(responseAwait.result.orders);
        } catch (e: any) {
            alert(e?.message || "Fail load")
        }
    }     

    return (
        <div>
            <TablOrderPrint
                variationsPrinteesHub={variationsPrinteesHub}
                productMenPrint={productMenPrint}
                printers={printers}
                orderList={orderAwaitList}
            />
        </div>
    );
}