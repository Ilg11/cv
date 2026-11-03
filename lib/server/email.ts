import "server-only";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";

  if (!apiKey) {
    console.warn("RESEND_API_KEY not configured. Skipping email dispatch.");
    return { success: false, error: "API key missing" };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        html,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      console.error("Resend API error:", data);
      return { success: false, error: data };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to send email via Resend:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 1. Welcome Email
 */
export async function sendWelcomeEmail(toEmail: string, name?: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const displayName = name || "there";

  return sendEmail({
    to: toEmail,
    subject: "Welcome to CVForge! Your 7-day Pro trial is active",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #4f46e5; margin-top: 0;">Welcome to CVForge, ${displayName}!</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          Your 7-day free trial has been activated. You now have full access to our AI ATS Optimizer, LinkedIn profile importer, and ATS-safe resume templates.
        </p>
        <div style="margin: 24px 0;">
          <a href="${appUrl}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Open Your Dashboard
          </a>
        </div>
        <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
          You can create unlimited tailored resume versions, optimize bullets against real job postings, and share your personal recruiter web links.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8;">
          CVForge • AI Resume Builder & ATS Tailor • Cancel anytime from your account settings.
        </p>
      </div>
    `,
  });
}

/**
 * 2. Trial Ending Reminder (Sent 2 days before trial ends)
 */
export async function sendTrialEndingEmail(toEmail: string, daysRemaining: number = 2) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return sendEmail({
    to: toEmail,
    subject: `Your CVForge free trial ends in ${daysRemaining} days`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #0f172a; margin-top: 0;">Heads up: Your free trial is ending soon</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          Your 7-day free trial on CVForge will conclude in ${daysRemaining} days.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          If you are happy with the interview results and want to keep your shared links active for recruiters, your annual subscription ($99/year) will continue seamlessly.
        </p>
        <div style="margin: 24px 0;">
          <a href="${appUrl}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Manage Account & Resumes
          </a>
        </div>
        <p style="font-size: 13px; color: #64748b;">
          Need to cancel? You can cancel anytime before the trial ends and you will not be charged.
        </p>
      </div>
    `,
  });
}

/**
 * 3. Link Paused Notification (When access lapses)
 */
export async function sendLinkPausedEmail(toEmail: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return sendEmail({
    to: toEmail,
    subject: "Your CVForge shared resume links have been paused",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background-color: #ffffff; border: 1px solid #e2e8f0; rounded: 12px;">
        <h2 style="color: #0f172a; margin-top: 0;">Your live resume links are currently paused</h2>
        <p style="font-size: 15px; line-height: 1.6;">
          Your subscription period or trial has ended, so your shared recruiter web links are now displaying a neutral unavailable notice.
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #475569;">
          <strong>Your resume content is completely safe and stored in your account.</strong> To reactivate your live links for recruiters, simply renew your subscription.
        </p>
        <div style="margin: 24px 0;">
          <a href="${appUrl}/dashboard" style="background-color: #4f46e5; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; display: inline-block;">
            Reactivate Live Links
          </a>
        </div>
      </div>
    `,
  });
}
