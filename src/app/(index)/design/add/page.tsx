import MappingDesignPage from "@/components/pages/Design/Add/MappingDesignPage";
import { Suspense } from "react";

export default function AddDesgin (){
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MappingDesignPage />
        </Suspense>
    )
}