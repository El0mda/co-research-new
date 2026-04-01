import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import projectRoutes from "./routes/projects.js";
import taskRoutes from "./routes/tasks.js";
import messageRoutes from "./routes/messages.js";
import userRoutes from "./routes/users.js";

const app = express();
const PORT = 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/tasks", taskRoutes);
app.use("/api/projects/:projectId/messages", messageRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
});
