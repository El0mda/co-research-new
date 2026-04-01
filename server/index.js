import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";

const app = express();
const PORT = 3001;

app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/auth", authRoutes);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server running on port ${PORT}`);
});
