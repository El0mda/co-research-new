import pool from "../db.js";

export async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = header.slice(7);
  try {
    const result = await pool.query(
      `SELECT s.user_id, u.id, u.full_name, u.display_name, u.email, u.email_type,
              u.profile_photo, u.field, u.sub_field, u.degree, u.university,
              u.faculty, u.interests, u.orcid, u.scholar, u.scopus,
              u.lang_pref, u.is_verified, u.is_approved
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Session expired or invalid" });
    }
    req.user = result.rows[0];
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ error: "Auth check failed" });
  }
}
