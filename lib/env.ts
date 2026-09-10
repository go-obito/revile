import { config } from "dotenv";
import { existsSync } from "node:fs";
import path from "node:path";

const envFile = path.join(process.cwd(), ".env.local");

export function loadEnv() {
  if (process.env.__REVILE_ENV_LOADED === "1") return;

  if (existsSync(envFile)) {
    config({ path: envFile });
  } else {
    config();
  }

  process.env.__REVILE_ENV_LOADED = "1";
}
