import { NextResponse } from "next/server";
import { MOCK_LEADERBOARD } from "@/services/mockData";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "allTime";

    // Attempt Supabase fetch
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("*")
      .order("total_earned_ngn", { ascending: false })
      .limit(50);

    if (!error && profiles && profiles.length > 0) {
      const leaderboardEntries = profiles.map((p, idx) => ({
        rankPosition: idx + 1,
        user: {
          id: p.id,
          githubUsername: p.github_username,
          name: p.name,
          avatarUrl: p.avatar_url,
          role: p.role,
          rank: p.rank,
          totalEarnedNgn: Number(p.total_earned_ngn || 0),
          sprintsCompleted: Number(p.sprints_completed || 0),
          currentStreak: Number(p.current_streak || 0),
          longestStreak: Number(p.longest_streak || 0),
          successRate: Number(p.success_rate || 100),
          joinedAt: p.joined_at,
          isVerifiedCreator: p.is_verified_creator,
          creatorVerificationStatus: p.creator_verification_status,
        },
        totalEarnedNgn: Number(p.total_earned_ngn || 0),
        successRate: Number(p.success_rate || 100),
        streak: Number(p.current_streak || 0),
        completedSprintsCount: Number(p.sprints_completed || 0),
      }));

      return NextResponse.json({
        success: true,
        message: `Leaderboard fetched (${timeframe})`,
        data: leaderboardEntries,
      });
    }

    // Fallback to MOCK_LEADERBOARD sorted dynamically
    const sorted = [...MOCK_LEADERBOARD].sort((a, b) => b.totalEarnedNgn - a.totalEarnedNgn);
    const ranked = sorted.map((entry, index) => ({
      ...entry,
      rankPosition: index + 1,
    }));

    return NextResponse.json({
      success: true,
      message: `Leaderboard retrieved successfully (${timeframe})`,
      data: ranked,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
