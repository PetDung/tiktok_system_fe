import { cookies } from "next/headers";
import Cookies from "js-cookie";

// Lấy token từ cookie (server hoặc client)
export async function getToken() {
  if (typeof window === "undefined") {
    // Server side
    const cookieStore = await cookies(); // <- await ở đây
    return cookieStore.get("token")?.value || null;
  } else {
    // Client side
    return Cookies.get("token") || null;
  }
}
