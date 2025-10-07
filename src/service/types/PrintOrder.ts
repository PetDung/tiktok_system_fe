export interface PrintSkuRequest{
    skuCode: string;
    type: string;
    value1: string;
    value2 : string;
    value3: string | null;
    value4: string | null;
}

export interface PrintShippMethod {
    type : string;
    printCode : string;
}