import { Router } from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// GET /api/notifications
// Returns pending join requests for all projects where the current user is the leader.
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT jr.id, jr.project_id, jr.user_id, jr.message, jr.status, jr.created_at,
              u.display_name, u.email, u.field, u.sub_field, u.degree, u.university, u.profile_photo,
              p.title AS project_title, p.title_en AS project_title_en
       FROM join_requests jr
       JOIN users u ON u.id = jr.user_id
       JOIN projects p ON p.id = jr.project_id
       WHERE p.leader_id = $1 AND jr.status = 'pending'
       ORDER BY jr.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

export default router;
