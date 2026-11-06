import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";

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

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const candidateModels = [
  "claude-3-5-haiku-latest",
  "claude-3-5-haiku-20241022",
  "claude-3-haiku-20240307",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-latest"
];

for (const model of candidateModels) {
  try {
    const msg = await anthropic.messages.create({
      model,
      max_tokens: 10,
      messages: [{ role: "user", content: "hi" }]
    });
    console.log(`✓ Model "${model}" works!`);
    break;
  } catch (err) {
    console.log(`✗ Model "${model}" failed:`, err.status, err.message);
  }
}
