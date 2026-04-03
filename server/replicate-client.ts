import { ENV } from "./_core/env";

export interface VideoGenerationRequest {
  prompt: string;
  firstFrameImage?: string;
  subjectReference?: string;
  model?: "minimax/video-01" | "bytedance/seedance-1-lite" | "kling-v2.5-turbo-pro";
}

export interface VideoGenerationResponse {
  requestId: string;
  status: "pending" | "processing" | "done" | "failed";
  videoUrl?: string;
  errorMessage?: string;
}

const REPLICATE_API_BASE = "https://api.replicate.com/v1";
const DEFAULT_MODEL = "minimax/video-01";

export async function generateVideoFromText(
  request: VideoGenerationRequest
): Promise<VideoGenerationResponse> {
  const token = ENV.replicateApiToken;
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  const model = request.model || DEFAULT_MODEL;
  const input: Record<string, unknown> = {
    prompt: request.prompt,
  };

  if (request.firstFrameImage) {
    input.first_frame_image = request.firstFrameImage;
  }

  if (request.subjectReference) {
    input.subject_reference = request.subjectReference;
  }

  try {
    // Create a prediction (start the generation)
    const response = await fetch(`${REPLICATE_API_BASE}/predictions`, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: model,
        input,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        `Replicate API error: ${error.detail || response.statusText}`
      );
    }

    const prediction = await response.json();

    // Map Replicate status to our status
    let status: "pending" | "processing" | "done" | "failed" = "pending";
    if (prediction.status === "succeeded") {
      status = "done";
    } else if (prediction.status === "failed") {
      status = "failed";
    } else if (["processing", "starting"].includes(prediction.status)) {
      status = "processing";
    }

    return {
      requestId: prediction.id,
      status,
      videoUrl: prediction.output?.[0] || prediction.output,
      errorMessage: prediction.error,
    };
  } catch (error) {
    throw new Error(
      `Error generating video: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function checkVideoStatus(
  requestId: string
): Promise<VideoGenerationResponse> {
  const token = ENV.replicateApiToken;
  if (!token) {
    throw new Error("REPLICATE_API_TOKEN is not configured");
  }

  try {
    const response = await fetch(
      `${REPLICATE_API_BASE}/predictions/${requestId}`,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check status: ${response.statusText}`);
    }

    const prediction = await response.json();

    // Map Replicate status to our status
    let status: "pending" | "processing" | "done" | "failed" = "pending";
    if (prediction.status === "succeeded") {
      status = "done";
    } else if (prediction.status === "failed") {
      status = "failed";
    } else if (["processing", "starting"].includes(prediction.status)) {
      status = "processing";
    }

    return {
      requestId: prediction.id,
      status,
      videoUrl: prediction.output?.[0] || prediction.output,
      errorMessage: prediction.error,
    };
  } catch (error) {
    throw new Error(
      `Error checking video status: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

export async function generateVideoFromImage(
  imageUrl: string,
  prompt: string,
  model: string = DEFAULT_MODEL
): Promise<VideoGenerationResponse> {
  return generateVideoFromText({
    prompt,
    firstFrameImage: imageUrl,
    model: model as any,
  });
}
