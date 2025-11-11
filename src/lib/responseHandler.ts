// lib/responseHandler.ts
import { NextResponse } from "next/server";

export type ErrorObject = {
  code: string;
  details?: unknown;
};

export type ResponseEnvelope<T = unknown> = {
  success: boolean;
  message: string;
  data?: T;
  error?: ErrorObject;
  timestamp: string;
};

const timestamp = () => new Date().toISOString();

export const sendSuccess = <T = unknown>(
  data: T | null = null,
  message = "Success",
  status = 200
) => {
  const body: ResponseEnvelope<T> = {
    success: true,
    message,
    data: data ?? undefined,
    timestamp: timestamp(),
  };

  return NextResponse.json(body, { status });
};

export const sendError = (
  message = "Something went wrong",
  code = "INTERNAL_ERROR",
  status = 500,
  details?: unknown
) => {
  const body: ResponseEnvelope<null> = {
    success: false,
    message,
    error: { code, details },
    timestamp: timestamp(),
  };

  return NextResponse.json(body, { status });
};
