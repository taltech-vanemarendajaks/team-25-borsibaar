import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  const { productId } = await params;
  
  try {
    const body = await request.json();
    
    const response = await fetch(
      `${backendUrl}/api/inventory/product/${encodeURIComponent(productId)}/price`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: request.headers.get("cookie") || "",
        },
        credentials: "include",
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let message = "Failed to update price";
      try {
        const parsed = errorText ? JSON.parse(errorText) : {};
        message =
          typeof parsed.detail === "string"
            ? parsed.detail
            : typeof parsed.error === "string"
              ? parsed.error
              : errorText || message;
      } catch {
        if (errorText && !errorText.startsWith("{")) message = errorText;
      }
      return NextResponse.json(
        { error: message },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error updating price:", error);
    return NextResponse.json(
      { error: "Failed to update price" },
      { status: 500 }
    );
  }
}