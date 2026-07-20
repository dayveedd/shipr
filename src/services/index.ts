import {
  MockSprintService,
  MockSubmissionService,
  MockUserService,
  MockSettlementService,
  MockLeaderboardService,
} from "./mockAdapter";
import {
  LiveSprintService,
  LiveSubmissionService,
  LiveUserService,
  LiveSettlementService,
  LiveLeaderboardService,
} from "./liveAdapter";
import {
  ISprintService,
  ISubmissionService,
  IUserService,
  ISettlementService,
  ILeaderboardService,
} from "./interfaces";

const useMock = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

export const sprintService: ISprintService = useMock
  ? new MockSprintService()
  : new LiveSprintService();

export const submissionService: ISubmissionService = useMock
  ? new MockSubmissionService()
  : new LiveSubmissionService();

export const userService: IUserService = useMock
  ? new MockUserService()
  : new LiveUserService();

export const settlementService: ISettlementService = useMock
  ? new MockSettlementService()
  : new LiveSettlementService();

export const leaderboardService: ILeaderboardService = useMock
  ? new MockLeaderboardService()
  : new LiveLeaderboardService();

export * from "./interfaces";
export * from "./mockData";
