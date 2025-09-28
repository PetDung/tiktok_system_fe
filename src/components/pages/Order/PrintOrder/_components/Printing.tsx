"use client"

import { Order, PrintShop } from "@/service/types/ApiResponse";
import TablOrderPrint from "./TablOrderPrint";
import { CategoryPrintPrinteesHub, ProductMenPrint } from "@/service/print-order/getSKU";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { PrintShippMethod } from "@/service/types/PrintOrder";

type Props = {
    variationsPrinteesHub: CategoryPrintPrinteesHub[];
    productMenPrint: ProductMenPrint[];
    orderReviewList : Order[];
    setOrderReviewList: React.Dispatch<React.SetStateAction<Order[]>>;
    isLoading : boolean;
    printers: PrintShop[];
    loadMore: () => void;
    hasMore : boolean;
    printShippingMethods: PrintShippMethod[]
}

export default function Printing(
    { 
        variationsPrinteesHub, 
        productMenPrint, 
        printers, 
        orderReviewList, 
        setOrderReviewList, 
        isLoading, 
        loadMore,
        hasMore,
        printShippingMethods
    }: Props) {
    return (
        <div>
            {isLoading && <div className="h-20 flex items-center justify-center">
                <LoadingIndicator />
            </div>}
            {!isLoading && <TablOrderPrint
                printShippingMethods = {printShippingMethods}
                setOrder = {setOrderReviewList}
                variationsPrinteesHub={variationsPrinteesHub}
                productMenPrint={productMenPrint}
                printers={printers}
                orderList={orderReviewList}
            />}
             <div>
                {hasMore && (
                    <div className="flex justify-center items-center">
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
                    </div>
            )}
      </div>
        </div>
    );
}