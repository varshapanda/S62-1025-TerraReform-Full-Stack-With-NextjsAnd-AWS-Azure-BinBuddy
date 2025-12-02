import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { realtimeEmitter } from "@/lib/realtime/eventEmitter";
import { assignmentManager } from "@/lib/assignment/redisManager";

export async function GET(req: NextRequest) {
  const { success, user } = verifyToken(req);

  if (!success || !user || user.role !== "volunteer") {
    return new Response("Unauthorized", { status: 401 });
  }

  // Update volunteer activity
  await assignmentManager.updateActivity(user.id);

  // Create SSE stream
  const stream = new ReadableStream({
    start(controller) {
      const connectionId = realtimeEmitter.addConnection(user.id, controller);

      // Send initial connection event
      const data = `data: ${JSON.stringify({
        type: "connected",
        volunteerId: user.id,
        timestamp: Date.now(),
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(data));

      // Keep-alive ping every 30s
      const pingInterval = setInterval(() => {
        try {
          controller.enqueue(new TextEncoder().encode(": ping\n\n"));
        } catch {
          clearInterval(pingInterval);
          realtimeEmitter.removeConnection(connectionId);
        }
      }, 30000);

      // Cleanup on close
      req.signal.addEventListener("abort", () => {
        clearInterval(pingInterval);
        realtimeEmitter.removeConnection(connectionId);
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
