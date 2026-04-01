import { Router } from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import { sendVerificationEmail } from "../email.js";

const router = Router();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/register", async (req, res) => {
  const {
    fullName, displayName, email, password, country, nationalId,
    emailType, employmentDoc, profilePhoto, field, subField, degree,
    university, faculty, interests, orcid, scholar, scopus,
    langPref, actionPref,
  } = req.body;

  if (!email || !password || !fullName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users (
        full_name, display_name, email, password_hash, country, national_id,
        email_type, employment_doc, profile_photo, field, sub_field, degree,
        university, faculty, interests, orcid, scholar, scopus,
        lang_pref, action_pref, is_verified, is_approved
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,false,false)`,
      [
        fullName, displayName, email, passwordHash, country, nationalId,
        emailType, employmentDoc, profilePhoto, field, subField, degree,
        university, faculty, interests || [], orcid, scholar, scopus,
        langPref || "ar", actionPref,
      ]
    );

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      "DELETE FROM verification_codes WHERE email = $1",
      [email]
    );

    await pool.query(
      "INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [email, code, expiresAt]
    );

    await sendVerificationEmail(email, code, langPref || "ar");

    return res.json({ success: true, message: "Verification email sent" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: err.message || "Registration failed" });
  }
});

router.post("/verify-email", async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  try {
    const result = await pool.query(
      `SELECT * FROM verification_codes
       WHERE email = $1 AND code = $2 AND used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email, code]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired code" });
    }

    await pool.query(
      "UPDATE verification_codes SET used = true WHERE id = $1",
      [result.rows[0].id]
    );

    await pool.query(
      "UPDATE users SET is_verified = true WHERE email = $1",
      [email]
    );

    const userResult = await pool.query(
      "SELECT id, full_name, display_name, email, is_approved FROM users WHERE email = $1",
      [email]
    );

    return res.json({ success: true, user: userResult.rows[0] });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

router.post("/resend-code", async (req, res) => {
  const { email, langPref } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1 AND is_verified = false",
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found or already verified" });
    }

    const lastCode = await pool.query(
      "SELECT created_at FROM verification_codes WHERE email = $1 AND used = false ORDER BY created_at DESC LIMIT 1",
      [email]
    );

    if (lastCode.rows.length > 0) {
      const timeSince = Date.now() - new Date(lastCode.rows[0].created_at).getTime();
      if (timeSince < 60 * 1000) {
        return res.status(429).json({ error: "Please wait before requesting a new code" });
      }
    }

    await pool.query("DELETE FROM verification_codes WHERE email = $1", [email]);

    const code = generateCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query(
      "INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [email, code, expiresAt]
    );

    await sendVerificationEmail(email, code, langPref || "ar");

    return res.json({ success: true, message: "Verification email resent" });
  } catch (err) {
    console.error("Resend error:", err);
    return res.status(500).json({ error: "Failed to resend code" });
  }
});

export default router;
