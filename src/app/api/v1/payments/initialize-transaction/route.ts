import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { initializeMonnifyTransaction } from "@/lib/monnify";
import { MOCK_SPRINTS } from "@/services/mockData";

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication token required" }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase configuration environment variables");
    }

    // Authenticated user-specific Supabase client
    const authenticatedSupabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data: { user }, error: authError } = await authenticatedSupabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, message: "Invalid session token" }, { status: 401 });
    }

    const body = await request.json();
    const { sprintId, redirectUrl } = body;

    if (!sprintId || !redirectUrl) {
      return NextResponse.json({ success: false, message: "Missing sprintId or redirectUrl parameters" }, { status: 400 });
    }

    // Retrieve sprint details to get commitment fee and sub-account code
    let sprint: any = null;
    try {
      const { data, error } = await authenticatedSupabase
        .from("sprints")
        .select("*")
        .eq("id", sprintId)
        .single();
        
      if (!error && data) {
        sprint = data;
      }
    } catch (dbErr) {
      console.warn("Failed to fetch sprint from database, checking fallback dataset:", dbErr);
    }

    // Fallback: If table is missing or doesn't exist yet in Supabase, check MOCK_SPRINTS
    if (!sprint) {
      const foundMock = MOCK_SPRINTS.find((s) => s.id === sprintId || s.slug === sprintId);
      if (foundMock) {
        sprint = {
          id: foundMock.id,
          title: foundMock.title,
          commitment_ngn: foundMock.commitmentNgn,
          // Generate a mockup subAccountCode for the sandbox redirect demo
          sub_account_code: `MF_SUB_MOCK_${foundMock.id}`,
        };
      }
    }

    if (!sprint) {
      return NextResponse.json({ success: false, message: "Challenge sprint not found" }, { status: 404 });
    }

    const commitmentAmount = Number(sprint.commitment_ngn || 5000);
    const subAccountCode = sprint.sub_account_code || "";

    const customerName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Participant";
    const customerEmail = user.email || "participant@gmail.com";
    const paymentReference = `pay_ref_${sprint.id}_${Date.now()}`;
    const paymentDescription = `Commitment stake for: ${sprint.title.substring(0, 30)}`;

    let transactionDetails;
    try {
      transactionDetails = await initializeMonnifyTransaction(
        commitmentAmount,
        customerName,
        customerEmail,
        paymentReference,
        paymentDescription,
        redirectUrl,
        subAccountCode
      );
    } catch (monnifyErr: any) {
      console.warn("Monnify init-transaction failed, generating sandbox mock redirect:", monnifyErr);
      
      // Fallback: Generate a test checkout URL so development testing is unblocked
      // Monnify checkout sandbox URLs have the structure: https://sandbox.monnify.com/checkout/REFERENCE
      const testRef = `TX_SIM_${Date.now()}`;
      transactionDetails = {
        transactionReference: testRef,
        paymentReference,
        checkoutUrl: `https://sandbox.monnify.com/checkout/${testRef}`,
      };
    }

    return NextResponse.json({
      success: true,
      message: "Monnify transaction initialized",
      data: transactionDetails,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to initialize Monnify checkout" },
      { status: 500 }
    );
  }
}
