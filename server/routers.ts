import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { generateVideoFromText, generateVideoFromImage, checkVideoStatus } from "./replicate-client";
import { TRPCError } from "@trpc/server";

// Simple in-memory rate limiting (resets on server restart)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string, maxRequests: number = 5, windowMs: number = 3600000): boolean {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  if (!record || now > record.resetTime) {
    requestCounts.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(() => null),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  videos: router({
    /**
     * Generate video from text prompt
     */
    generateFromText: publicProcedure
      .input(
        z.object({
          prompt: z.string().min(1).max(2000),
          duration: z.number().min(1).max(15).default(10),
          aspectRatio: z.enum(["16:9", "1:1", "9:16"]).default("16:9"),
          resolution: z.enum(["720p", "480p"]).default("720p"),
          model: z.enum(["minimax/video-01", "bytedance/seedance-1-lite", "kling-v2.5-turbo-pro"]).default("minimax/video-01"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Get client IP for rate limiting
          const clientIp = (ctx.req.headers["x-forwarded-for"] as string) || 
                          (ctx.req.headers["x-real-ip"] as string) || 
                          ctx.req.socket?.remoteAddress || 
                          "unknown";

          // Check rate limit (5 requests per hour)
          if (!checkRateLimit(`${clientIp}:text`, 5, 3600000)) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: "لقد تجاوزت حد الطلبات المسموح به. يرجى المحاولة لاحقاً",
            });
          }

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
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error generating video from text:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "فشل توليد الفيديو",
          });
        }
      }),

    /**
     * Generate video from image
     */
    generateFromImage: publicProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          prompt: z.string().min(1).max(2000),
          duration: z.number().min(1).max(15).default(10),
          aspectRatio: z.enum(["16:9", "1:1", "9:16"]).default("16:9"),
          resolution: z.enum(["720p", "480p"]).default("720p"),
          model: z.enum(["minimax/video-01", "bytedance/seedance-1-lite", "kling-v2.5-turbo-pro"]).default("minimax/video-01"),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Get client IP for rate limiting
          const clientIp = (ctx.req.headers["x-forwarded-for"] as string) || 
                          (ctx.req.headers["x-real-ip"] as string) || 
                          ctx.req.socket?.remoteAddress || 
                          "unknown";

          // Check rate limit (5 requests per hour)
          if (!checkRateLimit(`${clientIp}:image`, 5, 3600000)) {
            throw new TRPCError({
              code: "TOO_MANY_REQUESTS",
              message: "لقد تجاوزت حد الطلبات المسموح به. يرجى المحاولة لاحقاً",
            });
          }

          const result = await generateVideoFromImage(
            input.imageUrl,
            input.prompt,
            input.model
          );

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
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error generating video from image:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "فشل توليد الفيديو",
          });
        }
      }),

    /**
     * Check video generation status
     */
    checkStatus: publicProcedure
      .input(z.object({ requestId: z.string() }))
      .query(async ({ input }) => {
        try {
          const result = await checkVideoStatus(input.requestId);
          return result;
        } catch (error) {
          if (error instanceof TRPCError) throw error;
          console.error("Error checking video status:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: error instanceof Error ? error.message : "فشل التحقق من حالة الفيديو",
          });
        }
      }),

    /**
     * Get user's videos (returns empty for public)
     */
    list: publicProcedure.query(async () => {
      try {
        return [];
      } catch (error) {
        console.error("Error fetching user videos:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "فشل جلب الفيديوهات",
        });
      }
    }),

    /**
     * Delete a video
     */
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async () => {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "لا يمكن حذف الفيديوهات في النسخة العامة",
        });
      }),
  }),
});

export type AppRouter = typeof appRouter;
