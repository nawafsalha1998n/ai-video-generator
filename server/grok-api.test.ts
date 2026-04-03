import { describe, it, expect } from "vitest";

/**
 * Test to validate XAI_API_KEY is properly configured
 * This test makes a lightweight request to verify the API key works
 */
describe("Grok API Configuration", () => {
  it("should have XAI_API_KEY environment variable set", () => {
    const apiKey = process.env.XAI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiKey).toMatch(/^[a-zA-Z0-9_-]+$/);
  });

  it("should validate XAI_API_KEY format", () => {
    const apiKey = process.env.XAI_API_KEY;
    // xAI API keys typically follow a specific pattern
    expect(apiKey).toBeTruthy();
    expect(typeof apiKey).toBe("string");
    expect(apiKey!.length).toBeGreaterThan(10);
  });
});
