import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import prisma from "@/lib/prisma";

// Marks the product walkthrough (react-joyride tour) as done for the user so it
// never shows again — called when the tour is completed, skipped, or closed.
export async function POST(request) {
  const token = request.headers.get("authorization");

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = jwtDecode(token);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { tourCompleted: true },
    });

    return NextResponse.json({ message: "Tour completed" });
  } catch (error) {
    console.error("Error completing tour:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
