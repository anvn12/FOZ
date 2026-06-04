import "dotenv/config";
import express from "express";
import cors from "cors";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { uploadsDir } from "./lib/upload.js";
import { Server } from "socket.io";
import errorHandler from "./middleware/errorHandler.js";
import { registerSocketHandlers } from "./socket/handlers.js";
import { setIo } from "./io.js";
import sessionRouter from "./routes/session.js";
import usersRouter from "./routes/users.js";
import threadsRouter from "./routes/threads.js";
import repliesRouter from "./routes/replies.js";
import likesRouter from "./routes/likes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";
const io = new Server(httpServer, {
  cors: { origin: clientUrl, credentials: true },
});
setIo(io);
registerSocketHandlers(io);

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET ?? "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use("/uploads", express.static(uploadsDir));

app.use("/api/session", sessionRouter);
app.use("/api/users", usersRouter);
app.use("/api/threads", threadsRouter);
app.use("/api", repliesRouter);
app.use("/api", likesRouter);

app.use(errorHandler);

const port = parseInt(process.env.PORT ?? "3000", 10);
httpServer.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

export { app, io, httpServer };
