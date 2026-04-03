import "dotenv/config";
import express from "express";
import { initTRPC } from "@trpc/server";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import superjson from "superjson";
import { z } from "zod";
import { put } from "@vercel/blob";

// --- Replicate Client Logic (Inlined to avoid module resolution issues on Vercel) ---
const REPLICATE_API_BASE = "https://api.replicate.com/v1";
const DEFAULT_MODEL = "minimax/video-01";

async function downloadVideoToBuffer(url: string): Promise<Buffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download video: ${response.statusText}`);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function uploadVideoToBlob(videoUrl: string, filename: string): Promise<string> {
  try {
    const videoBuffer = await downloadVideoToBuffer(videoUrl);
    const blobResponse = await put(filename, videoBuffer, {
      access: "public",
      contentType: "video/mp4",
    });
    return blobResponse.url;
  } catch (error) {
    console.error("Failed to upload to Vercel Blob:", error);
    // Return original URL if upload fails
    return videoUrl;
  }
}

async function generateVideoFromText(request: {
  prompt: string;
  firstFrameImage?: string;
  model?: string;
}) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not configured");

  const model = request.model || DEFAULT_MODEL;
  const input: Record<string, unknown> = { prompt: request.prompt };
  if (request.firstFrameImage) input.first_frame_image = request.firstFrameImage;

  const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version: model, input }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Replicate API error: ${error.detail || response.statusText}`);
  }

  const prediction = await response.json();
  let status: "pending" | "processing" | "done" | "failed" = "pending";
  if (prediction.status === "succeeded") status = "done";
  else if (prediction.status === "failed") status = "failed";
  else if (["processing", "starting"].includes(prediction.status)) status = "processing";

  let videoUrl = prediction.output?.[0] || prediction.output;
  
  // Upload to Vercel Blob if video is ready
  if (status === "done" && videoUrl) {
    const filename = `videos/${prediction.id}-${Date.now()}.mp4`;
    videoUrl = await uploadVideoToBlob(videoUrl, filename);
  }

  return {
    requestId: prediction.id,
    status,
    videoUrl,
    errorMessage: prediction.error,
  };
}

async function checkVideoStatus(requestId: string) {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) throw new Error("REPLICATE_API_TOKEN is not configured");

  const response = await fetch(`${REPLICATE_API_BASE}/predictions/${requestId}`, {
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) throw new Error(`Failed to check status: ${response.statusText}`);

  const prediction = await response.json();
  let status: "pending" | "processing" | "done" | "failed" = "pending";
  if (prediction.status === "succeeded") status = "done";
  else if (prediction.status === "failed") status = "failed";
  else if (["processing", "starting"].includes(prediction.status)) status = "processing";

  let videoUrl = prediction.output?.[0] || prediction.output;
  
  // Upload to Vercel Blob if video is ready
  if (status === "done" && videoUrl) {
    const filename = `videos/${prediction.id}-${Date.now()}.mp4`;
    videoUrl = await uploadVideoToBlob(videoUrl, filename);
  }

  return {
    requestId: prediction.id,
    status,
    videoUrl,
    errorMessage: prediction.error,
  };
}

// --- tRPC Setup ---
const t = initTRPC.create({ transformer: superjson });
const appRouter = t.router({
  videos: t.router({
    generateFromText: t.procedure
      .input(z.object({
        prompt: z.string().min(1),
        duration: z.number().optional(),
        aspectRatio: z.string().optional(),
        resolution: z.string().optional(),
        model: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await generateVideoFromText({
          prompt: input.prompt,
          model: input.model,
        });
        return { ...result, ...input, createdAt: new Date() };
      }),

    generateFromImage: t.procedure
      .input(z.object({
        imageUrl: z.string().url(),
        prompt: z.string().min(1),
        duration: z.number().optional(),
        aspectRatio: z.string().optional(),
        resolution: z.string().optional(),
        model: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const result = await generateVideoFromText({
          prompt: input.prompt,
          firstFrameImage: input.imageUrl,
          model: input.model,
        });
        return { ...result, ...input, createdAt: new Date() };
      }),

    checkStatus: t.procedure
      .input(z.object({ requestId: z.string() }))
      .query(async ({ input }) => {
        return await checkVideoStatus(input.requestId);
      }),
    
    list: t.procedure.query(() => []),
  }),
});

// --- Express App ---
const app = express();
app.use(express.json());
app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext: () => ({}) }));
app.get("/api/health", (req, res) => res.json({ status: "ok", message: "API with Vercel Blob integration is running" }));

export default app;
