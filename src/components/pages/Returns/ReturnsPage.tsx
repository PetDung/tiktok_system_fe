"use client"
import { useEffect, useState } from "react";
import ReturnsDashboard from "./ReturnsDashboard";
import { getRefundAllShop } from "@/service/refund/refund-service";
import { RefundResponse, Return } from "@/service/types/ApiResponse";
import LoadingOverlay from "@/components/UI/LoadingOverlay";
import { useSearchParams } from "next/navigation";
import { updateQueryParam } from "@/utils/util";

export default function ReturnsPage() {
    
    const searchParams = useSearchParams();
    const orderIdParam = searchParams.get("order_id") || "";

    const [refunds, setRefunds] = useState<RefundResponse | null>(null); 
    const [loading, setLoading] = useState<boolean>(false); 
    useEffect(() => {
        load(0, orderIdParam);
    }, [])

    const load = async ( pageParam: number = 0, keywordParam: string = "", append: boolean = false) => {
        setLoading(true)
        try {
            const param =  {
                keyword : keywordParam,
                page: pageParam
            }
            updateQueryParam("order_id", keywordParam)
            const response = await getRefundAllShop(param)
            console.log(response);

            let listRefund : Return [] = [...response.result.data]

            if(append) {
                listRefund = [...(refunds?.data || []),...(response.result.data || [])];
            }
            const pageRespone: RefundResponse = {
                data : listRefund,
                current_page: response.result.current_page,
                last: response.result.last,
                total_count: response.result.total_count
            } 
            setRefunds(pageRespone);
        } catch (e: any) {
            alert(e?.messages || "Lỗi")
        }finally{
            setLoading(false)
        }
    }
    return <>
        {refunds && <ReturnsDashboard data={refunds} search={load} loading = {loading} keywordParam={orderIdParam} />}
    </>
}