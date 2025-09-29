"use client";

import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download } from "lucide-react";

export interface ExcelColumnConfig<T = any> {
    header: string; // Tên cột trong Excel
    key: keyof T | string; // Key object hoặc nested key "shop.userShopName"
    format?: (value: any, row: T) => any; // Optional formatter
}

interface Props<T> {
    data: T[];
    columns: ExcelColumnConfig<T>[];
    fileName?: string;
    buttonText?: string;
    className?: string;
}

/** Helper đọc nested key */
function getNestedValue(obj: any, path: string) {
    return path
        .split(".")
        .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

export default function ExcelExportButton<T>({
    data,
    columns,
    fileName = "data.xlsx",
    buttonText = "Export Excel",
}: Props<T>) {
    const handleExport = () => {
        const formatted = data.map((row) => {
            const rowData: Record<string, any> = {};
            columns.forEach((col) => {
                let value = getNestedValue(row, col.key as string);
                if (col.format) value = col.format(value, row);
                rowData[col.header] = value;
            });
            return rowData;
        });

        const worksheet = XLSX.utils.json_to_sheet(formatted);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

        const excelBuffer = XLSX.write(workbook, {
            bookType: "xlsx",
            type: "array",
        });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, fileName);
    };

    return (
        <button
            className={`
                flex items-center gap-2 px-4 py-2 rounded 
                ${data.length === 0
                                ? "bg-gray-400 text-gray-200 cursor-not-allowed" // disabled style
                                : "bg-blue-600 text-white hover:bg-blue-700"
                            }       // normal style
            `}
                        onClick={handleExport}
                        disabled={data.length === 0}
                    >
                        <Download size={16} />
                        {buttonText}
                    </button>
                );
}
