import { NextRequest } from "next/server";
import { generatePresignedUrl } from "@/lib/s3Client";
import { presignUrlRequestSchema } from "@/lib/validation/reportSchema";
import { sendSuccess, sendError } from "@/lib/responseHandler";
import { ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();

    // Validate with Zod
    const validated = presignUrlRequestSchema.parse(body);

    // Generate presigned URL
    const presignedUrl = await generatePresignedUrl(
      validated.filename,
      validated.fileType
    );

    return sendSuccess(
      {
        uploadUrl: presignedUrl,
        expiresIn: 300, // 5 minutes
      },
      "Presigned URL generated successfully"
    );
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      return sendError(
        error.issues[0]?.message || "Validation failed",
        "VALIDATION_ERROR",
        400,
        error.issues
      );
    }
    console.error("Presign URL error:", error);
    const originalError =
      error instanceof Error
        ? error.message
        : typeof error === "string"
          ? error
          : JSON.stringify(error);
    return sendError("Failed to generate presigned URL", "S3_ERROR", 500, {
      originalError,
    });
  }
}
