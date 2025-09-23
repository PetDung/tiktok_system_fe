export interface CategoryPrintPrinteesHub {
    category : string;
    name : string;
    variations: Variation []
}

export interface Variation {
    size : string;
    sku: string;
    color: string;
}

export interface ProductMenPrint {
    name: string;
    product_code : string;
    category : string;
    sub_category : string;
}

export interface ProductMenPrintData {
    data : ProductMenPrint[]
}



export const getVariationsPrinteesHub = async (): Promise<CategoryPrintPrinteesHub[]> => {
  try {
    const res = await fetch("/api/variations/printeeshub"); // gọi endpoint nội bộ
    if (!res.ok) throw new Error("Failed to fetch variations");
    const data = await res.json();
    return data; 
  } catch (err: any) {
    console.error("Error fetching variations:", err.message);
    return [];
  }
};

export const getVariationsMenPrint = async (): Promise<ProductMenPrintData | null> => {
  try {
    const res = await fetch("/api/menprint"); // gọi endpoint nội bộ
    if (!res.ok) throw new Error("Failed to fetch variations");
    const data = await res.json();
    return data; 
  } catch (err: any) {
    console.error("Error fetching variations:", err.message);
    return null;
  }
};