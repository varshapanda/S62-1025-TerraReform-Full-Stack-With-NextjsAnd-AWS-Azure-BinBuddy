import { z } from "zod";

export const presignUrlRequestSchema = z.object({
  filename: z.string().min(1, "Filename required"),
  fileType: z
    .string()
    .refine((type) => type.startsWith("image/"), "Only image files allowed"),
  fileSize: z.number().max(5 * 1024 * 1024, "File size max 5MB"),
});

export const reportCreationSchema = z.object({
  imageUrl: z.string().url("Invalid image URL"),
  imageHash: z.string().optional(), // SHA256 hash for deduplication
  category: z.enum(["WET", "DRY", "MIXED", "HAZARDOUS", "OTHER"]),
  note: z.string().max(500, "Note max 500 chars").optional(),
  lat: z.number().min(-90).max(90, "Invalid latitude"),
  lng: z.number().min(-180).max(180, "Invalid longitude"),
});

export type PresignUrlRequest = z.infer<typeof presignUrlRequestSchema>;
export type ReportCreation = z.infer<typeof reportCreationSchema>;
