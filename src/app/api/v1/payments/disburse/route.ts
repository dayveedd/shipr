import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { initiateDisbursementTransfer } from "@/lib/monnify";

export async function POST(request: Request) {
  try {
    // 1. Authenticate user session
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json({ success: false, message: "Authorization header is required" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: "Server misconfiguration" }, { status: 500 });
    }

    // Authenticate with user token to get userId
    const tempClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "");
    const { data: { user }, error: authErr } = await tempClient.auth.getUser(token);

    if (authErr || !user) {
      return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 401 });
    }

    // 2. Parse payload
    const body = await request.json();
    const { sprintId, bankCode, accountNumber, accountName } = body;

    if (!sprintId || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json(
        { success: false, message: "sprintId, bankCode, accountNumber, and accountName are required parameters" },
        { status: 400 }
      );
    }

    // Create admin client to bypass user RLS
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // 3. Verify payout eligibility in sprint_participants
    const { data: participant, error: fetchErr } = await supabaseAdmin
      .from("sprint_participants")
      .select("*")
      .eq("sprint_id", sprintId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchErr) {
      console.error("Error fetching participant registration:", fetchErr);
      throw fetchErr;
    }

    if (!participant) {
      return NextResponse.json({ success: false, message: "You did not register for this sprint" }, { status: 404 });
    }

    if (participant.payment_status !== "PAID") {
      return NextResponse.json({ success: false, message: "No successful entry payment recorded for this sprint" }, { status: 400 });
    }

    if (participant.payout_status !== "UNCLAIMED") {
      return NextResponse.json({ success: false, message: `Your payout status is already: ${participant.payout_status}` }, { status: 400 });
    }

    const payoutAmount = Number(participant.payout_amount || 0);
    if (payoutAmount <= 0) {
      return NextResponse.json({ success: false, message: "No payout funds are available for this participant" }, { status: 400 });
    }

    // 4. Generate unique transfer reference
    const payoutReference = `out_${sprintId.substring(0, 10)}_${user.id.substring(0, 8)}_${Date.now()}`;

    console.log(`Initiating Monnify Single Payout: Ref ${payoutReference}, Amount ${payoutAmount}, Bank ${bankCode}, Acc ${accountNumber}`);

    // 5. Execute Monnify Disbursement Payout
    const disbursementResult = await initiateDisbursementTransfer(
      payoutAmount,
      payoutReference,
      bankCode,
      accountNumber,
      accountName
    );

    // 6. Update database record to CLAIMED
    const { error: updateErr } = await supabaseAdmin
      .from("sprint_participants")
      .update({
        payout_status: "CLAIMED",
        payout_reference: payoutReference,
        destination_bank_code: bankCode,
        destination_account_number: accountNumber,
        destination_account_name: accountName,
      })
      .eq("id", participant.id);

    if (updateErr) {
      console.error("Error updating payout claiming records in Supabase:", updateErr);
      // Payout completed on Monnify, so we throw to make sure it doesn't get lost
      throw updateErr;
    }

    return NextResponse.json({
      success: true,
      message: "Payout disbursed successfully",
      data: {
        amount: payoutAmount,
        status: disbursementResult.status,
        reference: payoutReference,
      },
    });
  } catch (err: any) {
    console.error("Payout disbursement pipeline failed:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to execute payout disbursement" },
      { status: 500 }
    );
  }
}
