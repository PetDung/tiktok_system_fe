"use client"

import { Order, PrintShop } from "@/service/types/ApiResponse";
import TablOrderPrint from "./TablOrderPrint";
import { CategoryPrintPrinteesHub, ProductMenPrint } from "@/service/print-order/getSKU";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { PrintShippMethod } from "@/service/types/PrintOrder";
import { SKUMPK } from "@/service/print-order/data";

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
         isLoading,
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
            {isLoading && <div className="h-20 flex items-center justify-center">
                <LoadingIndicator />
            </div>}
            {!isLoading && <TablOrderPrint
                skuMPK={skuMPK}
                printShippingMethods = {printShippingMethods}
                setOrder = {setOrderAwaitList}
                variationsPrinteesHub={variationsPrinteesHub}
                productMenPrint={productMenPrint}
                printers={printers}
                orderList={orderAwaitList}
            />}
             {hasMore && (
                <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-3 sticky top-0 py-1 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center"
                    >
                    {isLoading ? (
                        <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 mr-2"></span>
                    ) : null}
                    Load thêm
            </button>
            )}
        </div>
    );
}