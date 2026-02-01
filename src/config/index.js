import "dotenv/config";

export const PORT = Number.parseInt(process.env.PORT || "8000", 10);
export const HOST = process.env.HOST || "0.0.0.0";
export const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

export const DATABASE_URL = process.env.DATABASE_URL;

export const ARCJET_KEY = process.env.ARCJET_KEY;
export const ARCJET_MODE =
  process.env.ARCJECT_MODE === "DRY_RUN" ? "DRY_RUN" : "LIVE";

export const DELAY_MS = Number.parseInt(process.env.DELAY_MS || "250", 10);
export const SEED_MATCH_DURATION_MINUTES = Number.parseInt(
  process.env.SEED_MATCH_DURATION_MINUTES || "120",
  10,
);
export const SEED_FORCE_LIVE =
  process.env.SEED_FORCE_LIVE !== "0" &&
  process.env.SEED_FORCE_LIVE !== "false";
export const API_URL = process.env.API_URL;
