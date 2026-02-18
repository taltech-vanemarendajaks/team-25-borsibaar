import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${backendUrl}/api/bar-stations/user`, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch user bar stations" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user bar stations:", error);
    return NextResponse.json({ error: "Failed to fetch user bar stations" }, { status: 500 });
  }
}
