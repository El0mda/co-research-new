import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useLang } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import { toast } from "sonner";

const SignInPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const ar = lang === "ar";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) {
      toast.error(ar ? "فشل تسجيل الدخول" : "Sign in failed", {
        description: error.message,
      });
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-md py-16">
        <h1 className="font-heading text-3xl font-bold text-center mb-8">
          {ar ? "تسجيل الدخول" : "Sign in"}
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {ar ? "البريد الإلكتروني" : "Email"}
            </label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {ar ? "كلمة المرور" : "Password"}
            </label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading
              ? ar ? "جارٍ الدخول…" : "Signing in…"
              : ar ? "دخول" : "Sign in"}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            {ar ? "ليس لديك حساب؟" : "No account?"}{" "}
            <Link to="/register" className="text-primary underline">
              {ar ? "أنشئ حسابًا" : "Register"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignInPage;
