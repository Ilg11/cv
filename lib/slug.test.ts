import { describe, it, expect } from "vitest";
import { generateSlug } from "./slug";

describe("generateSlug", () => {
  it("formats name to lowercase and hyphens with random suffix", () => {
    const slug = generateSlug("John Doe");
    expect(slug).toMatch(/^john-doe-[a-z0-9]{6}$/);
  });

  it("handles Turkish and special characters gracefully", () => {
    const slug = generateSlug("İlhan Özgür Çağlar");
    expect(slug).toMatch(/^[a-z0-9-]+$/);
    expect(slug.length).toBeGreaterThan(6);
  });

  it("generates unique random suffixes on multiple calls", () => {
    const slug1 = generateSlug("Alex Smith");
    const slug2 = generateSlug("Alex Smith");
    expect(slug1).not.toBe(slug2);
  });
});
