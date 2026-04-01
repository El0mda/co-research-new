import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";

const LoginPage: React.FC = () => {
  const { t } = useLang();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError(t("register.errors.required") as string); return; }
    setIsSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, keepLoggedIn }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      login(data.token, data.user);
      navigate("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-16">
        <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
          <h1 className="font-heading text-2xl font-bold text-center mb-2">
            {t("nav.signIn") as string}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-8">
            {t("hero.subtitle") as string}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("register.step1.email") as string}
              </label>
              <input
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="input-email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                {t("register.step1.password") as string}
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                data-testid="input-password"
              />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={(e) => setKeepLoggedIn(e.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
                data-testid="checkbox-keep-logged-in"
              />
              {t("register.step1.keepLoggedIn") as string}
            </label>

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-70"
              data-testid="button-login"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("nav.signIn") as string}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {" "}
            <Link to="/register" className="text-primary underline underline-offset-2 hover:opacity-75">
              {t("nav.register") as string}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
