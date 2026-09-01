import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import prisma from "@/lib/prisma";

// One-off reward for starring the repo. Recorded as a CreditTransaction of this
// type, which is also what makes the claim idempotent — there is no separate
// "claimed" flag on the user.
const STAR_CREDIT_TYPE = "github_star";
const STAR_CREDIT_AMOUNT = 1000;

function userIdFromRequest(request) {
  const token = request.headers.get("authorization");
  if (!token) return null;
  try {
    return jwtDecode(token)?.userId ?? null;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const userId = userIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const claim = await prisma.creditTransaction.findFirst({
      where: { userId, type: STAR_CREDIT_TYPE },
    });

    return NextResponse.json({
      claimed: Boolean(claim),
      amount: STAR_CREDIT_AMOUNT,
      claimedAt: claim?.created ?? null,
    });
  } catch (error) {
    console.error("[API] Error reading star credit claim:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const userId = userIdFromRequest(request);

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const existing = await prisma.creditTransaction.findFirst({
      where: { userId, type: STAR_CREDIT_TYPE },
    });

    if (existing) {
      return NextResponse.json(
        { message: "You have already claimed these credits", claimed: true },
        { status: 409 },
      );
    }

    // Credit grant and its ledger row move together so a failure can't leave
    // credits handed out with nothing recording the claim.
    const [user] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { credits: { increment: STAR_CREDIT_AMOUNT } },
      }),
      prisma.creditTransaction.create({
        data: {
          userId,
          amount: STAR_CREDIT_AMOUNT,
          type: STAR_CREDIT_TYPE,
          timestamp: new Date(),
        },
      }),
    ]);

    return NextResponse.json({
      claimed: true,
      amount: STAR_CREDIT_AMOUNT,
      credits: user.credits,
    });
  } catch (error) {
    console.error("[API] Error claiming star credits:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
