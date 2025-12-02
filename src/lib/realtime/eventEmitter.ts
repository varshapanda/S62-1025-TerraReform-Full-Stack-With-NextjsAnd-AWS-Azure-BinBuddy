/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// FILE 2: src/lib/realtime/eventEmitter.ts
// ===========================================
// WHY: Broadcasts real-time events to connected volunteers via SSE
// WHAT: Manages SSE connections and sends events

type EventType = "new_assignment" | "report_verified" | "assignment_expired";

interface RealtimeEvent {
  type: EventType;
  data: any;
  timestamp: number;
}

class RealtimeEmitter {
  private connections = new Map<
    string,
    { controller: ReadableStreamDefaultController; volunteerId: string }
  >();

  /**
   * Register a volunteer's SSE connection
   */
  addConnection(
    volunteerId: string,
    controller: ReadableStreamDefaultController
  ): string {
    const connectionId = `${volunteerId}-${Date.now()}`;
    this.connections.set(connectionId, { controller, volunteerId });

    console.log(
      `✅ SSE: Volunteer ${volunteerId} connected (total: ${this.connections.size})`
    );

    return connectionId;
  }

  /**
   * Remove connection when closed
   */
  removeConnection(connectionId: string): void {
    this.connections.delete(connectionId);
    console.log(
      `❌ SSE: Connection ${connectionId} closed (remaining: ${this.connections.size})`
    );
  }

  /**
   * Send event to specific volunteer
   */
  private sendToVolunteer(volunteerId: string, event: RealtimeEvent): void {
    let sentCount = 0;

    for (const [connId, conn] of this.connections.entries()) {
      if (conn.volunteerId === volunteerId) {
        try {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          conn.controller.enqueue(new TextEncoder().encode(data));
          sentCount++;
        } catch (err) {
          console.error(`Failed to send to ${connId}:`, err);
          this.removeConnection(connId);
        }
      }
    }

    if (sentCount > 0) {
      console.log(
        `📡 Sent ${event.type} to volunteer ${volunteerId} (${sentCount} connections)`
      );
    }
  }

  /**
   * Notify volunteer of new assignment
   */
  notifyNewAssignment(volunteerId: string, reportId: string): void {
    this.sendToVolunteer(volunteerId, {
      type: "new_assignment",
      data: { reportId },
      timestamp: Date.now(),
    });
  }

  /**
   * Notify volunteer that a report was verified (remove from queue)
   */
  notifyReportVerified(
    volunteerId: string,
    reportId: string,
    status: string
  ): void {
    this.sendToVolunteer(volunteerId, {
      type: "report_verified",
      data: { reportId, status },
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast to multiple volunteers
   */
  notifyMultiple(volunteerIds: string[], event: RealtimeEvent): void {
    console.log(
      `📢 Broadcasting ${event.type} to ${volunteerIds.length} volunteers`
    );
    for (const volunteerId of volunteerIds) {
      this.sendToVolunteer(volunteerId, event);
    }
  }

  /**
   * Get connection count for a volunteer
   */
  getConnectionCount(volunteerId: string): number {
    let count = 0;
    for (const conn of this.connections.values()) {
      if (conn.volunteerId === volunteerId) count++;
    }
    return count;
  }

  /**
   * Get total active connections
   */
  getTotalConnections(): number {
    return this.connections.size;
  }
}

export const realtimeEmitter = new RealtimeEmitter();
