// app/api/variations/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get("page") || 1;
    const product_id = req.nextUrl.searchParams.get("product_id") || 1;
    const response = 
      await axios.get(
        `https://v3.mangoteeprints.com/api/public/v1/products/${product_id}/variations?&limit=100&page=${page}`,
     {
      headers: {
        "X-API-Key":process.env.MANGOTEE_TOKEN,
        "Content-Type": "application/json",
      },
    });
    return NextResponse.json(response.data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: error.response?.status || 500 }
    );
  }
}
