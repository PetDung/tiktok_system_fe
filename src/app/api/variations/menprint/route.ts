// app/api/variations/route.ts
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const page = req.nextUrl.searchParams.get("page") || "1";
    const response = await axios.get(`https://pubapi.menprint.com/api/v3/products?limit=100&page=${page}`, {
      headers: {
        "Authorization":process.env.PUB_TOKEN,
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
