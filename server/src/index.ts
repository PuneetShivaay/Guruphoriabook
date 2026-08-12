// We intialize server here
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express from "express";
import { auth } from "./lib/auth.js";
import { errorHandler } from "./middleware/error-handler.middleware.js";
import { registerRoutes } from "./routes/index.js";
// import { serve } from "inngest/express";
// import { inngest } from "./inngest/client.js";
// import { functions } from "./inngest/index.js";
const app = express();
const PORT = process.env.PORT ?? 8080;
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3000";

app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  }),
);

app.all("/api/auth/{*any}", toNodeHandler(auth));
// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello GuruPhoria");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

registerRoutes(app);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server is running on port " + PORT);
});
