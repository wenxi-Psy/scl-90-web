import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, sclAssessments, InsertSclAssessment, sclAnalyticsSummary } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ===== SCL-90 Assessment Queries =====

/**
 * Save a new SCL-90 assessment result
 */
export async function saveSclAssessment(assessment: InsertSclAssessment) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save assessment: database not available");
    throw new Error("Database not available");
  }

  const result = await db.insert(sclAssessments).values(assessment);
  return result;
}

/**
 * Get all assessments for a user, ordered by most recent first
 */
export async function getUserAssessments(userId: number, limit = 10) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sclAssessments)
    .where(eq(sclAssessments.userId, userId))
    .orderBy(desc(sclAssessments.createdAt))
    .limit(limit);
}

/**
 * Get a single assessment by ID
 */
export async function getAssessmentById(assessmentId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(sclAssessments)
    .where(eq(sclAssessments.id, assessmentId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get analytics summary for a specific period
 */
export async function getAnalyticsSummary(period: string, periodDate: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(sclAnalyticsSummary)
    .where(
      and(
        eq(sclAnalyticsSummary.period, period),
        eq(sclAnalyticsSummary.periodDate, periodDate)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get all analytics summaries for a given period type
 */
export async function getAnalyticsSummariesByPeriod(period: string, limit = 12) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(sclAnalyticsSummary)
    .where(eq(sclAnalyticsSummary.period, period))
    .orderBy(desc(sclAnalyticsSummary.periodDate))
    .limit(limit);
}

/**
 * Get aggregate statistics across all assessments
 */
export async function getOverallStatistics() {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(sclAnalyticsSummary).limit(1);
  return result.length > 0 ? result[0] : null;
}
