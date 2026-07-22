import { NextResponse } from "next/server";
import { getMonnifyBanks } from "@/lib/monnify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const banks = await getMonnifyBanks();
    return NextResponse.json({ success: true, message: "Banks fetched successfully", data: banks });
  } catch (err: any) {
    console.error("Error fetching Monnify banks:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch bank list" },
      { status: 500 }
    );
  }
}
