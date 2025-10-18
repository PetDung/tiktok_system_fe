"use client"

import { memo } from "react";
import { Order, PrintShop } from "@/service/types/ApiResponse";
import TablOrderPrint from "./TablOrderPrint";
import { CategoryPrintPrinteesHub, MangoTeePrintProduct, ProductMenPrint } from "@/service/print-order/getSKU";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { PrintShippMethod } from "@/service/types/PrintOrder";
import { SKUMPK } from "@/service/print-order/data";
import LoadMoreWrapper from "@/components/UI/LoadMordeWrapper";

interface OrderTabProps {
  variationsPrinteesHub: CategoryPrintPrinteesHub[];
  productMenPrint: ProductMenPrint[];
  skuMPK: SKUMPK[];
  productMangoTeePrint : MangoTeePrintProduct[],
  orderList: Order[];
  setOrderList: React.Dispatch<React.SetStateAction<Order[]>>;
  isLoading: boolean;
  printers: PrintShop[];
  loadMore: () => void;
  hasMore: boolean;
  printShippingMethods: PrintShippMethod[];
}

const OrderTab = memo(function OrderTab({
  variationsPrinteesHub,
  productMenPrint,
  productMangoTeePrint,
  skuMPK,
  orderList,
  setOrderList,
  printers,
  loadMore,
  hasMore,
  printShippingMethods,
}: OrderTabProps) {
  return (
    <div>
      <LoadMoreWrapper hasMore={hasMore} loadMore={loadMore} loader={<LoadingIndicator />}>
        <TablOrderPrint
          skuMPK={skuMPK}
          printShippingMethods={printShippingMethods}
          setOrder={setOrderList}
          variationsPrinteesHub={variationsPrinteesHub}
          productMenPrint={productMenPrint}
          productMangoTeePrint ={productMangoTeePrint}
          printers={printers}
          orderList={orderList}
        />
      </LoadMoreWrapper>
    </div>
  );
});

export default OrderTab;
