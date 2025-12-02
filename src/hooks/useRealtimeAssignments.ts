import { useEffect, useState } from "react";

interface RealtimeEvent {
  type: "new_assignment" | "report_verified" | "connected";
  data?: { reportId?: string; status?: string };
  timestamp: number;
}

export function useRealtimeAssignments(
  onNewAssignment?: (reportId: string) => void,
  onReportVerified?: (reportId: string) => void
) {
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        eventSource = new EventSource("/api/volunteer/stream");

        eventSource.onopen = () => {
          console.log("✅ Real-time connection established");
          setConnected(true);
          setError(null);
        };

        eventSource.onmessage = (event) => {
          try {
            const data: RealtimeEvent = JSON.parse(event.data);

            switch (data.type) {
              case "new_assignment":
                if (data.data?.reportId) {
                  console.log("🔔 New assignment:", data.data.reportId);
                  onNewAssignment?.(data.data.reportId);
                }
                break;

              case "report_verified":
                if (data.data?.reportId) {
                  console.log("✅ Report verified:", data.data.reportId);
                  onReportVerified?.(data.data.reportId);
                }
                break;

              case "connected":
                console.log("🔗 SSE connection confirmed");
                break;
            }
          } catch (err) {
            console.error("Failed to parse SSE event:", err);
          }
        };

        eventSource.onerror = () => {
          console.error("❌ SSE connection error, reconnecting...");
          setConnected(false);
          eventSource?.close();

          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (err) {
        console.error("Failed to create EventSource:", err);
        setError("Connection failed");
      }
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      eventSource?.close();
    };
  }, [onNewAssignment, onReportVerified]);

  return { connected, error };
}
