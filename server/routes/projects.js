import { Router } from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// ── List projects ──────────────────────────────────────────────────────────
router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*,
        ARRAY_AGG(pm.user_id ORDER BY pm.member_order) FILTER (WHERE pm.user_id IS NOT NULL) AS member_ids,
        u.display_name AS leader_name, u.profile_photo AS leader_photo
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id
       LEFT JOIN users u ON u.id = p.leader_id
       GROUP BY p.id, u.display_name, u.profile_photo
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// ── Get single project ─────────────────────────────────────────────────────
router.get("/:id", authenticate, async (req, res) => {
  try {
    const projRes = await pool.query(
      `SELECT p.*,
        ARRAY_AGG(pm.user_id ORDER BY pm.member_order) FILTER (WHERE pm.user_id IS NOT NULL) AS member_ids
       FROM projects p
       LEFT JOIN project_members pm ON pm.project_id = p.id
       WHERE p.id = $1
       GROUP BY p.id`,
      [req.params.id]
    );
    if (projRes.rows.length === 0) return res.status(404).json({ error: "Project not found" });

    const tasksRes = await pool.query(
      `SELECT t.*, u.display_name AS assignee_name
       FROM tasks t LEFT JOIN users u ON u.id = t.assignee_id
       WHERE t.project_id = $1 ORDER BY t.created_at`,
      [req.params.id]
    );

    const msgsRes = await pool.query(
      `SELECT m.*, u.display_name AS sender_name, u.profile_photo AS sender_photo
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.project_id = $1 ORDER BY m.created_at`,
      [req.params.id]
    );

    const membersRes = await pool.query(
      `SELECT u.id, u.display_name, u.full_name, u.email, u.profile_photo,
              u.field, u.sub_field, u.degree, u.university, u.faculty,
              u.interests, u.orcid, u.scholar, u.scopus, pm.member_order
       FROM project_members pm JOIN users u ON u.id = pm.user_id
       WHERE pm.project_id = $1 ORDER BY pm.member_order`,
      [req.params.id]
    );

    res.json({
      ...projRes.rows[0],
      tasks: tasksRes.rows,
      messages: msgsRes.rows,
      members: membersRes.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// ── Create project ──────────────────────────────────────────────────────────
router.post("/", authenticate, async (req, res) => {
  const {
    title, titleEn, description, descriptionEn,
    field, fieldEn, subField, subFieldEn,
    type, otherType, researchLang, joinQuestions, startDate, endDate, maxMembers,
  } = req.body;

  if (!title || !titleEn) return res.status(400).json({ error: "Title is required" });

  const resolvedType = type === "other" && otherType ? otherType : (type || "empirical");
  const lang = researchLang || "arabic";
  const questions = Array.isArray(joinQuestions) ? joinQuestions.filter(q => q.trim()) : [];

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const projRes = await client.query(
      `INSERT INTO projects (title, title_en, description, description_en, field, field_en,
        sub_field, sub_field_en, type, research_lang, join_questions, start_date, end_date, max_members, leader_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [title, titleEn, description || "", descriptionEn || "",
       field || "", fieldEn || field || "", subField || "", subFieldEn || subField || "",
       resolvedType, lang, questions,
       startDate || null, endDate || null,
       parseInt(maxMembers) || 4, req.user.id]
    );
    const project = projRes.rows[0];
    await client.query(
      `INSERT INTO project_members (project_id, user_id, member_order) VALUES ($1, $2, 0)`,
      [project.id, req.user.id]
    );
    await client.query("COMMIT");
    res.status(201).json({ ...project, member_ids: [req.user.id], tasks: [], messages: [], members: [] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Failed to create project" });
  } finally {
    client.release();
  }
});

// ── Update project ──────────────────────────────────────────────────────────
router.patch("/:id", authenticate, async (req, res) => {
  const { status, completion, title, titleEn } = req.body;
  try {
    const result = await pool.query(
      `UPDATE projects SET
        status = COALESCE($1, status),
        completion = COALESCE($2, completion),
        title = COALESCE($3, title),
        title_en = COALESCE($4, title_en)
       WHERE id = $5 AND leader_id = $6 RETURNING *`,
      [status, completion, title, titleEn, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(403).json({ error: "Not authorized or project not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
});

// ── Reorder members (author order) ────────────────────────────────────────
router.patch("/:id/members/reorder", authenticate, async (req, res) => {
  const { orderedUserIds } = req.body;
  if (!Array.isArray(orderedUserIds)) return res.status(400).json({ error: "orderedUserIds must be an array" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (let i = 0; i < orderedUserIds.length; i++) {
      await client.query(
        `UPDATE project_members SET member_order = $1 WHERE project_id = $2 AND user_id = $3`,
        [i, req.params.id, orderedUserIds[i]]
      );
    }
    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to reorder members" });
  } finally {
    client.release();
  }
});

// ── Get project join questions (public, authenticated) ─────────────────────
router.get("/:id/join-questions", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT join_questions FROM projects WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Project not found" });
    res.json({ join_questions: result.rows[0].join_questions || [] });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch questions" });
  }
});

// ── Join request ────────────────────────────────────────────────────────────
router.post("/:id/join-request", authenticate, async (req, res) => {
  const { message, answers } = req.body;
  try {
    const proj = await pool.query("SELECT * FROM projects WHERE id = $1", [req.params.id]);
    if (proj.rows.length === 0) return res.status(404).json({ error: "Project not found" });

    const already = await pool.query(
      "SELECT * FROM project_members WHERE project_id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    if (already.rows.length > 0) return res.status(409).json({ error: "Already a member" });

    const answerArr = Array.isArray(answers) ? answers : [];

    await pool.query(
      `INSERT INTO join_requests (project_id, user_id, message, answers) VALUES ($1, $2, $3, $4)
       ON CONFLICT (project_id, user_id) DO UPDATE SET status = 'pending', message = $3, answers = $4`,
      [req.params.id, req.user.id, message || "", answerArr]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to send join request" });
  }
});

// ── Get join requests (project leader only) ────────────────────────────────
router.get("/:id/join-requests", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT jr.*, u.display_name, u.email, u.field, u.degree
       FROM join_requests jr JOIN users u ON u.id = jr.user_id
       WHERE jr.project_id = $1
       ORDER BY jr.created_at DESC`,
      [req.params.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch join requests" });
  }
});

// ── Approve / reject join request ─────────────────────────────────────────
router.patch("/:id/join-requests/:requestId", authenticate, async (req, res) => {
  const { action } = req.body;
  if (!["approve", "reject"].includes(action)) return res.status(400).json({ error: "Invalid action" });

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const reqRes = await client.query(
      "SELECT * FROM join_requests WHERE id = $1 AND project_id = $2",
      [req.params.requestId, req.params.id]
    );
    if (reqRes.rows.length === 0) return res.status(404).json({ error: "Request not found" });

    await client.query(
      "UPDATE join_requests SET status = $1 WHERE id = $2",
      [action === "approve" ? "approved" : "rejected", req.params.requestId]
    );

    if (action === "approve") {
      const countRes = await client.query(
        "SELECT COUNT(*) FROM project_members WHERE project_id = $1",
        [req.params.id]
      );
      const order = parseInt(countRes.rows[0].count);
      await client.query(
        "INSERT INTO project_members (project_id, user_id, member_order) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
        [req.params.id, reqRes.rows[0].user_id, order]
      );
    }
    await client.query("COMMIT");
    res.json({ success: true });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Failed to process request" });
  } finally {
    client.release();
  }
});

export default router;
