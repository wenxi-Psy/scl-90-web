import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("assessment.save", () => {
  it("saves assessment data for authenticated user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const responses = Array(90).fill(1);
    responses[0] = 2; // First question gets score 2

    const result = await caller.assessment.save({
      responses,
      totalScore: 90,
      positiveItemCount: 10,
      averageScore: "1.01",
      factorScores: {
        躯体化: 1.2,
        强迫症状: 1.0,
        人际敏感: 0.9,
        抑郁: 1.3,
        焦虑: 1.1,
        敌对: 0.8,
        恐怖: 1.0,
        偏执: 0.9,
        精神病性: 1.2,
        其他: 1.0,
      },
      isAnonymous: false,
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
    expect(result).toHaveProperty("message");
  });

  it("saves assessment with different response patterns", async () => {
    const ctx = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);

    const responses = Array(90).fill(1);
    // Mix of different scores
    responses[0] = 5; // Extreme score
    responses[44] = 3;
    responses[89] = 2;

    const result = await caller.assessment.save({
      responses,
      totalScore: 10,
      positiveItemCount: 3,
      averageScore: "0.11",
      factorScores: {
        躯体化: 0.5,
        强迫症状: 0.2,
        人际敏感: 0.1,
        抑郁: 0.3,
        焦虑: 0.2,
        敌对: 0.1,
        恐怖: 0.2,
        偏执: 0.1,
        精神病性: 0.2,
        其他: 0.1,
      },
      isAnonymous: false,
    });

    expect(result.success).toBe(true);
    expect(result).toHaveProperty("message");
  });
});

describe("assessment.getHistory", () => {
  it("retrieves assessment history for authenticated user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // First save an assessment
    await caller.assessment.save({
      responses: Array(90).fill(1),
      totalScore: 90,
      positiveItemCount: 5,
      averageScore: "1.00",
      factorScores: {
        躯体化: 1.0,
        强迫症状: 1.0,
        人际敏感: 1.0,
        抑郁: 1.0,
        焦虑: 1.0,
        敌对: 1.0,
        恐怖: 1.0,
        偏执: 1.0,
        精神病性: 1.0,
        其他: 1.0,
      },
      isAnonymous: false,
    });

    // Then retrieve history
    const result = await caller.assessment.getHistory({ limit: 10 });

    expect(result).toHaveProperty("assessments");
    expect(Array.isArray(result.assessments)).toBe(true);
    expect(result.assessments.length).toBeGreaterThan(0);
    expect(result.assessments[0]).toHaveProperty("totalScore");
    expect(result.assessments[0]).toHaveProperty("createdAt");
  });
});
