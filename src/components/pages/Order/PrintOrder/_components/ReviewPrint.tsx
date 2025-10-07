"use client"

import { Order, PrintShop } from "@/service/types/ApiResponse";
import TablOrderPrint from "./TablOrderPrint";
import { CategoryPrintPrinteesHub, ProductMenPrint } from "@/service/print-order/getSKU";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { PrintShippMethod } from "@/service/types/PrintOrder";
import { SKUMPK } from "@/service/print-order/data";
import LoadMoreWrapper from "@/components/UI/LoadMordeWrapper";

type Props = {
    variationsPrinteesHub: CategoryPrintPrinteesHub[];
    productMenPrint: ProductMenPrint[];
    skuMPK: SKUMPK[]
    orderReviewList : Order[];
    setOrderReviewList: React.Dispatch<React.SetStateAction<Order[]>>;
    isLoading : boolean;
    printers: PrintShop[];
    loadMore: () => void;
    hasMore : boolean;
    printShippingMethods: PrintShippMethod[]
}

export default function ReviewPrint(
    { 
        variationsPrinteesHub, 
        productMenPrint, 
        printers, 
        orderReviewList, 
        setOrderReviewList, 
        loadMore,
        hasMore,
        printShippingMethods,
        skuMPK
    }: Props) {
    return (
        <div>
            <LoadMoreWrapper hasMore={hasMore} loadMore={loadMore} loader={<LoadingIndicator />}>
                <TablOrderPrint
                    skuMPK={skuMPK}
                    printShippingMethods={printShippingMethods}
                    setOrder={setOrderReviewList}
                    variationsPrinteesHub={variationsPrinteesHub}
                    productMenPrint={productMenPrint}
                    printers={printers}
                    orderList={orderReviewList}
                />
            </LoadMoreWrapper>
        </div>
    );
}