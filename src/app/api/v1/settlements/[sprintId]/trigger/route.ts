import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { calculatePoolSettlement } from "@/lib/reputation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sprintId: string }> }
) {
  try {
    const { sprintId } = await params;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, message: "Server misconfiguration" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    // 1. Fetch Sprint Details
    const { data: sprint, error: sprintErr } = await supabaseAdmin
      .from("sprints")
      .select("*")
      .eq("id", sprintId)
      .maybeSingle();

    if (sprintErr || !sprint) {
      return NextResponse.json({ success: false, message: "Sprint not found" }, { status: 404 });
    }

    // 2. Fetch all participants who successfully joined/paid
    const { data: participants, error: partErr } = await supabaseAdmin
      .from("sprint_participants")
      .select("*")
      .eq("sprint_id", sprintId)
      .eq("payment_status", "PAID");

    if (partErr) {
      console.error("Error fetching participants:", partErr);
      throw partErr;
    }

    if (!participants || participants.length === 0) {
      return NextResponse.json({ success: false, message: "No active participants found in commitment pool to settle" }, { status: 400 });
    }

    // 3. Fetch submissions for this sprint ordered by submission date (ascending)
    const { data: submissions, error: subErr } = await supabaseAdmin
      .from("submissions")
      .select("user_id, stage, submitted_at")
      .eq("sprint_id", sprintId)
      .order("submitted_at", { ascending: true });

    if (subErr) {
      console.error("Error fetching submissions:", subErr);
      throw subErr;
    }

    // Create maps to locate passed users
    const submissionMap = new Map<string, string>();
    if (submissions) {
      submissions.forEach((sub) => {
        submissionMap.set(sub.user_id, sub.stage);
      });
    }

    // 4. Determine passed & failed builders list
    let passCount = 0;
    let failCount = 0;
    let neverSubmittedCount = 0;

    const participantResults = participants.map((part) => {
      const stage = submissionMap.get(part.user_id);
      const passed = Boolean(part.is_eligible);

      if (passed) {
        passCount++;
      } else {
        if (stage) {
          failCount++;
        } else {
          neverSubmittedCount++;
        }
      }

      return {
        id: part.id,
        user_id: part.user_id,
        passed,
      };
    });

    // 5. Calculate Pool Distribution using the 50/50 failure split logic
    const totalParticipants = participants.length;
    const settlement = calculatePoolSettlement({
      sprintId: sprint.id,
      sprintTitle: sprint.title,
      commitmentNgn: Number(sprint.commitment_ngn || 5000),
      totalParticipants,
      passCount,
      failCount,
      neverSubmittedCount,
    });

    // 6. Save calculation summary to settlement_summaries table
    const { error: summaryErr } = await supabaseAdmin
      .from("settlement_summaries")
      .upsert({
        sprint_id: sprint.id,
        sprint_title: sprint.title,
        total_pool_ngn: settlement.totalPoolNgn,
        total_participants: settlement.totalParticipants,
        pass_count: settlement.passCount,
        fail_count: settlement.failCount + settlement.neverSubmittedCount,
        initial_stake_refund_ngn: settlement.initialStakeRefundNgn,
        redistributed_bonus_ngn: settlement.redistributedBonusNgn,
        total_return_per_pass_ngn: settlement.totalReturnPerPassNgn,
        settled_at: new Date().toISOString(),
      });

    if (summaryErr) {
      console.error("Error creating settlement summary:", summaryErr);
      throw summaryErr;
    }

    // 7. Update each builder's payout_amount and payout_status in sprint_participants
    for (const res of participantResults) {
      const payoutAmount = res.passed
        ? settlement.totalReturnPerPassNgn
        : settlement.refundPerFailNgn;

      const { error: updatePartErr } = await supabaseAdmin
        .from("sprint_participants")
        .update({
          payout_amount: payoutAmount,
          payout_status: "UNCLAIMED",
        })
        .eq("id", res.id);

      if (updatePartErr) {
        console.error(`Error updating participant ${res.user_id} settlement:`, updatePartErr);
        throw updatePartErr;
      }
    }

    // 8. Update sprint status to SETTLED
    const { error: updateSprintErr } = await supabaseAdmin
      .from("sprints")
      .update({
        status: "SETTLED",
        pass_count: passCount,
        fail_count: failCount + neverSubmittedCount,
      })
      .eq("id", sprintId);

    if (updateSprintErr) {
      console.error("Error updating sprint status:", updateSprintErr);
      throw updateSprintErr;
    }

    return NextResponse.json({
      success: true,
      message: "Sprint settled and redistributed successfully",
      data: settlement,
    });
  } catch (err: any) {
    console.error("Triggering settlement failed:", err);
    return NextResponse.json(
      { success: false, message: err.message || "Failed to trigger pool settlement" },
      { status: 500 }
    );
  }
}
