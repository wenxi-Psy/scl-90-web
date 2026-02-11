import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import type { User } from "../drizzle/schema";

// Mock the database functions
vi.mock("./db", () => ({
  saveSclAssessment: vi.fn().mockResolvedValue({ insertId: 1 }),
  getUserAssessments: vi.fn().mockResolvedValue([
    {
      id: 1,
      userId: 1,
      responses: Array(90).fill(2),
      totalScore: 180,
      positiveItemCount: 45,
      averageScore: "2.00",
      factorScores: {
        躯体化: 2.0,
        强迫症状: 1.8,
        人际敏感: 1.5,
        抑郁: 2.2,
        焦虑: 1.9,
        敌对: 1.6,
        恐怖: 1.7,
        偏执: 1.4,
        精神病性: 1.8,
        其他: 1.9,
      },
      isAnonymous: 0,
      notes: null,
      createdAt: new Date("2026-02-11"),
      updatedAt: new Date("2026-02-11"),
    },
  ]),
  getAnalyticsSummariesByPeriod: vi.fn().mockResolvedValue([]),
}));

function createAuthContext(): { ctx: TrpcContext; user: User } {
  const user: User = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx, user };
}

describe("assessment.save", () => {
  it("should save assessment with valid input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const responses = Array(90).fill(2);
    const result = await caller.assessment.save({
      responses,
      totalScore: 180,
      positiveItemCount: 45,
      averageScore: "2.00",
      factorScores: {
        躯体化: 2.0,
        强迫症状: 1.8,
        人际敏感: 1.5,
        抑郁: 2.2,
        焦虑: 1.9,
        敌对: 1.6,
        恐怖: 1.7,
        偏执: 1.4,
        精神病性: 1.8,
        其他: 1.9,
      },
      isAnonymous: false,
    });

    expect(result.success).toBe(true);
    expect(result.message).toBe("Assessment saved successfully");
  });

  it("should reject assessment with invalid response count", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const responses = Array(89).fill(2); // Wrong count

    await expect(
      caller.assessment.save({
        responses: responses as any,
        totalScore: 180,
        positiveItemCount: 45,
        averageScore: "2.00",
        factorScores: {},
      })
    ).rejects.toThrow();
  });

  it("should reject assessment with out-of-range response values", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const responses = Array(90).fill(6); // Invalid: should be 1-5

    await expect(
      caller.assessment.save({
        responses: responses as any,
        totalScore: 180,
        positiveItemCount: 45,
        averageScore: "2.00",
        factorScores: {},
      })
    ).rejects.toThrow();
  });

  it("should reject unauthenticated requests", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    const responses = Array(90).fill(2);

    await expect(
      caller.assessment.save({
        responses,
        totalScore: 180,
        positiveItemCount: 45,
        averageScore: "2.00",
        factorScores: {},
      })
    ).rejects.toThrow();
  });
});

describe("assessment.getHistory", () => {
  it("should retrieve user assessment history", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.assessment.getHistory({ limit: 10 });

    expect(result.count).toBe(1);
    expect(result.assessments).toHaveLength(1);
    expect(result.assessments[0].totalScore).toBe(180);
    expect(result.assessments[0].positiveItemCount).toBe(45);
  });

  it("should respect limit parameter", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.assessment.getHistory({ limit: 5 });

    expect(result.count).toBeGreaterThanOrEqual(0);
  });

  it("should reject unauthenticated requests", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.assessment.getHistory({ limit: 10 })
    ).rejects.toThrow();
  });
});

describe("analytics.getOverview", () => {
  it("should return analytics overview with empty data", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.analytics.getOverview();

    expect(result.totalAssessments).toBe(0);
    expect(result.totalUsers).toBe(0);
    expect(result.recentTrend).toEqual([]);
  });
});

describe("analytics.getByPeriod", () => {
  it("should retrieve analytics by period", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);
    const result = await caller.analytics.getByPeriod({
      period: "daily",
      limit: 7,
    });

    expect(result.period).toBe("daily");
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("should validate period enum", async () => {
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };

    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.analytics.getByPeriod({
        period: "invalid" as any,
        limit: 7,
      })
    ).rejects.toThrow();
  });
});
