"use client"

import { Order } from "@/service/types/ApiResponse";
import TablOrderPrint from "./TablOrderPrint";
import OrderItemModalView from "./OrderItemModalView";
import { useState } from "react";

type Props = {
    orderList : Order[]
}

export default function ReviewPrint({orderList} : Props) {
    return (
        <div>
            <TablOrderPrint orderList={orderList}/>
        </div>
    );
}