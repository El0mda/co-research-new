import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/Header";
import { Upload, X, Plus, Loader2 } from "lucide-react";

// ─── Academic domain validation ───────────────────────────────────────────────
const ACADEMIC_DOMAIN_PATTERNS = [
  /\.edu$/i,
  /\.edu\.[a-z]{2}$/i,
  /\.ac\.[a-z]{2}$/i,
  /\.rnu\.[a-z]{2}$/i,
  /\.dz$/i,
  /\.mr$/i,
];

const isAcademicEmail = (email: string): boolean =>
  ACADEMIC_DOMAIN_PATTERNS.some((re) => re.test(email.split("@")[1] ?? ""));

// "Other" label in both languages
const OTHER_VALUES = ["Other", "أخرى"];

// ─── File → base64 ────────────────────────────────────────────────────────────
const toBase64 = (file: File): Promise<string> =>
  new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result as string);
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });

// ─── Component ────────────────────────────────────────────────────────────────
const RegisterPage: React.FC = () => {
  const { t } = useLang();
  const { setIsLoggedIn } = useApp();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);

  // Pull arrays from translation file — keys match the active locale automatically
  const steps = t("register.steps") as unknown as string[];
  const fields = t("register.fields") as unknown as string[];
  const degrees = t("register.degrees") as unknown as string[];
  // subFields is a locale-aware map: { 'Computer Science': [...], ... }
  const subFieldsMap = t("register.subFields") as unknown as Record<
    string,
    string[]
  >;

  // ── Step 1 ──────────────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [country, setCountry] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [email, setEmail] = useState("");
  const [emailType, setEmailType] = useState<"academic" | "non-academic" | "">(
    "",
  );
  const [employmentDoc, setEmploymentDoc] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  // ── Step 2 ──────────────────────────────────────────────────────────────────
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [field, setField] = useState("");
  const [subField, setSubField] = useState("");
  const [subFieldOther, setSubFieldOther] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [interestInput, setInterestInput] = useState("");
  const [degree, setDegree] = useState("");
  const [university, setUniversity] = useState("");
  const [faculty, setFaculty] = useState("");

  // ── Step 3 ──────────────────────────────────────────────────────────────────
  const [orcid, setOrcid] = useState("");
  const [scholar, setScholar] = useState("");
  const [scopus, setScopus] = useState("");

  // ── Step 4 ──────────────────────────────────────────────────────────────────
  const [langPref, setLangPref] = useState<"ar" | "en">("ar");
  const [actionPref, setActionPref] = useState<"create" | "find" | "">("");

  // ── Verification ─────────────────────────────────────────────────────────────
  const [verificationCode, setVerificationCode] = useState("");

  // ── Async state ───────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(false);

  // ── Errors ────────────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived
  const availableSubFields: string[] = subFieldsMap[field] ?? [];
  const isOtherSubField = OTHER_VALUES.includes(subField);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const handleEmailChange = (val: string) => {
    setEmail(val);
    const domain = val.split("@")[1] ?? "";
    setEmailType(
      domain ? (isAcademicEmail(val) ? "academic" : "non-academic") : "",
    );
  };

  const handleFileInput =
    (setter: (v: string) => void) =>
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) setter(await toBase64(file));
    };

  const addInterest = () => {
    const tag = interestInput.trim();
    if (tag && !interests.includes(tag)) {
      setInterests((prev) => [...prev, tag]);
      setInterestInput("");
    }
  };

  const validate = (s: number): boolean => {
    const errs: Record<string, string> = {};
    const req = t("register.errors.required") as string;

    if (s === 0) {
      if (!fullName.trim()) errs.fullName = req;
      if (!displayName.trim()) errs.displayName = req;
      if (!country.trim()) errs.country = req;
      if (!nationalId.trim()) errs.nationalId = req;
      if (!email.trim()) errs.email = req;
      else if (!emailType)
        errs.email = t("register.errors.invalidEmail") as string;
      else if (emailType === "non-academic" && !employmentDoc)
        errs.employmentDoc = req;
      if (password.length < 8)
        errs.password = t("register.errors.passwordShort") as string;
      if (password !== confirmPwd)
        errs.confirmPwd = t("register.errors.passwordMismatch") as string;
      if (!agreeTerms)
        errs.agreeTerms = t("register.errors.agreeRequired") as string;
    }

    if (s === 1) {
      if (!profilePhoto) errs.profilePhoto = req;
      if (!field) errs.field = req;
      if (!subField) errs.subField = req;
      if (isOtherSubField && !subFieldOther.trim()) errs.subFieldOther = req;
      if (!degree) errs.degree = req;
      if (!university.trim()) errs.university = req;
      if (!faculty.trim()) errs.faculty = req;
    }

    if (s === 4) {
      if (verificationCode.length < 6) errs.verificationCode = req;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = async () => {
    if (!validate(step)) return;
    setApiError("");

    if (step === 3) {
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName, displayName, email, password, country, nationalId,
            emailType, employmentDoc, profilePhoto, field,
            subField: isOtherSubField ? subFieldOther : subField,
            degree, university, faculty, interests, orcid, scholar, scopus,
            langPref, actionPref,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        setStep(4);
      } catch (err: unknown) {
        setApiError(err instanceof Error ? err.message : "Registration failed");
      } finally {
        setIsSubmitting(false);
      }
    } else if (step === 4) {
      if (verificationCode.length < 6) {
        setErrors({ verificationCode: t("register.errors.required") as string });
        return;
      }
      setIsSubmitting(true);
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code: verificationCode }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Verification failed");
        setIsLoggedIn(true);
        navigate("/dashboard");
      } catch (err: unknown) {
        setApiError(err instanceof Error ? err.message : "Verification failed");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setStep((s) => s + 1);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown) return;
    setApiError("");
    setResendCooldown(true);
    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, langPref }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to resend");
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Failed to resend code");
    }
    setTimeout(() => setResendCooldown(false), 60000);
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-2xl py-12">
        <h1 className="font-heading text-3xl font-bold text-center mb-8">
          {t("register.title") as string}
        </h1>

        {/* Progress bar */}
        {step < 4 && (
          <div className="flex items-center justify-between mb-10">
            {steps.map((label, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      i <= step
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-muted-foreground"
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span className="mt-2 text-xs text-muted-foreground hidden sm:block">
                    {label}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 ${i < step ? "bg-primary" : "bg-border"}`}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ══ STEP 1 — Account Info ══════════════════════════════════════════════ */}
        {step === 0 && (
          <div className="space-y-5">
            <FormField
              label={t("register.step1.fullName") as string}
              error={errors.fullName}
            >
              <input
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </FormField>

            <FormField
              label={t("register.step1.displayName") as string}
              hint={t("register.step1.displayNameHint") as string}
              error={errors.displayName}
            >
              <input
                className="form-input"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </FormField>

            <FormField
              label={t("register.step1.country") as string}
              error={errors.country}
            >
              <input
                className="form-input"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </FormField>

            <FormField
              label={t("register.step1.nationalId") as string}
              hint={t("register.step1.nationalIdHint") as string}
              error={errors.nationalId}
            >
              <input
                className="form-input"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
              />
            </FormField>

            <FormField
              label={t("register.step1.email") as string}
              hint={t("register.step1.emailHint") as string}
              error={errors.email}
            >
              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
              />

              {emailType === "academic" && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ {t("register.step1.academicVerified") as string}
                </p>
              )}

              {emailType === "non-academic" && (
                <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-4 space-y-3">
                  <p className="text-sm text-amber-800">
                    {t("register.step1.nonAcademicWarning") as string}
                  </p>
                  <div>
                    <label className="block text-xs font-medium mb-1 text-amber-800">
                      {t("register.step1.employmentDoc") as string}
                    </label>
                    <label
                      className={`flex h-20 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                        employmentDoc
                          ? "border-primary bg-gold-subtle"
                          : errors.employmentDoc
                            ? "border-destructive"
                            : "border-amber-300 hover:border-amber-500"
                      }`}
                    >
                      {employmentDoc ? (
                        <span className="text-xs text-primary font-medium">
                          ✓ {t("register.step1.docUploaded") as string}
                        </span>
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-amber-500 mb-1" />
                          <span className="text-xs text-amber-600">
                            {t("register.step1.uploadDoc") as string}
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*,application/pdf"
                        onChange={handleFileInput(setEmploymentDoc)}
                      />
                    </label>
                    {errors.employmentDoc && (
                      <p className="text-xs text-destructive mt-1">
                        {errors.employmentDoc}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-amber-700">
                    {t("register.step1.pendingReview") as string}
                  </p>
                </div>
              )}
            </FormField>

            <FormField
              label={t("register.step1.password") as string}
              error={errors.password}
            >
              <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </FormField>

            <FormField
              label={t("register.step1.confirmPassword") as string}
              error={errors.confirmPwd}
            >
              <input
                className="form-input"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
              />
            </FormField>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              {t("register.step1.keepLoggedIn") as string}
            </label>

            <div>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                {t("register.step1.agreeTerms") as string}
              </label>
              {errors.agreeTerms && (
                <p className="text-xs text-destructive mt-1">
                  {errors.agreeTerms}
                </p>
              )}
            </div>

            <div className="text-end">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-xs text-primary underline underline-offset-2 hover:opacity-75 transition-opacity"
              >
                {t("register.step1.forgotPassword") as string}
              </button>
            </div>
          </div>
        )}

        {/* ══ STEP 2 — Academic Profile ══════════════════════════════════════════ */}
        {step === 1 && (
          <div className="space-y-5">
            {/* Profile photo */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("register.step2.profilePhoto") as string}
              </label>
              <label
                className={`flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-full border-2 border-dashed overflow-hidden transition-colors ${
                  profilePhoto
                    ? "border-primary"
                    : errors.profilePhoto
                      ? "border-destructive"
                      : "border-border hover:border-muted-foreground"
                }`}
              >
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
                <input
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileInput(setProfilePhoto)}
                />
              </label>
              {errors.profilePhoto && (
                <p className="text-xs text-destructive mt-1">
                  {errors.profilePhoto}
                </p>
              )}
            </div>

            {/* ID deferred notice */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <p className="text-xs text-blue-700">
                {t("register.step2.idNotice") as string}
              </p>
            </div>

            {/* Main field */}
            <FormField
              label={t("register.step2.field") as string}
              error={errors.field}
            >
              <select
                className="form-input"
                value={field}
                onChange={(e) => {
                  setField(e.target.value);
                  setSubField("");
                  setSubFieldOther("");
                }}
              >
                <option value=""></option>
                {fields.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </FormField>

            {/* Sub-field — driven by translation map */}
            {field && (
              <FormField
                label={t("register.step2.subField") as string}
                hint={t("register.step2.subFieldHint") as string}
                error={errors.subField}
              >
                {availableSubFields.length > 0 ? (
                  <select
                    className="form-input"
                    value={subField}
                    onChange={(e) => {
                      setSubField(e.target.value);
                      setSubFieldOther("");
                    }}
                  >
                    <option value=""></option>
                    {availableSubFields.map((sf) => (
                      <option key={sf} value={sf}>
                        {sf}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    className="form-input"
                    value={subField}
                    onChange={(e) => setSubField(e.target.value)}
                  />
                )}
              </FormField>
            )}

            {/* "Other" free-text */}
            {isOtherSubField && (
              <FormField
                label={t("register.step2.subFieldOther") as string}
                error={errors.subFieldOther}
              >
                <input
                  className="form-input"
                  value={subFieldOther}
                  onChange={(e) => setSubFieldOther(e.target.value)}
                />
              </FormField>
            )}

            {/* Interests */}
            <FormField
              label={t("register.step2.interests") as string}
              hint={t("register.step2.interestsHint") as string}
            >
              <div className="flex flex-wrap gap-2 mb-2">
                {interests.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded-full bg-gold-subtle px-3 py-1 text-xs text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() =>
                        setInterests((prev) => prev.filter((i) => i !== tag))
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="form-input flex-1"
                  value={interestInput}
                  placeholder={
                    t("register.step2.interestsPlaceholder") as string
                  }
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addInterest())
                  }
                />
                <button
                  type="button"
                  onClick={addInterest}
                  className="rounded-lg border border-border px-3 py-2 hover:bg-secondary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </FormField>

            <FormField
              label={t("register.step2.degree") as string}
              error={errors.degree}
            >
              <select
                className="form-input"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
              >
                <option value=""></option>
                {degrees.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label={t("register.step2.university") as string}
              error={errors.university}
            >
              <input
                className="form-input"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
              />
            </FormField>

            <FormField
              label={t("register.step2.faculty") as string}
              error={errors.faculty}
            >
              <input
                className="form-input"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
              />
            </FormField>
          </div>
        )}

        {/* ══ STEP 3 — Research IDs ══════════════════════════════════════════════ */}
        {step === 2 && (
          <div className="space-y-5">
            <p className="text-sm text-muted-foreground">
              {t("register.step3.optional") as string}
            </p>
            <FormField label={t("register.step3.orcid") as string}>
              <input
                className="form-input"
                value={orcid}
                onChange={(e) => setOrcid(e.target.value)}
                placeholder="0000-0000-0000-0000"
              />
            </FormField>
            <FormField label={t("register.step3.scholar") as string}>
              <input
                className="form-input"
                value={scholar}
                onChange={(e) => setScholar(e.target.value)}
                placeholder="https://scholar.google.com/..."
              />
            </FormField>
            <FormField label={t("register.step3.scopus") as string}>
              <input
                className="form-input"
                value={scopus}
                onChange={(e) => setScopus(e.target.value)}
                placeholder="https://www.scopus.com/..."
              />
            </FormField>
          </div>
        )}

        {/* ══ STEP 4 — Preferences ═══════════════════════════════════════════════ */}
        {step === 3 && (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-medium mb-3">
                {t("register.step4.langPref") as string}
              </label>
              <div className="grid grid-cols-2 gap-4">
                {(["ar", "en"] as const).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLangPref(lang)}
                    className={`rounded-xl border-2 p-6 text-center transition-all ${
                      langPref === lang
                        ? "border-primary bg-gold-subtle"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <span className="text-2xl mb-2 block">
                      {lang === "ar" ? "🇸🇦" : "🇺🇸"}
                    </span>
                    <span className="font-semibold">
                      {lang === "ar"
                        ? (t("register.step4.arabic") as string)
                        : (t("register.step4.english") as string)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-3">
                {t("register.step4.action") as string}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setActionPref("create")}
                  className={`rounded-xl border-2 p-6 text-center transition-all ${
                    actionPref === "create"
                      ? "border-primary bg-gold-subtle"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <Plus className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <span className="font-semibold text-sm">
                    {t("register.step4.createTeam") as string}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActionPref("find")}
                  className={`rounded-xl border-2 p-6 text-center transition-all ${
                    actionPref === "find"
                      ? "border-primary bg-gold-subtle"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <svg
                    className="h-8 w-8 mx-auto mb-2 text-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <span className="font-semibold text-sm">
                    {t("register.step4.findTeam") as string}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ══ STEP 5 — Email Verification ════════════════════════════════════════ */}
        {step === 4 && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gold-subtle text-4xl">
              📧
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">
                {t("register.verify.title") as string}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t("register.verify.sentTo") as string}{" "}
                <strong className="text-foreground">{email}</strong>
              </p>
              {emailType === "non-academic" && (
                <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                  {t("register.verify.pendingManualReview") as string}
                </p>
              )}
            </div>
            <FormField
              label={t("register.verify.codeLabel") as string}
              error={errors.verificationCode}
            >
              <input
                className="form-input text-center tracking-[0.5em] text-lg font-mono"
                maxLength={6}
                value={verificationCode}
                onChange={(e) =>
                  setVerificationCode(e.target.value.replace(/\D/g, ""))
                }
                placeholder="000000"
              />
            </FormField>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resendCooldown}
              className="text-xs text-primary underline underline-offset-2 hover:opacity-75 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {resendCooldown
                ? (t("register.verify.resendCooldown") as string) || "Resent! Try again in 1 min"
                : (t("register.verify.resend") as string)}
            </button>
          </div>
        )}

        {/* ── API Error ─────────────────────────────────────────────────────────── */}
        {apiError && (
          <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
            {apiError}
          </div>
        )}

        {/* ── Navigation ────────────────────────────────────────────────────────── */}
        <div className="flex justify-between mt-10">
          {step > 0 && step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={isSubmitting}
              className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium hover:bg-secondary transition-colors disabled:opacity-50"
            >
              {t("register.prev") as string}
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-70"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {step === 4
              ? (t("register.submit") as string)
              : step === 3
                ? (t("register.sendVerification") as string)
                : (t("register.next") as string)}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── FormField ────────────────────────────────────────────────────────────────
const FormField: React.FC<{
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, error, hint, children }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5">{label}</label>
    {children}
    {hint && !error && (
      <p className="text-xs text-muted-foreground mt-1">{hint}</p>
    )}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default RegisterPage;
