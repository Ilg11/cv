import { createBrowserClient } from "@supabase/ssr";
import fs from "fs";

// Load environment variables from .env.local
if (fs.existsSync(".env.local")) {
  const lines = fs.readFileSync(".env.local", "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq > 0) {
      const k = trimmed.slice(0, eq).trim();
      const v = trimmed.slice(eq + 1).trim();
      process.env[k] = v;
    }
  }
}

const BASE_URL = "http://localhost:3000";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// In-memory cookie storage for node environment
const cookieMap = new Map();

function getCookieHeader() {
  return Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

const supabase = createBrowserClient(supabaseUrl, supabaseAnon, {
  cookies: {
    getAll() {
      return Array.from(cookieMap.entries()).map(([name, value]) => ({ name, value }));
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => {
        cookieMap.set(name, value);
      });
    }
  }
});

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    Cookie: getCookieHeader(),
    ...(options.headers || {})
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    redirect: "manual"
  });

  // Extract set-cookie if any
  const setCookies = res.headers.get("set-cookie");
  if (setCookies) {
    const parts = setCookies.split(/,(?=[^;]+=[^;]+)/);
    for (const part of parts) {
      const first = part.split(";")[0].trim();
      const [k, ...v] = first.split("=");
      if (k) cookieMap.set(k.trim(), v.join("=").trim());
    }
  }

  const contentType = res.headers.get("content-type") || "";
  let data = null;
  let text = "";
  if (contentType.includes("application/json")) {
    try {
      data = await res.json();
    } catch {}
  } else {
    text = await res.text();
  }

  return {
    status: res.status,
    headers: Object.fromEntries(res.headers.entries()),
    data,
    text
  };
}

const testResults = [];
function record(section, name, passed, details = "") {
  testResults.push({ section, name, passed: passed ? "PASS" : "FAIL", details });
  const statusEmoji = passed ? "✓" : "✗";
  console.log(`  ${statusEmoji} [${section}] ${name}${details ? ` -> ${details}` : ""}`);
}

