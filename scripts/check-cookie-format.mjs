import { createBrowserClient } from "@supabase/ssr";
import fs from "fs";

// Load .env.local manually if not in process.env
if (!process.env.NEXT_PUBLIC_SUPABASE_URL && fs.existsSync(".env.local")) {
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let cookieStore = {};
global.document = {
  get cookie() {
    return Object.entries(cookieStore)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  },
  set cookie(val) {
    const parts = val.split(";")[0].split("=");
    const k = parts[0].trim();
    const v = parts.slice(1).join("=").trim();
    cookieStore[k] = v;
  }
};

const supabase = createBrowserClient(supabaseUrl, supabaseAnon);
console.log("Supabase browser client created successfully");
