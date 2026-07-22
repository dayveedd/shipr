import { NextResponse } from "next/server";
import { validateBankAccount } from "@/lib/monnify";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const accountNumber = searchParams.get("accountNumber");
    const bankCode = searchParams.get("bankCode");

    if (!accountNumber || !bankCode) {
      return NextResponse.json(
        { success: false, message: "Missing accountNumber or bankCode parameter" },
        { status: 400 }
      );
    }

    const validated = await validateBankAccount(accountNumber, bankCode);
    return NextResponse.json({ success: true, message: "Account validated successfully", data: validated });
  } catch (err: any) {
    console.error("Error validating bank account:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Account name lookup failed" },
      { status: 500 }
    );
  }
}
