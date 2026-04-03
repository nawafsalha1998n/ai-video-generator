import "dotenv/config";
import express from "express";
import { initTRPC, TRPCError } from "@trpc/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import superjson from "superjson";
import { z } from "zod";
import { generateVideoFromText, generateVideoFromImage, checkVideoStatus } from "../server/replicate-client.ts";

// Initialize tRPC with a simple context
const t = initTRPC.create({
  transformer: superjson,
});

const router = t.router;
const publicProcedure = t.procedure;

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);
  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (record.count >= maxRequests) return false;
  record.count++;
  return true;
}

// Define a minimal appRouter for Vercel
const appRouter = router({
  videos: router({
    generateFromText: publicProcedure
      .input(z.object({
        prompt: z.string().min(1).max(2000),
        duration: z.number().min(1).max(15).default(10),
        aspectRatio: z.enum(["16:9", "1:1", "9:16"]).default("16:9"),
        resolution: z.enum(["720p", "480p"]).default("720p"),
        model: z.enum(["minimax/video-01", "bytedance/seedance-1-lite", "kling-v2.5-turbo-pro"]).default("minimax/video-01"),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await generateVideoFromText({
          prompt: input.prompt,
          model: input.model as any,
        });
        return {
          requestId: result.requestId,
          status: result.status,
          videoUrl: result.videoUrl,
          errorMessage: result.errorMessage,
          type: "text-to-video",
          prompt: input.prompt,
          duration: input.duration,
          aspectRatio: input.aspectRatio,
          resolution: input.resolution,
          model: input.model,
          createdAt: new Date(),
        };
      }),

    generateFromImage: publicProcedure
      .input(z.object({
        imageUrl: z.string().url(),
        prompt: z.string().min(1).max(2000),
        duration: z.number().min(1).max(15).default(10),
        aspectRatio: z.enum(["16:9", "1:1", "9:16"]).default("16:9"),
        resolution: z.enum(["720p", "480p"]).default("720p"),
        model: z.enum(["minimax/video-01", "bytedance/seedance-1-lite", "kling-v2.5-turbo-pro"]).default("minimax/video-01"),
      }))
      .mutation(async ({ input }) => {
        const result = await generateVideoFromImage(input.imageUrl, input.prompt, input.model);
        return {
          requestId: result.requestId,
          status: result.status,
          videoUrl: result.videoUrl,
          errorMessage: result.errorMessage,
          type: "image-to-video",
          prompt: input.prompt,
          imageUrl: input.imageUrl,
          duration: input.duration,
          aspectRatio: input.aspectRatio,
          resolution: input.resolution,
          model: input.model,
          createdAt: new Date(),
        };
      }),

    checkStatus: publicProcedure
      .input(z.object({ requestId: z.string() }))
      .query(async ({ input }) => {
        return await checkVideoStatus(input.requestId);
      }),
    
    list: publicProcedure.query(() => []),
  }),
});

const app = express();
app.use(express.json());

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext: () => ({}),
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Minimal API is running" });
});

export default app;
