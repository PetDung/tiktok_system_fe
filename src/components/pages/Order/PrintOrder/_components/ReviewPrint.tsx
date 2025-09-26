"use client"

import { OrderListResponse, PrintShop } from "@/service/types/ApiResponse";
import TablOrderPrint from "./TablOrderPrint";
import { CategoryPrintPrinteesHub, ProductMenPrint } from "@/service/print-order/getSKU";
import { getOrderCantPrint } from "@/service/print-order/print-order-service";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { useFetch } from "@/lib/useFetch";

type Props = {
    variationsPrinteesHub: CategoryPrintPrinteesHub[];
    productMenPrint: ProductMenPrint[];
    printers: PrintShop[]
}

export default function ReviewPrint({ variationsPrinteesHub, productMenPrint, printers }: Props) {


    const { data, error, isLoading, refresh } = useFetch<OrderListResponse>({
        fetcher: getOrderCantPrint,
        key: "orders-cant-print",
        param: { page: 1, shopId: "123", printStatus: "REVIEW" },
    });

    if (error) {
        return <div className="text-red-500">Lỗi tải dữ liệu: {error.message}</div>;
    }

    const orderReviewList = data?.result.data ?? [];

    return (
        <div>
           {isLoading && <div className="h-20 flex items-center justify-center">
                 <LoadingIndicator />
            </div>}

           {!isLoading  && <TablOrderPrint
                variationsPrinteesHub={variationsPrinteesHub}
                productMenPrint={productMenPrint}
                printers={printers}
                orderList={orderReviewList}
            />}
        </div>
    );
}