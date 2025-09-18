import ReturnsPage from "@/components/pages/Returns/ReturnsPage";
import LoadingIndicator from "@/components/UI/LoadingIndicator";
import { Suspense } from "react";

export default function page (){

    return (
    <Suspense fallback={<LoadingIndicator/>}>
          <ReturnsPage/>
    </Suspense>
    )

}