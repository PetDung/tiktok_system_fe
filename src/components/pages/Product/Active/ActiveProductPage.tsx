"use client"
import ProductActiveTable from "@/components/pages/Product/_component/ProductActiveTable";
import DateRangePicker from "@/components/UI/DateRangePicker";

export default function ActiveProductComponent() {



    return(
        <div className="bg-white p-4 rounded-lg shadow">
            {/* Header */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3 md:gap-0">
                <h2 className="text-lg font-semibold text-gray-800">Product new active</h2>
                <DateRangePicker/>
            </div>
            <ProductActiveTable/>
        </div>
    )
}