import { describe, expect, it } from "vitest";

describe("Replicate API Token Validation", () => {
  it("should have REPLICATE_API_TOKEN environment variable set", () => {
    const token = process.env.REPLICATE_API_TOKEN;
    expect(token).toBeDefined();
    expect(token).not.toBe("");
    expect(typeof token).toBe("string");
  });

  it("should have a valid token format (not empty string)", () => {
    const token = process.env.REPLICATE_API_TOKEN;
    expect(token).toBeTruthy();
    expect(token?.length).toBeGreaterThan(0);
  });

  it("should be able to make a basic Replicate API call", async () => {
    const token = process.env.REPLICATE_API_TOKEN;
    if (!token) {
      throw new Error("REPLICATE_API_TOKEN is not set");
    }

    try {
      // Test with a simple API call to get account info
      const response = await fetch("https://api.replicate.com/v1/account", {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toBeDefined();
      expect(data.username).toBeDefined();
    } catch (error) {
      throw new Error(
        `Failed to validate Replicate API token: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
});
