import { NextRequest, NextResponse } from "next/server";
import { backendUrl } from "@/utils/constants";

export async function POST(request: NextRequest) {
  try {
    // Call backend logout endpoint to invalidate session
    await fetch(`${backendUrl}/auth/logout`, {
      method: "POST",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
    });

    // Create response
    const response = NextResponse.json(
      { success: true, message: "Logged out successfully" },
      { status: 200 },
    );

    // Clear the JWT cookie (backend also does this, but we do it here too for redundancy)
    response.cookies.set("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    // Even if backend fails, clear the cookie
    const response = NextResponse.json(
      { success: false, message: "Logout failed" },
      { status: 500 },
    );

    response.cookies.set("jwt", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    return response;
  }
}
