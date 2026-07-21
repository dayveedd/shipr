import { ExecutionRank, User } from "@/types";

/**
 * Calculates deterministic Execution Rank based on completed sprints and success rate.
 * - Bronze Shipper: Default (< 3 sprints or < 70% success)
 * - Silver Shipper: 3+ sprints & >= 70% success
 * - Gold Shipper: 8+ sprints & >= 85% success
 * - Elite Shipper: 15+ sprints & >= 92% success
 */
export function calculateExecutionRank(
  sprintsCompleted: number,
  successRate: number
): ExecutionRank {
  if (sprintsCompleted >= 15 && successRate >= 92) {
    return "ELITE";
  }
  if (sprintsCompleted >= 8 && successRate >= 85) {
    return "GOLD";
  }
  if (sprintsCompleted >= 3 && successRate >= 70) {
    return "SILVER";
  }
  return "BRONZE";
}

export interface SettlementCalculationInput {
  sprintId: string;
  sprintTitle: string;
  commitmentNgn: number;
  totalParticipants: number;
  passCount: number;
  failCount: number;
  neverSubmittedCount?: number;
}

export interface CalculatedSettlement {
  sprintId: string;
  sprintTitle: string;
  totalPoolNgn: number;
  totalParticipants: number;
  passCount: number;
  failCount: number;
  neverSubmittedCount: number;
  initialStakeRefundNgn: number;
  redistributedBonusNgn: number;
  totalReturnPerPassNgn: number;
  refundPerFailNgn: number;
  settledAt: string;
}

/**
 * Calculates pool distribution according to 50/50 failure split:
 * - PASS: 100% original stake refund + equal share of forfeited 50% from failed/unsubmitted participants.
 * - FAIL / NEVER SUBMITTED: 50% refund returned, 50% forfeited to winners' pool.
 */
export function calculatePoolSettlement(
  input: SettlementCalculationInput
): CalculatedSettlement {
  const totalPoolNgn = input.commitmentNgn * input.totalParticipants;
  const initialStakeRefundNgn = input.commitmentNgn;
  const unsubmitted = input.neverSubmittedCount ?? Math.max(0, input.totalParticipants - input.passCount - input.failCount);
  const totalFailedCount = input.failCount + unsubmitted;

  // 50% of stake forfeited per failed/unsubmitted participant
  const forfeitedPerFailNgn = Math.floor(input.commitmentNgn * 0.5);
  const refundPerFailNgn = input.commitmentNgn - forfeitedPerFailNgn;
  const totalForfeitedPoolNgn = totalFailedCount * forfeitedPerFailNgn;

  // Distribute forfeited 50% pool evenly among PASS participants (if passCount > 0)
  const redistributedBonusNgn =
    input.passCount > 0 ? Math.floor(totalForfeitedPoolNgn / input.passCount) : 0;
  const totalReturnPerPassNgn = initialStakeRefundNgn + redistributedBonusNgn;

  return {
    sprintId: input.sprintId,
    sprintTitle: input.sprintTitle,
    totalPoolNgn,
    totalParticipants: input.totalParticipants,
    passCount: input.passCount,
    failCount: input.failCount,
    neverSubmittedCount: unsubmitted,
    initialStakeRefundNgn,
    redistributedBonusNgn,
    totalReturnPerPassNgn,
    refundPerFailNgn,
    settledAt: new Date().toISOString(),
  };
}

/**
 * Updates a user profile object after a new sprint evaluation result.
 */
export function updateUserReputation(
  currentUser: User,
  result: "PASS" | "FAIL",
  earnedNgn: number
): User {
  const newSprintsCompleted = currentUser.sprintsCompleted + 1;
  const previousPassed = Math.round(
    (currentUser.successRate / 100) * currentUser.sprintsCompleted
  );
  const newPassed = result === "PASS" ? previousPassed + 1 : previousPassed;
  const newSuccessRate = Math.round((newPassed / newSprintsCompleted) * 100);

  const newCurrentStreak = result === "PASS" ? currentUser.currentStreak + 1 : 0;
  const newLongestStreak = Math.max(currentUser.longestStreak, newCurrentStreak);
  const newTotalEarned = currentUser.totalEarnedNgn + (result === "PASS" ? earnedNgn : 0);
  const newRank = calculateExecutionRank(newSprintsCompleted, newSuccessRate);

  return {
    ...currentUser,
    sprintsCompleted: newSprintsCompleted,
    successRate: newSuccessRate,
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    totalEarnedNgn: newTotalEarned,
    rank: newRank,
  };
}