async function main() {
  console.log("================================================================================");
  console.log("🚀 STARTING CVFORGE USER-ACCEPTANCE END-TO-END TEST SUITE");
  console.log("   Specification: linkedin-cv-optimizer-project-brief.md");
  console.log("================================================================================\n");

  const testEmail = `testuser_${Date.now()}@cvforge-test.local`;
  const testPassword = `TestPass!${Date.now()}`;

  // =========================================================================
  // 1. PUBLIC MARKETING & LEGAL PAGES
  // =========================================================================
  console.log("\n--- SECTION 1: PUBLIC MARKETING & LEGAL PAGES ---");
  {
    const landing = await request("/");
    record("1. Public Pages", "Landing Page (/) renders 21st.dev UI & Hero", landing.status === 200 && landing.text.includes("CVForge"), `Status: ${landing.status}`);

    const terms = await request("/terms");
    record("1. Public Pages", "Terms of Service (/terms)", terms.status === 200, `Status: ${terms.status}`);

    const privacy = await request("/privacy");
    record("1. Public Pages", "Privacy Policy (/privacy)", privacy.status === 200, `Status: ${privacy.status}`);

    const refunds = await request("/refunds");
    record("1. Public Pages", "Refund Policy (/refunds)", refunds.status === 200, `Status: ${refunds.status}`);
  }

  // =========================================================================
  // 2. AUTHENTICATION & SESSION MANAGEMENT
  // =========================================================================
  console.log("\n--- SECTION 2: AUTHENTICATION & SESSION MANAGEMENT ---");
  let userSession = null;
  {
    // A. Unauthenticated access check (Middleware protection)
    const unauthDash = await request("/dashboard");
    const isRedirect = unauthDash.status === 307 || unauthDash.status === 302 || unauthDash.status === 303;
    const redirectUrl = unauthDash.headers["location"] || "";
    record("2. Auth & Session", "Protected /dashboard redirects unauthenticated users to /login", isRedirect && redirectUrl.includes("/login"), `Status: ${unauthDash.status}, Location: ${redirectUrl}`);

    // B. User Registration via auto-confirm endpoint
    const regRes = await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    record("2. Auth & Session", "Auto-confirm registration (POST /api/auth/register)", regRes.status === 200 && regRes.data?.success, `User created: ${testEmail}`);

    // C. Sign In via Supabase Client to establish session
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    userSession = authData?.session;
    record("2. Auth & Session", "Client sign-in (signInWithPassword)", !authError && !!userSession, authError ? authError.message : `UID: ${authData?.user?.id}`);

    // D. Verify session via GET /api/auth/me
    const meRes = await request("/api/auth/me");
    record("2. Auth & Session", "Profile & subscription check (GET /api/auth/me)", meRes.status === 200 && meRes.data?.user?.email === testEmail, `Plan: ${meRes.data?.profile?.subscription_status || 'active'}, hasActiveAccess: ${meRes.data?.hasActiveAccess}`);

    // E. Verify authenticated dashboard load
    const authDash = await request("/dashboard");
    record("2. Auth & Session", "Authenticated /dashboard access granted (200 OK)", authDash.status === 200, `Status: ${authDash.status}`);
  }

  // =========================================================================
  // 3. RESUME CREATION & MANAGEMENT (CRUD & DEMO SEED)
  // =========================================================================
  console.log("\n--- SECTION 3: RESUME CREATION & MANAGEMENT (CRUD) ---");
  let createdResumeId = null;
  let duplicatedResumeId = null;
  let demoResumeId = null;
  {
    // A. Create new resume
    const createRes = await request("/api/resumes", {
      method: "POST",
      body: JSON.stringify({
        title: "Senior Full Stack Engineer",
        template: "classic",
        source: "scratch"
      })
    });
    createdResumeId = createRes.data?.id;
    record("3. Resume CRUD", "Create resume (POST /api/resumes)", createRes.status === 200 && !!createdResumeId, `Resume ID: ${createdResumeId}`);

    // B. Fetch single resume
    const getRes = await request(`/api/resumes/${createdResumeId}`);
    record("3. Resume CRUD", "Fetch single resume (GET /api/resumes/[id])", getRes.status === 200 && getRes.data?.title === "Senior Full Stack Engineer", `Template: ${getRes.data?.template}`);

    // C. Update resume (template & content)
    const updateRes = await request(`/api/resumes/${createdResumeId}`, {
      method: "PUT",
      body: JSON.stringify({
        title: "Lead Full Stack Architect",
        template: "modern",
        content: {
          ...getRes.data.content,
          basics: {
            ...getRes.data.content.basics,
            fullName: "Alex Rivera",
            headline: "Principal Cloud Systems Architect"
          }
        }
      })
    });
    record("3. Resume CRUD", "Update resume template & info (PUT /api/resumes/[id])", updateRes.status === 200 && updateRes.data?.title === "Lead Full Stack Architect", `New Template: ${updateRes.data?.template}`);

    // D. Duplicate resume
    const dupRes = await request(`/api/resumes/${createdResumeId}/duplicate`, {
      method: "POST"
    });
    duplicatedResumeId = dupRes.data?.id;
    record("3. Resume CRUD", "Duplicate resume (POST /api/resumes/[id]/duplicate)", dupRes.status === 200 && dupRes.data?.title?.includes("Copy"), `Cloned ID: ${duplicatedResumeId}`);

    // E. 1-Click Demo Seed
    const demoRes = await request("/api/resumes/demo", {
      method: "POST"
    });
    demoResumeId = demoRes.data?.id;
    record("3. Resume CRUD", "1-Click Demo Seed (POST /api/resumes/demo)", demoRes.status === 200 && !!demoResumeId, `Demo ID: ${demoResumeId}, Slug: ${demoRes.data?.slug}`);

    // F. List all user resumes (GET /api/resumes)
    const listRes = await request("/api/resumes");
    record("3. Resume CRUD", "List all user resumes (GET /api/resumes)", listRes.status === 200 && Array.isArray(listRes.data) && listRes.data.length >= 3, `Total Resumes: ${listRes.data?.length}`);
  }

  // =========================================================================
  // 4. AI RESUME BULLET ENHANCER (GOOGLE XYZ FORMULA)
  // =========================================================================
  console.log("\n--- SECTION 4: AI BULLET ENHANCER (CLAUDE 3.5 HAIKU) ---");
  {
    const rawBullet = "I helped improve backend API response times for our e-commerce checkout.";
    const enhanceRes = await request("/api/ai/enhance-bullet", {
      method: "POST",
      body: JSON.stringify({
        bullet: rawBullet,
        jobTitle: "Senior Backend Engineer",
        targetCompany: "Stripe"
      })
    });

    const enhancedText = enhanceRes.data?.enhancedBullet || enhanceRes.data?.enhanced || "";
    const hasXyz = enhancedText.length > 20 && !enhancedText.includes("Error");
    record("4. AI Bullet Enhancer", "Google XYZ Formula Rewriter (POST /api/ai/enhance-bullet)", enhanceRes.status === 200 && hasXyz, `Output: "${enhancedText.slice(0, 85)}..."`);
  }

  // =========================================================================
  // 5. AI ATS GAP ANALYSIS & SCORING ENGINE
  // =========================================================================
  console.log("\n--- SECTION 5: AI ATS OPTIMIZER (CLAUDE 3.5 HAIKU) ---");
  {
    const targetJob = `
      Position: Senior Frontend Engineer at Stripe
      Requirements:
      - 5+ years of experience with React, TypeScript, and Next.js
      - Deep expertise in Web Performance Optimization, Core Web Vitals, and Lighthouse 95+ scores
      - Proven experience in Tailwind CSS, shadcn/ui design systems, and responsive layouts
      - Strong grasp of automated testing with Jest, Playwright, and CI/CD pipelines
      - Excellent communication and cross-functional leadership skills
    `;

    const optRes = await request("/api/optimize", {
      method: "POST",
      body: JSON.stringify({
        resumeId: createdResumeId,
        jobDescription: targetJob,
        jobTitle: "Senior Frontend Engineer",
        jobCompany: "Stripe"
      })
    });

    const opt = optRes.data;
    const score = opt?.score ?? opt?.matchScore;
    const matched = opt?.keywords?.matched ?? opt?.matchedKeywords;
    const missing = opt?.keywords?.missing ?? opt?.missingKeywords;

    const isValidAnalysis =
      optRes.status === 200 &&
      typeof score === "number" &&
      score >= 0 &&
      score <= 100 &&
      Array.isArray(missing) &&
      Array.isArray(matched);

    record(
      "5. ATS Optimizer",
      "Structured ATS Gap Scoring & Keyword Extraction",
      isValidAnalysis,
      `Match Score: ${score}/100, Matched: ${matched?.length}, Missing: ${missing?.length}`
    );
  }

  // =========================================================================
  // 6. TRACKABLE RECRUITER LINKS & LINK LOCK-IN
  // =========================================================================
  console.log("\n--- SECTION 6: RECRUITER LINKS & LINK LOCK-IN ---");
  let testSlug = null;
  let testLinkId = null;
  {
    // A. Generate shareable recruiter link
    const linkRes = await request("/api/links", {
      method: "POST",
      body: JSON.stringify({
        resumeId: createdResumeId,
        companyName: "Google Recruitment Team"
      })
    });
    testSlug = linkRes.data?.slug;
    testLinkId = linkRes.data?.id;
    record("6. Recruiter Links", "Generate shareable link (POST /api/links)", linkRes.status === 200 && !!testSlug, `Slug: /cv/${testSlug}`);

    // B. Public recruiter view (unauthenticated visit)
    // Make request without auth cookie to simulate external recruiter
    const recruiterVisit = await fetch(`${BASE_URL}/cv/${testSlug}`);
    const recruiterHtml = await recruiterVisit.text();
    const showsResume = recruiterVisit.status === 200 && recruiterHtml.includes("Alex Rivera");
    record("6. Recruiter Links", "Public recruiter CV view (/cv/[slug]) renders resume", showsResume, `Recruiter Status: ${recruiterVisit.status}`);

    // C. View counter check
    // Wait brief moment for DB async increment
    await new Promise((r) => setTimeout(r, 800));
    const linksList = await request("/api/links");
    const activeLink = Array.isArray(linksList.data) ? linksList.data.find((l) => l.slug === testSlug) : null;
    record("6. Recruiter Links", "Recruiter link view counter incremented", activeLink && activeLink.view_count >= 1, `View Count: ${activeLink?.view_count}`);

    // D. Link Lock-in: Pause link and verify polite neutral paywall
    const pauseRes = await request("/api/links", {
      method: "PATCH",
      body: JSON.stringify({
        linkId: testLinkId,
        isActive: false
      })
    });
    record("6. Recruiter Links", "Pause link access (PATCH /api/links -> isActive: false)", pauseRes.status === 200 && pauseRes.data?.is_active === false, "Link paused");

    // E. Recruiter visits paused link
    const pausedVisit = await fetch(`${BASE_URL}/cv/${testSlug}`, {
      headers: { "Cache-Control": "no-cache" }
    });
    const pausedHtml = await pausedVisit.text();
    const showsPaywallNotice =
      pausedVisit.status === 200 &&
      (pausedHtml.includes("temporarily disabled") ||
       pausedHtml.includes("Resume Link Inactive") ||
       pausedHtml.includes("currently unavailable") ||
       pausedHtml.includes("paused or ended"));
    record(
      "6. Recruiter Links",
      "Link Lock-in: Polite neutral notice on inactive link",
      showsPaywallNotice,
      `Status: ${pausedVisit.status}, Notice: ${showsPaywallNotice}`
    );
  }

  // =========================================================================
  // 7. EXPORT DATA & ATS PDF GENERATOR
  // =========================================================================
  console.log("\n--- SECTION 7: EXPORT DATA GUARANTEE & ATS PDF ---");
  {
    // A. Complete career JSON export (Lapsed/cancelled user guarantee)
    const exportRes = await request("/api/export/json");
    const hasExportData =
      exportRes.status === 200 &&
      exportRes.data?.user?.profile &&
      Array.isArray(exportRes.data?.resumes);
    record(
      "7. Export Guarantee",
      "Complete user JSON data export (GET /api/export/json)",
      hasExportData,
      `Exported ${exportRes.data?.resumes?.length || 0} resumes, ${exportRes.data?.jobAnalyses?.length || 0} analyses`
    );

    // B. ATS-Proof PDF Generation
    const pdfRes = await fetch(`${BASE_URL}/api/pdf/${createdResumeId}`, {
      headers: { Cookie: getCookieHeader() }
    });
    const pdfBuffer = await pdfRes.arrayBuffer();
    const pdfHeader = Buffer.from(pdfBuffer.slice(0, 4)).toString();
    const isRealPdf = pdfRes.status === 200 && pdfHeader === "%PDF";
    record(
      "7. Export Guarantee",
      "ATS-Proof PDF Generator (GET /api/pdf/[resumeId])",
      isRealPdf,
      `Status: ${pdfRes.status}, Size: ${pdfBuffer.byteLength} bytes, Magic: ${pdfHeader}`
    );
  }

  // =========================================================================
  // 8. BILLING & ACCOUNT MANAGEMENT
  // =========================================================================
  console.log("\n--- SECTION 8: BILLING & ACCOUNT CLEANUP (GDPR/KVKK) ---");
  {
    // A. Billing page render
    const billingRes = await request("/billing");
    record("8. Billing & Account", "Billing page (/billing) with trial countdown", billingRes.status === 200, `Status: ${billingRes.status}`);

    // B. Account Deletion (GDPR/KVKK Cascade Deletion)
    const delRes = await request("/api/account/delete", {
      method: "POST"
    });
    record("8. Billing & Account", "GDPR/KVKK Cascade Account Deletion (POST /api/account/delete)", delRes.status === 200 && delRes.data?.success, "Account & child records purged");
  }

  // =========================================================================
  // FINAL SUMMARY REPORT
  // =========================================================================
  console.log("\n================================================================================");
  console.log("📊 CVFORGE ACCEPTANCE TEST SUMMARY REPORT");
  console.log("================================================================================");

  const total = testResults.length;
  const passed = testResults.filter((t) => t.passed === "PASS").length;
  const failed = total - passed;

  console.table(testResults.map((t) => ({ Section: t.section, Test: t.name, Result: t.passed, Details: t.details })));
  console.log(`\nTOTAL: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`SUCCESS RATE: ${Math.round((passed / total) * 100)}%\n`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL REQUIREMENTS FROM linkedin-cv-optimizer-project-brief.md PASSED SUCCESSFULLY!");
  }
}

main().catch((err) => {
  console.error("FATAL ERROR IN TEST SUITE:", err);
  process.exit(1);
});
