import LoginComponet from "@/components/pages/LoginPage/LoginComponent";
import { Suspense } from "react";

export default function PageLogin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginComponet />
    </Suspense>
  );
}
