import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const transactionRef = `MNF_TX_${Date.now()}`;

  return NextResponse.json({
    success: true,
    message: "Monnify commitment checkout session created",
    data: {
      checkoutUrl: `https://sandbox.monnify.com/checkout/${transactionRef}`,
      transactionRef,
      sprintSlug: slug,
    },
  });
}
