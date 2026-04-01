import { Router } from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, u.display_name AS sender_name, u.profile_photo AS sender_photo
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.project_id = $1 ORDER BY m.created_at`,
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { text, attachmentName, attachmentType, attachmentData } = req.body;
  if (!text?.trim() && !attachmentName) return res.status(400).json({ error: "Message cannot be empty" });
  try {
    const result = await pool.query(
      `INSERT INTO messages (project_id, sender_id, text, attachment_name, attachment_type, attachment_data)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.projectId, req.user.id, text || "", attachmentName || null, attachmentType || null, attachmentData || null]
    );
    const full = await pool.query(
      `SELECT m.*, u.display_name AS sender_name, u.profile_photo AS sender_photo
       FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.id = $1`,
      [result.rows[0].id]
    );
    res.status(201).json(full.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
