"use client"

import { Order, PrintShop } from "@/service/types/ApiResponse";
import TablOrderPrint from "./TablOrderPrint";
import { Dispatch, SetStateAction } from "react";
import { CategoryPrintPrinteesHub, ProductMenPrint } from "@/service/print-order/getSKU";

type Props = {
    orderList: Order[]
    setOrders: Dispatch<SetStateAction<Order[]>>;
    variationsPrinteesHub: CategoryPrintPrinteesHub[];
    productMenPrint: ProductMenPrint[];
    printers: PrintShop[]
}

export default function AwaitDesign({ orderList, setOrders, variationsPrinteesHub, productMenPrint, printers }: Props) {
    return (
        <div>
            <TablOrderPrint
                variationsPrinteesHub={variationsPrinteesHub}
                productMenPrint={productMenPrint}
                printers={printers}
                setOrders={setOrders}
                orderList={orderList}
            />
        </div>
    );
}