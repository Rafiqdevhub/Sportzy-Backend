import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/node";
import { ARCJET_KEY, ARCJET_MODE } from "./config/index.js";

if (!ARCJET_KEY) throw new Error("ARCJET_KEY environment variable is missing.");

export const httpArcjet = ARCJET_KEY
  ? arcjet({
      key: ARCJET_KEY,
      rules: [
        shield({ mode: ARCJET_MODE }),
        detectBot({
          mode: ARCJET_MODE,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: ARCJET_MODE, interval: "10s", max: 50 }), // 50 requests per 10 seconds per IP
      ],
    })
  : null;

export const wsArcjet = ARCJET_KEY
  ? arcjet({
      key: ARCJET_KEY,
      rules: [
        shield({ mode: ARCJET_MODE }),
        detectBot({
          mode: ARCJET_MODE,
          allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:PREVIEW"],
        }),
        slidingWindow({ mode: ARCJET_MODE, interval: "2s", max: 5 }),
      ],
    })
  : null;

export const securityMiddleware = () => {
  return async (req, res, next) => {
    if (!httpArcjet) return next();

    try {
      const decision = await httpArcjet.protect(req);

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return res.status(429).json({ error: "Too many requests." });
        }

        return res.status(403).json({ error: "Forbidden." });
      }
    } catch (e) {
      console.error("Arcjet middleware error", e);
      return res.status(503).json({ error: "Service Unavailable" });
    }

    next();
  };
};
