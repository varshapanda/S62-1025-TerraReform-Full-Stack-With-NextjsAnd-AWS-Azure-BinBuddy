import { NextResponse } from "next/server";
import { logger } from "./logger";

export function handleError(error: unknown, context: string) {
  const isProd = process.env.NODE_ENV === "production";

  const errorResponse = {
    success: false,
    message: isProd
      ? "Something went wrong. Please try again later."
      : (error as Error).message || "Unknown error",
    ...(isProd ? {} : { stack: (error as Error).stack }),
  };

  logger.error(`Error in ${context}`, {
    message: (error as Error).message,
    stack: isProd ? "REDACTED" : (error as Error).stack,
  });

  return NextResponse.json(errorResponse, { status: 500 });
}
