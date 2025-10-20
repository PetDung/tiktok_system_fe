import { dataMKP, SKUMPK } from "./data";

export interface CategoryPrintPrinteesHub {
  category: string;
  name: string;
  variations: Variation[]
}

export interface Variation {
  size: string;
  sku: string;
  color: string;
}

export interface ProductMenPrint {
  name: string;
  product_code: string;
  category: string;
  sub_category: string;
}

export interface MenPrintData<T> {
  data: T[]
  pagination: {
    limit: number,
    page: number,
    count: number
  }
}

export interface MenPrintSku {
  sku: string;
  status: "Active" | "Inactive"; // nếu API chỉ trả về 2 trạng thái này
  category: string;
  sub_category: string;
  size: string;
  color: string;
}

export interface MangoTeePrintSKU {
  id: string;
  sku: string
  size: string;
  color: string;
}
export interface MangoTeePrintProduct {
  id: string;
  sku: string
  name: string;
  images: string[];
}

export interface MangoTeeData<T> {
  status : boolean;
  code: string;
  message: string;
  data: T;
} 

export interface MangoTeeProducts {
  items: MangoTeePrintProduct[];
  pagination: {
    limit: number,
    pages: number,
    total: number
    page: number
  }
}
export interface MangoTeeVariations {
  product_id: string;
  product_name: string;
  items: MangoTeePrintSKU[];
  pagination: {
    limit: number,
    pages: number,
    total: number
    page: number
  }
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


export const getVariationsMenPrint = async (): Promise<MenPrintData<ProductMenPrint>> => {
  try {
    let page = 1;
    let allData: ProductMenPrint[] = [];
    let pagination: MenPrintData<ProductMenPrint>["pagination"] = {
      limit: 0,
      page: 1,
      count: 0
    };

    while (true) {
      const res = await fetch(`/api/variations/menprint?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch variations");

      const data: MenPrintData<ProductMenPrint> = await res.json();

      allData = [...allData, ...data.data];
      pagination = data.pagination;

      // nếu đã lấy đủ (vd: count <= page * limit) thì dừng
      if (data.data.length < data.pagination.limit) {
        break;
      }

      page++;
    }
    const uniqueMap = new Map<string, ProductMenPrint>();
    for (const item of allData) {
      if (!uniqueMap.has(item.product_code)) {
        uniqueMap.set(item.product_code, item);
      }
    }
    const uniqueData = Array.from(uniqueMap.values());
    return { data: uniqueData, pagination };
  } catch (err: any) {
    console.error("Error fetching variations:", err.message);
    return {
      data: [],
      pagination: { limit: 0, page: 1, count: 0 }
    };
  }
};


export const getSkuMenPrint = async (prouduct_code: string): Promise<MenPrintSku[]> => {
  try {
    let page = 1;
    let allData: MenPrintSku[] = [];
    let pagination: MenPrintData<MenPrintSku>["pagination"] = {
      limit: 0,
      page: 1,
      count: 0,
    };

    while (true) {
      const res = await fetch(`/api/variations/menprint/sku?page=${page}&product_code=${prouduct_code}`);
      if (!res.ok) throw new Error("Failed to fetch sku variations");

      const data: MenPrintData<MenPrintSku> = await res.json();

      allData = [...allData, ...data.data];
      pagination = data.pagination;

      // nếu đã hết trang thì dừng
      if (data.data.length < data.pagination.limit) {
        break;
      }

      page++;
    }
    return allData
  } catch (err: any) {
    console.error("Error fetching sku variations:", err.message);
    return []
  }
};

export const fetchSkuMKP = async (): Promise<SKUMPK[]> => {
  return Promise.resolve(dataMKP as SKUMPK[]);
};



/// mango tee prints

export const getMangoTeeProduct = async (): Promise<MangoTeePrintProduct[]> => {
  try {
    let page = 1;
    let allData: MangoTeePrintProduct[] = [];

    while (true) {
      const res = await fetch(`/api/variations/mangoteeprints?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch variations");

      const data: MangoTeeData<MangoTeeProducts> = await res.json();

      allData = [...allData, ...data.data.items];

      // nếu đã lấy đủ (vd: count <= page * limit) thì dừng
      if (allData.length === data.data.pagination.total) {
        break;
      }

      page++;
    }
    const uniqueMap = new Map<string, MangoTeePrintProduct>();
    for (const item of allData) {
      if (!uniqueMap.has(item.id)) {
        uniqueMap.set(item.id, item);
      }
    }
    
    const uniqueData = Array.from(uniqueMap.values());

    return uniqueData;

  } catch (err: any) {
    console.error("Error fetching variations:", err.message);
    return []
  }
};

export const getSkuMongoTeePrint = async (prouduct_id: string): Promise<MangoTeePrintSKU[]> => {
  try {
    let page = 1;
    let allData: MangoTeePrintSKU[] = []

    while (true) {
      console.log(page)
      const res = await fetch(`/api/variations/mangoteeprints/sku?page=${page}&product_id=${prouduct_id}`);
      if (!res.ok) throw new Error("Failed to fetch sku variations");

      const data: MangoTeeData<MangoTeeVariations> = await res.json();
      if(!data.data){
        console.log(res);
        console.log("end data")
        break;
      }

      allData = [...allData, ...data.data.items];

      // nếu đã hết trang thì dừng
      if (allData.length === data.data.pagination.total) {
        console.log(res);
        console.log("end total")
        break;
      }
      page++;
    }
    return allData
  } catch (err: any) {
    console.error("Error fetching sku variations:", err.message);
    return []
  }
};