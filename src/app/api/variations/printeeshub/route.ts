import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(req: NextRequest) {
  try {
    const response = await axios.get("https://printeeshub.com/api/v1/variations", {
      headers: {
        "X-API-Key":"auth "+process.env.PRINTEESHUB_TOKEN,
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
