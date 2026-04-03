import axios from "axios";

const GROK_API_BASE = "https://api.x.ai/v1";

interface VideoGenerationRequest {
  model: string;
  prompt: string;
  duration?: number;
  aspect_ratio?: string;
  resolution?: string;
  image_url?: string;
  video_url?: string;
  reference_image_urls?: string[];
}

interface VideoGenerationResponse {
  request_id: string;
}

type VideoStatus = "pending" | "done" | "failed" | "expired";

interface VideoStatusResponse {
  status: VideoStatus;
  video?: {
    url: string;
    duration: number;
    respect_moderation: boolean;
  };
  model: string;
}

export class GrokVideoClient {
  private apiKey: string;

  constructor(apiKey: string) {
    if (!apiKey) {
      throw new Error("XAI_API_KEY is not configured");
    }
    this.apiKey = apiKey;
  }

  /**
   * Start a video generation request
   */
  async generateVideo(request: VideoGenerationRequest): Promise<string> {
    try {
      const response = await axios.post<VideoGenerationResponse>(
        `${GROK_API_BASE}/videos/generations`,
        request,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.request_id;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Grok API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Poll for video generation status
   */
  async getVideoStatus(requestId: string): Promise<VideoStatusResponse> {
    try {
      const response = await axios.get<VideoStatusResponse>(
        `${GROK_API_BASE}/videos/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Grok API error: ${error.response?.data?.error?.message || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Generate text-to-video
   */
  async textToVideo(
    prompt: string,
    duration: number = 10,
    aspectRatio: string = "16:9",
    resolution: string = "720p"
  ): Promise<string> {
    return this.generateVideo({
      model: "grok-imagine-video",
      prompt,
      duration,
      aspect_ratio: aspectRatio,
      resolution,
    });
  }

  /**
   * Generate image-to-video
   */
  async imageToVideo(
    imageUrl: string,
    prompt: string,
    duration: number = 10,
    aspectRatio: string = "16:9",
    resolution: string = "720p"
  ): Promise<string> {
    return this.generateVideo({
      model: "grok-imagine-video",
      prompt,
      image_url: imageUrl,
      duration,
      aspect_ratio: aspectRatio,
      resolution,
    });
  }
}

export function createGrokClient(): GrokVideoClient {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new Error("XAI_API_KEY environment variable is not set");
  }
  return new GrokVideoClient(apiKey);
}
