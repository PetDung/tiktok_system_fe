import { useMemo } from 'react';
import { useFetch } from '@/lib/useFetch';
import { usePrinters } from '@/lib/customHooks/usePrinters';
import { 
  CategoryPrintPrinteesHub, 
  fetchSkuMKP, 
  getMangoTeeProduct, 
  getVariationsMenPrint, 
  getVariationsPrinteesHub, 
  MangoTeePrintProduct, 
  MenPrintData, 
  ProductMenPrint 
} from '@/service/print-order/getSKU';
import { getPrintShippingMethod } from '@/service/print-order/print-order-service';
import { ApiResponse } from '@/service/types/ApiResponse';
import { PrintShippMethod } from '@/service/types/PrintOrder';
import { SKUMPK } from '@/service/print-order/data';

export function usePrintOrderData() {
  const { data: printersResponse } = usePrinters();
  const { data: variationsPrinteesHubResponse } = useFetch<CategoryPrintPrinteesHub[]>({
    fetcher: getVariationsPrinteesHub,
    key: "variations-printeesHub"
  });

  const { data: SkuMPKResponse } = useFetch<SKUMPK[]>({
    fetcher: fetchSkuMKP,
    key: "variations-mpk"
  });

  const { data: productMenPrintResponse } = useFetch<MenPrintData<ProductMenPrint>>({
    fetcher: getVariationsMenPrint,
    key: "variations-menPrint"
  });

  const { data: productMangoPrint } = useFetch<MangoTeePrintProduct[]>({
    fetcher: getMangoTeeProduct,
    key: "variations-mangoTeePrint"
  });


  const { data: printShippingMethod } = useFetch<ApiResponse<PrintShippMethod[]>>({
    fetcher: getPrintShippingMethod,
    key: "print-shipping-method"
  });


  return useMemo(() => ({
    printers: printersResponse?.result ?? [],
    skuMPK: SkuMPKResponse ?? [],
    variationsPrinteesHub: variationsPrinteesHubResponse ?? [],
    productMenPrint: productMenPrintResponse?.data ?? [],
    printShippingMethods: printShippingMethod?.result ?? [],
    productMangoTeePrint: productMangoPrint ?? [],

  }), [
    printersResponse?.result,
    SkuMPKResponse,
    variationsPrinteesHubResponse,
    productMenPrintResponse?.data,
    printShippingMethod?.result,
    productMangoPrint,
  ]);
}
