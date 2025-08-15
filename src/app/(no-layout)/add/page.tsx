import ConnectShopComponets from "@/components/pages/Add/ConnectShopComponet";
import { Suspense } from "react";

export default function PageLogin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConnectShopComponets/>
    </Suspense>
  );
}