import express from "express";
import http from "http";
import cors from "cors";
import { commentaryRouter } from "./routes/commentaryRoute.js";
import { matchRouter } from "./routes/matchRoute.js";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";
import { CORS_ORIGIN, HOST, PORT } from "./config/index.js";
import { apiLogger, logger } from "./middleware/logger.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: CORS_ORIGIN,
  }),
);

app.use(apiLogger());

const server = http.createServer(app);

app.get("/", (req, res) => {
  res.json({ message: "Sportzy Backend is running!" });
});

app.use(securityMiddleware());

app.use("/matches", matchRouter);
app.use("/matches/:id/commentary", commentaryRouter);

const { broadcastMatchCreated, broadcastCommentary } =
  attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

server.listen(PORT, HOST, () => {
  const baseUUrl =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  logger.success(`Server is running at ${baseUUrl}`);
  logger.info(
    `Websocket Server is runing on ${baseUUrl.replace("http", "ws")}/ws`,
  );
  logger.info("API Logger is active - all requests will be tracked");
});
