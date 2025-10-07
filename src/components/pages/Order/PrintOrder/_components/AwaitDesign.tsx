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
    printers: PrintShop[]
    skuMPK: SKUMPK[]
    printShippingMethods: PrintShippMethod[]
    orderAwaitList : Order[];
    setOrderAwaitList :  React.Dispatch<React.SetStateAction<Order[]>>;
    isLoading : boolean
    loadMore: () => void;
    hasMore : boolean;
}

export default function AwaitDesign(
    {   
         variationsPrinteesHub, 
         productMenPrint, 
         printers, 
         orderAwaitList,
         setOrderAwaitList,
         loadMore,
         hasMore,
         printShippingMethods,
         skuMPK
    }
    : Props
) {
    return (
        <div>
            <LoadMoreWrapper hasMore={hasMore} loadMore={loadMore} loader={<LoadingIndicator />}>
                <TablOrderPrint
                    skuMPK={skuMPK}
                    printShippingMethods={printShippingMethods}
                    setOrder={setOrderAwaitList}
                    variationsPrinteesHub={variationsPrinteesHub}
                    productMenPrint={productMenPrint}
                    printers={printers}
                    orderList={orderAwaitList}
                />
            </LoadMoreWrapper>
        </div>
    );
}