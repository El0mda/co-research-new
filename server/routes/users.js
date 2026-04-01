import { Router } from "express";
import pool from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

router.get("/", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, display_name, full_name, email, profile_photo, field, sub_field,
              degree, university, faculty, interests, orcid, scholar, scopus
       FROM users WHERE is_verified = true ORDER BY display_name`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, display_name, full_name, email, profile_photo, field, sub_field,
              degree, university, faculty, interests, orcid, scholar, scopus
       FROM users WHERE id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

router.patch("/me", authenticate, async (req, res) => {
  const { displayName, profilePhoto, field, subField, degree, university, faculty, interests, orcid, scholar, scopus, langPref } = req.body;
  try {
    const result = await pool.query(
      `UPDATE users SET
        display_name = COALESCE($1, display_name),
        profile_photo = COALESCE($2, profile_photo),
        field = COALESCE($3, field),
        sub_field = COALESCE($4, sub_field),
        degree = COALESCE($5, degree),
        university = COALESCE($6, university),
        faculty = COALESCE($7, faculty),
        interests = COALESCE($8, interests),
        orcid = COALESCE($9, orcid),
        scholar = COALESCE($10, scholar),
        scopus = COALESCE($11, scopus),
        lang_pref = COALESCE($12, lang_pref)
       WHERE id = $13
       RETURNING id, display_name, full_name, email, profile_photo, field, sub_field,
                 degree, university, faculty, interests, orcid, scholar, scopus, lang_pref`,
      [displayName, profilePhoto, field, subField, degree, university, faculty,
       interests, orcid, scholar, scopus, langPref, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

export default router;
