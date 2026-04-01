import { Router } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "../db.js";
import { sendVerificationEmail } from "../email.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateToken() {
  return crypto.randomBytes(48).toString("hex");
}

// ── Register ──────────────────────────────────────────────────────────────
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

    await pool.query("DELETE FROM verification_codes WHERE email = $1", [email]);
    await pool.query(
      "INSERT INTO verification_codes (email, code, expires_at) VALUES ($1, $2, $3)",
      [email, code, expiresAt]
    );

    try {
      await sendVerificationEmail(email, code, langPref || "ar");
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
    }

    return res.json({ success: true, message: "Verification email sent" });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: err.message || "Registration failed" });
  }
});

// ── Verify Email ──────────────────────────────────────────────────────────
router.post("/verify-email", async (req, res) => {
  const { email, code, keepLoggedIn } = req.body;

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

    await pool.query("UPDATE verification_codes SET used = true WHERE id = $1", [result.rows[0].id]);
    await pool.query("UPDATE users SET is_verified = true WHERE email = $1", [email]);

    const userResult = await pool.query(
      `SELECT id, full_name, display_name, email, profile_photo, field, sub_field,
              degree, university, faculty, interests, orcid, scholar, scopus, lang_pref, is_approved
       FROM users WHERE email = $1`,
      [email]
    );
    const user = userResult.rows[0];

    const token = generateToken();
    const daysValid = keepLoggedIn ? 30 : 1;
    const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);
    await pool.query(
      "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
      [token, user.id, expiresAt]
    );

    return res.json({ success: true, token, user });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: "Verification failed" });
  }
});

// ── Login ─────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password, keepLoggedIn } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Email and password required" });

  try {
    const result = await pool.query(
      `SELECT id, full_name, display_name, email, password_hash, profile_photo,
              field, sub_field, degree, university, faculty, interests, orcid,
              scholar, scopus, lang_pref, is_verified, is_approved
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    if (!user.is_verified) {
      return res.status(403).json({ error: "Please verify your email first", needsVerification: true, email });
    }

    const token = generateToken();
    const daysValid = keepLoggedIn ? 30 : 1;
    const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000);
    await pool.query(
      "INSERT INTO sessions (token, user_id, expires_at) VALUES ($1, $2, $3)",
      [token, user.id, expiresAt]
    );

    const { password_hash, ...safeUser } = user;
    return res.json({ success: true, token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed" });
  }
});

// ── Me ────────────────────────────────────────────────────────────────────
router.get("/me", authenticate, (req, res) => {
  res.json(req.user);
});

// ── Logout ────────────────────────────────────────────────────────────────
router.post("/logout", authenticate, async (req, res) => {
  const token = req.headers.authorization?.slice(7);
  try {
    await pool.query("DELETE FROM sessions WHERE token = $1", [token]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Logout failed" });
  }
});

// ── Resend Code ───────────────────────────────────────────────────────────
router.post("/resend-code", async (req, res) => {
  const { email, langPref } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required" });

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

    try {
      await sendVerificationEmail(email, code, langPref || "ar");
    } catch (emailErr) {
      console.error("Email send failed:", emailErr.message);
    }

    return res.json({ success: true, message: "Verification email resent" });
  } catch (err) {
    console.error("Resend error:", err);
    return res.status(500).json({ error: "Failed to resend code" });
  }
});

export default router;
