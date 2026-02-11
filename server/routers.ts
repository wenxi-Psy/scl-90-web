import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { saveSclAssessment, getUserAssessments, getAnalyticsSummariesByPeriod } from "./db";
import { InsertSclAssessment } from "../drizzle/schema";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // SCL-90 Assessment Routes
  assessment: router({
    save: protectedProcedure
      .input(
        z.object({
          responses: z.array(z.number().min(1).max(5)).length(90),
          totalScore: z.number().int().nonnegative(),
          positiveItemCount: z.number().int().nonnegative(),
          averageScore: z.string(),
          factorScores: z.record(z.string(), z.number()),
          isAnonymous: z.boolean().default(false),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }

        const assessment: InsertSclAssessment = {
          userId: ctx.user.id,
          responses: input.responses,
          totalScore: input.totalScore,
          positiveItemCount: input.positiveItemCount,
          averageScore: input.averageScore,
          factorScores: input.factorScores as Record<string, number>,
          isAnonymous: input.isAnonymous ? 1 : 0,
          notes: input.notes,
        };

        await saveSclAssessment(assessment);

        return {
          success: true,
          message: "Assessment saved successfully",
        };
      }),

    getHistory: protectedProcedure
      .input(
        z.object({
          limit: z.number().int().positive().default(10),
        })
      )
      .query(async ({ input, ctx }) => {
        if (!ctx.user) {
          throw new Error("User not authenticated");
        }

        const assessments = await getUserAssessments(ctx.user.id, input.limit);

        return {
          assessments: assessments.map((a) => ({
            id: a.id,
            totalScore: a.totalScore,
            positiveItemCount: a.positiveItemCount,
            averageScore: parseFloat(a.averageScore),
            factorScores: a.factorScores as Record<string, number>,
            createdAt: a.createdAt,
          })),
          count: assessments.length,
        };
      }),
  }),

  // Analytics Routes
  analytics: router({
    getOverview: publicProcedure.query(async () => {
      const dailySummaries = await getAnalyticsSummariesByPeriod("daily", 7);

      if (dailySummaries.length === 0) {
        return {
          totalAssessments: 0,
          totalUsers: 0,
          averageTotalScore: 0,
          averagePositiveItems: 0,
          recentTrend: [],
          factorPrevalence: {},
        };
      }

      const totalAssessments = dailySummaries.reduce(
        (sum, s) => sum + s.totalAssessments,
        0
      );
      const totalUsers = dailySummaries.reduce((sum, s) => sum + s.totalUsers, 0);
      const avgTotalScore =
        dailySummaries.reduce(
          (sum, s) => sum + parseFloat(s.averageTotalScore),
          0
        ) / dailySummaries.length;
      const avgPositiveItems =
        dailySummaries.reduce(
          (sum, s) => sum + parseFloat(s.averagePositiveItems),
          0
        ) / dailySummaries.length;

      return {
        totalAssessments,
        totalUsers,
        averageTotalScore: avgTotalScore.toFixed(2),
        averagePositiveItems: avgPositiveItems.toFixed(2),
        recentTrend: dailySummaries
          .reverse()
          .map((s) => ({
            date: s.periodDate,
            assessments: s.totalAssessments,
            avgScore: parseFloat(s.averageTotalScore),
          })),
        factorPrevalence: dailySummaries[0]?.factorPrevalence || {},
      };
    }),

    getByPeriod: publicProcedure
      .input(
        z.object({
          period: z.enum(["daily", "weekly", "monthly"]),
          limit: z.number().int().positive().default(12),
        })
      )
      .query(async ({ input }) => {
        const summaries = await getAnalyticsSummariesByPeriod(
          input.period,
          input.limit
        );

        return {
          period: input.period,
          data: summaries.map((s) => ({
            date: s.periodDate,
            totalAssessments: s.totalAssessments,
            totalUsers: s.totalUsers,
            averageTotalScore: parseFloat(s.averageTotalScore),
            averagePositiveItems: parseFloat(s.averagePositiveItems),
            scoreDistribution: s.scoreDistribution as Record<string, number>,
            factorPrevalence: s.factorPrevalence as Record<string, number>,
          })),
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
