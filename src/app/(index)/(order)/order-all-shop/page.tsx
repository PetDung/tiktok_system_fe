import OrderAllShopView from "@/components/pages/Order/OrderAllShop/OrderAllShopView";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { Suspense } from "react";
export default function ViewOrderAllShopPage() {
  return (
      <Suspense fallback={<LoadingIndicator/>}>
          <OrderAllShopView/>
      </Suspense>
  );
}