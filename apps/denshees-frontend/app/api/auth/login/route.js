import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "@/lib/prisma";
import { trackServer } from "@/lib/analytics/server";
import { EVENTS } from "@/lib/analytics/events";

export async function POST(request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 },
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      await trackServer(EVENTS.LOGIN_FAILED, null, { reason: "unknown_email" });
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Google-created accounts have no password — block email/password login
    // until the user sets one in Settings (also avoids bcrypt.compare on null).
    if (!user.password) {
      await trackServer(EVENTS.LOGIN_FAILED, user.id, {
        reason: "google_account_no_password",
      });
      return NextResponse.json(
        {
          message:
            "This account uses Google sign-in. Set a password in Settings to enable email login.",
        },
        { status: 401 },
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      await trackServer(EVENTS.LOGIN_FAILED, user.id, {
        reason: "wrong_password",
      });
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    await trackServer(EVENTS.LOGGED_IN, user.id, {
      is_setup: user.isSetup,
      tour_completed: user.tourCompleted,
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword, token });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
