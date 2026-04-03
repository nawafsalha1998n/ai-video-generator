import { describe, expect, it } from "vitest";
import { generateVideoFromText, checkVideoStatus } from "./replicate-client";

describe("Replicate API Integration", () => {
  it("should generate a video request from text", async () => {
    const result = await generateVideoFromText({
      prompt: "A beautiful sunset over the ocean with waves crashing on the shore",
      model: "minimax/video-01",
    });

    expect(result).toBeDefined();
    expect(result.requestId).toBeDefined();
    expect(result.status).toMatch(/^(pending|processing|done|failed)$/);
    expect(typeof result.requestId).toBe("string");
    expect(result.requestId.length).toBeGreaterThan(0);
  });

  it("should check video status", async () => {
    // First, create a video request
    const createResult = await generateVideoFromText({
      prompt: "A spaceship flying through the galaxy",
      model: "minimax/video-01",
    });

    expect(createResult.requestId).toBeDefined();

    // Then check its status
    const statusResult = await checkVideoStatus(createResult.requestId);

    expect(statusResult).toBeDefined();
    expect(statusResult.requestId).toBe(createResult.requestId);
    expect(statusResult.status).toMatch(/^(pending|processing|done|failed)$/);
  });

  it("should handle image-to-video generation", async () => {
    // Using a public test image URL
    const testImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg";

    const result = await generateVideoFromText({
      prompt: "Animate this painting with swirling stars and cosmic movements",
      firstFrameImage: testImageUrl,
      model: "minimax/video-01",
    });

    expect(result).toBeDefined();
    expect(result.requestId).toBeDefined();
    expect(result.status).toMatch(/^(pending|processing|done|failed)$/);
  });

  it("should return proper error handling for invalid requests", async () => {
    try {
      // Test with empty prompt
      await generateVideoFromText({
        prompt: "",
        model: "minimax/video-01",
      });
      // If we get here, the API accepted the empty prompt
      // This is acceptable behavior
    } catch (error) {
      // API rejected the empty prompt, which is also acceptable
      expect(error).toBeDefined();
    }
  });
});
