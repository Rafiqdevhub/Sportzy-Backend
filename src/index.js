import express from "express";
import http from "http";
import "dotenv/config";
import { commentaryRouter } from "./routes/commentaryRoute.js";
import { matchRouter } from "./routes/matchRoute.js";
import { attachWebSocketServer } from "./ws/server.js";
import { securityMiddleware } from "./arcjet.js";

const app = express();
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.json());
const server = http.createServer(app);

app.get("/", (req, res) => {
  res.json({ message: "Sportzy API is running." });
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
  console.log(`Server is running at ${baseUUrl}`);
  console.log(
    `Websocket Server is runing on ${baseUUrl.replace("http", "ws")}/ws`,
  );
});
