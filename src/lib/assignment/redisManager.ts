// ============================================
// FILE 1: src/lib/assignment/redisManager.ts
// ============================================
// WHY: Handles fast volunteer selection and workload tracking
// WHAT: Uses Redis sorted sets for O(log n) volunteer selection

import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

export class AssignmentManager {
  private readonly VOLUNTEER_LOAD_KEY = "volunteer:workload";
  private readonly REPORT_ASSIGNMENTS_KEY = (reportId: string) =>
    `report:${reportId}:volunteers`;
  private readonly VOLUNTEER_REPORTS_KEY = (volunteerId: string) =>
    `volunteer:${volunteerId}:reports`;

  /**
   * Register volunteer in the system
   * Call this when volunteer role is assigned
   */
  async registerVolunteer(
    volunteerId: string,
    reputation: number = 100
  ): Promise<void> {
    await redis.zadd(this.VOLUNTEER_LOAD_KEY, 0, volunteerId);
    await redis.hset(`volunteer:${volunteerId}:meta`, {
      reputation,
      lastActive: Date.now(),
    });
    console.log(`✅ Registered volunteer ${volunteerId} in Redis`);
  }

  /**
   * Select N volunteers with lowest workload
   */
  async selectVolunteers(
    count: number,
    excludeIds: string[] = []
  ): Promise<string[]> {
    // Get all volunteers sorted by workload (ascending)
    const volunteers = await redis.zrange(
      this.VOLUNTEER_LOAD_KEY,
      0,
      -1,
      "WITHSCORES"
    );

    const eligible: Array<{ id: string; load: number; reputation: number }> =
      [];

    for (let i = 0; i < volunteers.length; i += 2) {
      const volunteerId = volunteers[i];
      const load = parseInt(volunteers[i + 1] || "0");

      if (excludeIds.includes(volunteerId)) continue;

      const meta = await redis.hgetall(`volunteer:${volunteerId}:meta`);
      const reputation = parseInt(meta.reputation || "100");
      const lastActive = parseInt(meta.lastActive || "0");

      // Skip inactive volunteers (>24h)
      if (Date.now() - lastActive > 24 * 60 * 60 * 1000) continue;

      eligible.push({ id: volunteerId, load, reputation });
    }

    // Sort by: load (asc), then reputation (desc)
    eligible.sort((a, b) => {
      if (a.load !== b.load) return a.load - b.load;
      return b.reputation - a.reputation;
    });

    const selected = eligible.slice(0, count).map((v) => v.id);
    console.log(
      `📊 Selected ${selected.length} volunteers from ${eligible.length} eligible`
    );
    return selected;
  }

  /**
   * Assign report to volunteers (update Redis tracking)
   */
  async assignReport(reportId: string, volunteerIds: string[]): Promise<void> {
    const pipeline = redis.pipeline();

    for (const volunteerId of volunteerIds) {
      // Add to volunteer's reports set
      pipeline.sadd(this.VOLUNTEER_REPORTS_KEY(volunteerId), reportId);

      // Add to report's volunteers set
      pipeline.sadd(this.REPORT_ASSIGNMENTS_KEY(reportId), volunteerId);

      // Increment workload
      pipeline.zincrby(this.VOLUNTEER_LOAD_KEY, 1, volunteerId);
    }

    await pipeline.exec();
  }

  /**
   * Complete assignment (volunteer verified report)
   */
  async completeAssignment(
    reportId: string,
    volunteerId: string
  ): Promise<void> {
    const pipeline = redis.pipeline();

    pipeline.srem(this.VOLUNTEER_REPORTS_KEY(volunteerId), reportId);
    pipeline.srem(this.REPORT_ASSIGNMENTS_KEY(reportId), volunteerId);
    pipeline.zincrby(this.VOLUNTEER_LOAD_KEY, -1, volunteerId);

    await pipeline.exec();
  }

  /**
   * Remove report from all volunteers (when verified/threshold reached)
   * Returns list of volunteer IDs to notify
   */
  async expireReport(reportId: string): Promise<string[]> {
    const volunteerIds = await redis.smembers(
      this.REPORT_ASSIGNMENTS_KEY(reportId)
    );

    if (volunteerIds.length === 0) return [];

    const pipeline = redis.pipeline();

    for (const volunteerId of volunteerIds) {
      pipeline.srem(this.VOLUNTEER_REPORTS_KEY(volunteerId), reportId);
      pipeline.zincrby(this.VOLUNTEER_LOAD_KEY, -1, volunteerId);
    }

    pipeline.del(this.REPORT_ASSIGNMENTS_KEY(reportId));

    await pipeline.exec();

    return volunteerIds;
  }

  /**
   * Get volunteer's assigned report IDs
   */
  async getVolunteerReports(volunteerId: string): Promise<string[]> {
    return await redis.smembers(this.VOLUNTEER_REPORTS_KEY(volunteerId));
  }

  /**
   * Check if report is assigned to volunteer
   */
  async isAssigned(reportId: string, volunteerId: string): Promise<boolean> {
    return (
      (await redis.sismember(
        this.VOLUNTEER_REPORTS_KEY(volunteerId),
        reportId
      )) === 1
    );
  }

  /**
   * Update volunteer last active timestamp
   */
  async updateActivity(volunteerId: string): Promise<void> {
    await redis.hset(`volunteer:${volunteerId}:meta`, "lastActive", Date.now());
  }

  /**
   * Get total active volunteers
   */
  async getTotalVolunteers(): Promise<number> {
    return await redis.zcard(this.VOLUNTEER_LOAD_KEY);
  }

  /**
   * Remove volunteer from system (when role changed)
   */
  async unregisterVolunteer(volunteerId: string): Promise<void> {
    await redis.zrem(this.VOLUNTEER_LOAD_KEY, volunteerId);
    await redis.del(`volunteer:${volunteerId}:meta`);
    await redis.del(this.VOLUNTEER_REPORTS_KEY(volunteerId));
  }
}

// Singleton instance
export const assignmentManager = new AssignmentManager();
