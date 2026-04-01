import { Router } from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT t.*, u.display_name AS assignee_name
       FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.project_id = $1 ORDER BY t.created_at`,
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

router.post("/", authenticate, async (req, res) => {
  const { title, description, assigneeId, dueDate, status } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: "Title is required" });
  try {
    const result = await pool.query(
      `INSERT INTO tasks (project_id, title, description, assignee_id, due_date, status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.params.projectId, title, description || "", assigneeId || null, dueDate || null, status || "in-progress"]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.patch("/:taskId", authenticate, async (req, res) => {
  const { status, title, description, assigneeId, dueDate } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tasks SET
        status = COALESCE($1, status),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        assignee_id = COALESCE($4, assignee_id),
        due_date = COALESCE($5, due_date)
       WHERE id = $6 AND project_id = $7 RETURNING *`,
      [status, title, description, assigneeId, dueDate, req.params.taskId, req.params.projectId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Task not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

router.delete("/:taskId", authenticate, async (req, res) => {
  try {
    await pool.query("DELETE FROM tasks WHERE id = $1 AND project_id = $2", [req.params.taskId, req.params.projectId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
