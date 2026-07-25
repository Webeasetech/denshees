import { NextResponse } from "next/server";
import { jwtDecode } from "jwt-decode";
import prisma from "@/lib/prisma";
import { activeCampaignWhere } from "@/lib/credential-usage";

export async function DELETE(request, { params }) {
  const token = request.headers.get("authorization");
  const { id } = params;

  try {
    const user = jwtDecode(token);

    const credential = await prisma.emailCredential.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!credential || credential.userId !== user.userId) {
      return NextResponse.json(
        { message: "Credential not found" },
        { status: 404 },
      );
    }

    // Block deletion while the credential is still selected in an active
    // campaign. The user must unselect it from those campaigns first.
    const activeCampaignCount = await prisma.campaignEmailCredential.count({
      where: {
        emailCredentialId: id,
        ...activeCampaignWhere(),
      },
    });

    if (activeCampaignCount > 0) {
      return NextResponse.json(
        {
          message: `This credential is used in ${activeCampaignCount} active campaign${
            activeCampaignCount === 1 ? "" : "s"
          }.`,
          activeCampaignCount,
        },
        { status: 409 },
      );
    }

    // Safe to remove. Clear any leftover join rows from finished/deleted
    // campaigns first (the FK is ON DELETE RESTRICT), then delete the
    // credential. Sticky-sender references on sent emails (campaigns_email.cred)
    // are ON DELETE SET NULL and clear automatically.
    await prisma.$transaction([
      prisma.campaignEmailCredential.deleteMany({
        where: { emailCredentialId: id },
      }),
      prisma.emailCredential.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "Credential removed" });
  } catch (error) {
    console.error("[API] Error deleting email credential:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
