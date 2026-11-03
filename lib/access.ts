export type SubscriptionStatus = 'none' | 'trialing' | 'active' | 'past_due' | 'canceled';

export interface UserProfileAccess {
  subscription_status: SubscriptionStatus;
  trial_end_date?: string | null;
  current_period_end?: string | null;
  past_due_since?: string | null;
}

/**
 * Pure function determining whether a user has active access to paid features.
 * Single source of truth for paywalls, PDF export, ATS optimizer, and public CV links.
 */
export function hasActiveAccess(profile: UserProfileAccess | null | undefined, now: Date = new Date()): boolean {
  if (!profile) return false;
  const status = profile.subscription_status;
  const nowDate = now.getTime();

  if (status === 'active') {
    if (!profile.current_period_end) return true;
    const periodEnd = new Date(profile.current_period_end).getTime() + 24 * 60 * 60 * 1000;
    return nowDate < periodEnd;
  }

  if (status === 'trialing') {
    if (!profile.trial_end_date) return true;
    const trialEnd = new Date(profile.trial_end_date).getTime();
    return nowDate < trialEnd;
  }

  if (status === 'past_due') {
    if (!profile.past_due_since) return false;
    const pastDueSince = new Date(profile.past_due_since).getTime();
    const graceEnd = pastDueSince + 3 * 24 * 60 * 60 * 1000; // 3 days grace
    return nowDate < graceEnd;
  }

  if (status === 'canceled') {
    if (!profile.current_period_end) return false;
    const periodEnd = new Date(profile.current_period_end).getTime();
    return nowDate < periodEnd;
  }

  return false;
}
