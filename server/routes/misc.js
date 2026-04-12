import { Router } from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ── Task notifications (overdue + upcoming within 3 days) ──────────────────
router.get("/task-notifications", authenticate, async (req, res) => {
  try {
    const upcoming = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const today = new Date().toISOString().split("T")[0];
    const result = await pool.query(
      `SELECT t.id, t.title, t.due_date, t.status, t.assignee_id,
              p.id AS project_id, p.title AS project_title, p.title_en AS project_title_en,
              u.display_name AS assignee_name,
              CASE WHEN t.due_date < $1 THEN 'overdue' ELSE 'upcoming' END AS urgency
       FROM tasks t
       JOIN projects p ON p.id = t.project_id
       LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.status != 'completed'
         AND t.due_date IS NOT NULL
         AND t.due_date <= $2
         AND (
           p.leader_id = $3
           OR t.assignee_id = $3
           OR EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = t.project_id AND pm.user_id = $3)
         )
       ORDER BY t.due_date ASC
       LIMIT 15`,
      [today, upcoming, req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch task notifications" });
  }
});

// ── Advertise requests ──────────────────────────────────────────────────────
router.post("/advertise", async (req, res) => {
  const { name, email, phone, organization, adType, description, duration } = req.body;
  if (!name || !email) return res.status(400).json({ error: "Name and email are required" });
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ad_requests (
        id SERIAL PRIMARY KEY, name TEXT, email TEXT, phone TEXT,
        organization TEXT, ad_type TEXT, description TEXT, duration TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`
    );
    await pool.query(
      `INSERT INTO ad_requests (name, email, phone, organization, ad_type, description, duration)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [name, email, phone || "", organization || "", adType || "", description || "", duration || ""]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit" });
  }
});

// ── Contact / Suggestions ───────────────────────────────────────────────────
router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS contact_messages (
        id SERIAL PRIMARY KEY, name TEXT, email TEXT, message TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`
    );
    await pool.query(
      `INSERT INTO contact_messages (name, email, message) VALUES ($1,$2,$3)`,
      [name || "", email || "", message]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit" });
  }
});

// ── IP Complaints ───────────────────────────────────────────────────────────
router.post("/complaints", async (req, res) => {
  const { issueType, country, fullName, email, contentUrl, description } = req.body;
  if (!fullName || !email || !issueType) return res.status(400).json({ error: "Required fields missing" });
  try {
    await pool.query(
      `CREATE TABLE IF NOT EXISTS ip_complaints (
        id SERIAL PRIMARY KEY, issue_type TEXT, country TEXT, full_name TEXT,
        email TEXT, content_url TEXT, description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`
    );
    await pool.query(
      `INSERT INTO ip_complaints (issue_type, country, full_name, email, content_url, description)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [issueType, country || "", fullName, email, contentUrl || "", description || ""]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit" });
  }
});

export default router;
