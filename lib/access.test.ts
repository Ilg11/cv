import { describe, it, expect } from "vitest";
import { hasActiveAccess, UserProfileAccess } from "./access";

describe("hasActiveAccess - Access State Truth Table", () => {
  const now = new Date("2026-11-01T12:00:00Z");

  it("returns false for null or undefined profile", () => {
    expect(hasActiveAccess(null, now)).toBe(false);
    expect(hasActiveAccess(undefined, now)).toBe(false);
  });

  it("returns false for subscription_status = 'none'", () => {
    const profile: UserProfileAccess = { subscription_status: "none" };
    expect(hasActiveAccess(profile, now)).toBe(false);
  });

  it("handles 'trialing' before trial end date (Active)", () => {
    const profile: UserProfileAccess = {
      subscription_status: "trialing",
      trial_end_date: "2026-11-05T12:00:00Z",
    };
    expect(hasActiveAccess(profile, now)).toBe(true);
  });

  it("handles 'trialing' after trial end date (Expired)", () => {
    const profile: UserProfileAccess = {
      subscription_status: "trialing",
      trial_end_date: "2026-10-31T12:00:00Z",
    };
    expect(hasActiveAccess(profile, now)).toBe(false);
  });

  it("handles 'active' with 1-day grace buffer", () => {
    // Current period ends today at 10:00, with 1-day buffer it should still be active
    const profile: UserProfileAccess = {
      subscription_status: "active",
      current_period_end: "2026-11-01T10:00:00Z",
    };
    expect(hasActiveAccess(profile, now)).toBe(true);
  });

  it("handles 'past_due' within 3-day grace period (Active)", () => {
    const profile: UserProfileAccess = {
      subscription_status: "past_due",
      past_due_since: "2026-10-31T12:00:00Z", // 1 day ago
    };
    expect(hasActiveAccess(profile, now)).toBe(true);
  });

  it("handles 'past_due' past 3-day grace period (Inactive)", () => {
    const profile: UserProfileAccess = {
      subscription_status: "past_due",
      past_due_since: "2026-10-25T12:00:00Z", // 7 days ago
    };
    expect(hasActiveAccess(profile, now)).toBe(false);
  });

  it("handles 'canceled' before period end (User paid for the cycle)", () => {
    const profile: UserProfileAccess = {
      subscription_status: "canceled",
      current_period_end: "2026-11-15T12:00:00Z",
    };
    expect(hasActiveAccess(profile, now)).toBe(true);
  });

  it("handles 'canceled' after period end (Lapsed)", () => {
    const profile: UserProfileAccess = {
      subscription_status: "canceled",
      current_period_end: "2026-10-20T12:00:00Z",
    };
    expect(hasActiveAccess(profile, now)).toBe(false);
  });
});
