import { int, json, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * SCL-90 Assessment Results Table
 * Stores individual assessment responses and calculated scores
 */
export const sclAssessments = mysqlTable("scl_assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Raw responses: array of 90 scores (1-5 for each question)
  responses: json("responses").$type<number[]>().notNull(),
  
  // Calculated metrics
  totalScore: int("totalScore").notNull(),
  positiveItemCount: int("positiveItemCount").notNull(),
  averageScore: varchar("averageScore", { length: 10 }).notNull(), // e.g., "1.45"
  
  // Factor scores (10 dimensions)
  factorScores: json("factorScores").$type<Record<string, number>>().notNull(),
  
  // Metadata
  isAnonymous: int("isAnonymous").default(0).notNull(), // 0 = false, 1 = true
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SclAssessment = typeof sclAssessments.$inferSelect;
export type InsertSclAssessment = typeof sclAssessments.$inferInsert;

/**
 * Analytics Summary Table
 * Pre-calculated aggregate statistics for dashboard
 */
export const sclAnalyticsSummary = mysqlTable("scl_analytics_summary", {
  id: int("id").autoincrement().primaryKey(),
  
  // Time period
  period: varchar("period", { length: 20 }).notNull(), // "daily", "weekly", "monthly"
  periodDate: varchar("periodDate", { length: 20 }).notNull(), // "2026-02-11", "2026-W06", "2026-02"
  
  // Aggregate metrics
  totalAssessments: int("totalAssessments").notNull(),
  totalUsers: int("totalUsers").notNull(),
  averageTotalScore: varchar("averageTotalScore", { length: 10 }).notNull(),
  averagePositiveItems: varchar("averagePositiveItems", { length: 10 }).notNull(),
  
  // Distribution of scores
  scoreDistribution: json("scoreDistribution").$type<Record<string, number>>().notNull(), // e.g., { "normal": 45, "warning": 12, "critical": 3 }
  
  // Factor prevalence (which dimensions are most commonly elevated)
  factorPrevalence: json("factorPrevalence").$type<Record<string, number>>().notNull(),
  
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SclAnalyticsSummary = typeof sclAnalyticsSummary.$inferSelect;
export type InsertSclAnalyticsSummary = typeof sclAnalyticsSummary.$inferInsert;