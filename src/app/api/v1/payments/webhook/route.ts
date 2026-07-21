import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("monnify-signature");

    const secretKey = process.env.MONNIFY_SECRET_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!secretKey || !supabaseUrl || !supabaseServiceKey) {
      console.error("Missing webhook environment configuration variables inside Monnify Webhook endpoint");
      return NextResponse.json({ success: false, message: "Server misconfiguration" }, { status: 500 });
    }

    // 1. Verify Monnify HMAC Signature to secure the webhook
    const computedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    if (computedSignature !== signature) {
      console.warn("Invalid Monnify webhook signature rejected");
      return NextResponse.json({ success: false, message: "Invalid signature verification" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // 2. Filter transaction events
    if (payload.eventType === "SUCCESSFUL_TRANSACTION") {
      const eventData = payload.eventData;
      const paymentReference = eventData.paymentReference;
      const amountPaid = Number(eventData.amountPaid || 0);

      // Verify the pattern matches: pay_[sprintId]_[userId]_[timestamp]
      if (paymentReference && paymentReference.startsWith("pay_")) {
        const parts = paymentReference.split("_");
        if (parts.length >= 3) {
          const sprintId = parts[1];
          const userId = parts[2];

          console.log(`Processing Monnify Webhook: Sprint ${sprintId}, Builder ${userId}, Amount ${amountPaid}`);

          // Create an administrative Supabase client using Service Role Key to bypass RLS policies
          const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
              persistSession: false,
              autoRefreshToken: false,
            },
          });

          // A. Upsert registration into sprint_participants table
          const { error: upsertErr } = await supabaseAdmin
            .from("sprint_participants")
            .upsert(
              {
                sprint_id: sprintId,
                user_id: userId,
                amount_paid: amountPaid,
                payment_status: "PAID",
                payment_reference: paymentReference,
              },
              { onConflict: "sprint_id,user_id" }
            );

          if (upsertErr) {
            console.error("Supabase upsert failed inside payment webhook:", upsertErr);
            throw upsertErr;
          }

          // B. Retrieve latest metrics and increment slots/pool totals inside sprints table
          const { data: sprint, error: fetchErr } = await supabaseAdmin
            .from("sprints")
            .select("filled_slots, total_pool_ngn")
            .eq("id", sprintId)
            .single();

          if (fetchErr) {
            console.error("Supabase select failed inside payment webhook:", fetchErr);
            throw fetchErr;
          }

          if (sprint) {
            const { error: updateErr } = await supabaseAdmin
              .from("sprints")
              .update({
                filled_slots: (sprint.filled_slots || 0) + 1,
                total_pool_ngn: (sprint.total_pool_ngn || 0) + amountPaid,
              })
              .eq("id", sprintId);

            if (updateErr) {
              console.error("Supabase update failed inside payment webhook:", updateErr);
              throw updateErr;
            }
          }

          console.log(`Successfully verified payment and updated metrics for Sprint: ${sprintId}`);
        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook successfully executed and verified" });
  } catch (err: any) {
    console.error("Monnify payment webhook execution error:", err);
    return NextResponse.json({ success: false, message: err.message || "Failed to process webhook" }, { status: 500 });
  }
}
