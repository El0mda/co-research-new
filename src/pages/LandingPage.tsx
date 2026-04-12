import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

import heroBgImg from "@assets/WhatsApp_Image_2026-04-08_at_12.21.16_PM_(1)_1775983076644.jpeg";
import r0Img from "@assets/WhatsApp_Image_2026-04-08_at_12.21.15_PM_1775983076644.jpeg";
import r1Img from "@assets/WhatsApp_Image_2026-04-08_at_12.21.15_PM_(1)_1775983076644.jpeg";
import r2Img from "@assets/WhatsApp_Image_2026-04-08_at_12.21.15_PM_(2)_1775983076644.jpeg";
import r3Img from "@assets/WhatsApp_Image_2026-04-08_at_12.21.16_PM_1775983076644.jpeg";
import r4Img from "@assets/WhatsApp_Image_2026-04-08_at_12.21.17_PM_1775983076644.jpeg";
import r5Img from "@assets/WhatsApp_Image_2026-04-08_at_12.21.17_PM_(1)_1775983076644.jpeg";
import r6Img from "@assets/WhatsApp_Image_2026-04-08_at_12.21.17_PM_(2)_1775983076644.jpeg";
import r7Img from "@assets/WhatsApp_Image_2026-04-08_at_12.21.18_PM_1775983076644.jpeg";
import r8Img from "@assets/WhatsApp_Image_2026-04-08_at_12.21.18_PM_(1)_1775983076644.jpeg";
import r9Img from "@assets/WhatsApp_Image_2026-04-08_at_12.21.19_PM_1775983076644.jpeg";
import r10Img from "@assets/WhatsApp_Image_2026-04-08_at_12.21.26_PM_1775983076644.jpeg";

const reasonImages = [r0Img, r1Img, r2Img, r3Img, r4Img, r5Img, r6Img, r7Img, r8Img, r9Img, r10Img];
import {
  BookOpen, Users, Shield, ListOrdered, Search, UserCheck,
  MessageCircle, Cloud, CreditCard, Globe, BarChart3, Check,
  ArrowRight, X, Loader2, ChevronDown, ChevronUp, Play,
  Megaphone, FileText, HelpCircle, Send, MessageSquare,
  AlertTriangle,
} from "lucide-react";
const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const CURRENCIES = [
  { code: "SAR", label: "ر.س (سعودي)", rate: 1 },
  { code: "EGP", label: "ج.م (مصري)", rate: 14.3 },
  { code: "AED", label: "د.إ (إماراتي)", rate: 1.0 },
  { code: "KWD", label: "د.ك (كويتي)", rate: 0.33 },
  { code: "USD", label: "$ (دولار)", rate: 0.27 },
];

const reasonIcons = [
  Users, Search, Shield, ListOrdered, BarChart3,
  UserCheck, MessageCircle, Cloud, CreditCard, Globe, BarChart3,
];

const LandingPage: React.FC = () => {
  const { t, lang } = useLang();
  const [currency, setCurrency] = useState("SAR");
  const [showArticle, setShowArticle] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ from: "bot" | "user"; text: string }[]>([
    { from: "bot", text: lang === "ar" ? "مرحبًا بك في Co-Research كيف يمكنني مساعدتك؟" : "Welcome to Co-Research! How can I help you?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [complaintsOpen, setComplaintsOpen] = useState(false);
  const [advertiseOpen, setAdvertiseOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const reasons = t("reasons.items") as any as { title: string; desc: string }[];

  const selectedCurr = CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  const convertPrice = (sarPrice: number) => {
    const val = sarPrice * selectedCurr.rate;
    return val < 1 ? val.toFixed(2) : Math.round(val).toString();
  };

  const apiCall = async (endpoint: string, body: object) => {
    const res = await fetch(`/api/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error("Failed");
    return res.json();
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [
      ...prev,
      { from: "user", text: msg },
      { from: "bot", text: lang === "ar" ? "شكرًا على رسالتك. سيتواصل معك فريق الدعم قريبًا." : "Thank you for your message. Our support team will get back to you soon." },
    ]);
  };

  return (
    <div className="min-h-screen" style={{ background: "hsl(var(--background))" }}>
      <Header />

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden" style={{ background: "hsl(var(--navy-deep))", minHeight: "90vh", display: "flex", alignItems: "center" }}>
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "radial-gradient(circle, hsl(42 85% 50% / 0.15) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute pointer-events-none" style={{ top: "-10%", right: "-5%", width: "50vw", height: "60vh", background: "radial-gradient(ellipse, hsl(42 85% 50% / 0.08) 0%, transparent 70%)" }} />
        <div className="absolute pointer-events-none" style={{ bottom: "-10%", left: "-5%", width: "40vw", height: "50vh", background: "radial-gradient(ellipse, hsl(222 52% 40% / 0.25) 0%, transparent 70%)" }} />

        <div className="container relative py-28 md:py-40 text-center">
          <div className="flex justify-center mb-8 animate-fade-in-up">
            <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full" style={{ color: "hsl(var(--gold))", background: "hsl(var(--gold) / 0.08)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
              {lang === "ar" ? "منصة للتعاون البحثي" : "Collaborative Research Platform"}
            </span>
          </div>

          <h1 className="animate-fade-in-up mb-5" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(3.2rem, 9vw, 7rem)", fontWeight: 600, lineHeight: 1.0, letterSpacing: "-0.02em", color: "hsl(var(--cream))", animationDelay: "0.05s" }}>
            Co-Research
          </h1>

          <div className="mx-auto mb-6 animate-fade-in-up" style={{ width: "80px", height: "2px", background: "linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)", animationDelay: "0.1s" }} />

          <p className="animate-fade-in-up mb-5" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.25rem, 3vw, 1.875rem)", fontStyle: "italic", color: "hsl(var(--gold-light))", animationDelay: "0.15s" }}>
            {t("tagline")}
          </p>

          <p className="max-w-lg mx-auto mb-12 text-base animate-fade-in-up" style={{ color: "hsl(var(--cream) / 0.6)", lineHeight: 1.8, animationDelay: "0.2s" }}>
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: "0.25s" }}>
            <Link to="/register" className="inline-flex items-center gap-2 btn-gold text-sm" style={{ padding: "0.75rem 2rem", fontSize: "0.9375rem" }}>
              {t("hero.cta")}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              onClick={() => pricingRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center gap-2 text-sm font-semibold transition-all duration-200"
              style={{ color: "hsl(var(--cream) / 0.75)", padding: "0.75rem 2rem", border: "1.5px solid hsl(var(--cream) / 0.15)", borderRadius: "var(--radius)" }}
            >
              {lang === "ar" ? "خطط الأسعار" : "View Pricing"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto mt-20 animate-fade-in-up" style={{ animationDelay: "0.35s", borderTop: "1px solid hsl(var(--cream) / 0.08)", paddingTop: "2rem" }}>
            {[
              { num: "١١+", label: lang === "ar" ? "سببًا للانضمام" : "Reasons to join" },
              { num: "٣", label: lang === "ar" ? "خطط للأسعار" : "Pricing plans" },
              { num: "١٠٠٪", label: lang === "ar" ? "حماية للحقوق" : "Rights protected" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.75rem", fontWeight: 700, color: "hsl(var(--gold))", lineHeight: 1, marginBottom: "0.25rem" }}>{s.num}</p>
                <p style={{ fontSize: "0.7rem", color: "hsl(var(--cream) / 0.45)", letterSpacing: "0.04em" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ WHY CO-RESEARCH (redesigned) ══════════ */}
      <section id="reasons" className="py-24" style={{ background: "hsl(var(--background))" }}>
        <div className="container">
          <div className="text-center mb-16">
            <span className="section-label mb-4 inline-flex">
              {lang === "ar" ? "لماذا Co-Research؟" : "Why Co-Research?"}
            </span>
            <h2 className="mt-4" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 600, color: "hsl(var(--navy-deep))", lineHeight: 1.15 }}>
              {t("reasons.title")}
            </h2>
            <div className="mx-auto mt-4" style={{ width: "48px", height: "2px", background: "hsl(var(--gold))", borderRadius: "2px" }} />
          </div>

          <div className="space-y-4">
            {reasons.map((item, i) => {
              const Icon = reasonIcons[i] || BookOpen;
              const isEven = i % 2 === 0;
              return (
                <div key={i} className={`flex items-center gap-0 rounded-2xl overflow-hidden border border-border animate-fade-in-up ${isEven ? "flex-row" : "flex-row-reverse"}`} style={{ animationDelay: `${i * 0.05}s`, minHeight: "120px" }}>
                  <div className="flex-shrink-0 flex flex-col items-center justify-center gap-3 px-6 py-6" style={{ width: "140px", background: "hsl(var(--navy-deep))", alignSelf: "stretch" }}>
                    <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "2rem", fontWeight: 700, color: "hsl(var(--gold) / 0.35)", lineHeight: 1 }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl" style={{ background: "hsl(var(--gold) / 0.12)", border: "1px solid hsl(var(--gold) / 0.25)" }}>
                      <Icon className="h-5 w-5" style={{ color: "hsl(var(--gold))" }} />
                    </div>
                  </div>
                  <div className="flex-1 px-7 py-5 bg-card">
                    <h3 className="mb-1.5" style={{ fontSize: "1rem", fontWeight: 700, color: "hsl(var(--navy-deep))" }}>{item.title}</h3>
                    <p style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", lineHeight: 1.7 }}>{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ HOW TO USE ══════════ */}
      <section className="py-20" style={{ background: "hsl(var(--navy-deep))" }}>
        <div className="container">
          <div className="text-center mb-10">
            <span className="inline-flex items-center text-[10px] font-bold tracking-[0.15em] uppercase px-4 py-1.5 rounded-full mb-4" style={{ color: "hsl(var(--gold))", background: "hsl(var(--gold) / 0.08)", border: "1px solid hsl(var(--gold) / 0.2)" }}>
              {lang === "ar" ? "كيفية الاستخدام" : "How to Use"}
            </span>
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", fontWeight: 600, color: "hsl(var(--cream))" }}>
              {lang === "ar" ? "كيفية استخدام الباحثين للمنصة؟" : "How do researchers use the platform?"}
            </h2>
          </div>
          <div className="max-w-3xl mx-auto aspect-video rounded-2xl overflow-hidden border border-white/10 flex flex-col items-center justify-center gap-4" style={{ background: "hsl(var(--cream) / 0.04)" }}>
            <div className="h-20 w-20 rounded-full flex items-center justify-center" style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.25)" }}>
              <Play className="h-8 w-8" style={{ color: "hsl(var(--gold))", marginInlineStart: "4px" }} />
            </div>
            <p style={{ color: "hsl(var(--cream) / 0.5)", fontSize: "0.9375rem" }}>
              {lang === "ar" ? "سيتم إضافة الفيديو التعليمي قريبًا" : "Tutorial video coming soon"}
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ PRICING ══════════ */}
      <section ref={pricingRef} id="pricing" className="py-24" style={{ background: "hsl(var(--background))" }}>
        <div className="container">
          <div className="text-center mb-10">
            <span className="section-label mb-4 inline-flex">{lang === "ar" ? "خطط الأسعار" : "Pricing"}</span>
            <h2 className="mt-4" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", fontWeight: 600, color: "hsl(var(--navy-deep))" }}>
              {t("pricing.title")}
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">{lang === "ar" ? "جميع الأسعار سنوية — البحث يستغرق وقتًا" : "All plans are billed annually — research takes time"}</p>

            <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
              <span className="text-sm font-medium text-muted-foreground">{lang === "ar" ? "العملة:" : "Currency:"}</span>
              <div className="flex flex-wrap gap-2">
                {CURRENCIES.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all border ${currency === c.code ? "border-primary bg-primary text-primary-foreground" : "border-border hover:bg-secondary"}`}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <PricingCard
              name={t("pricing.free.name") as string}
              price="0"
              currency={selectedCurr.code}
              currencyLabel={selectedCurr.label.split(" ")[0]}
              features={t("pricing.free.features") as any as string[]}
              cta={t("pricing.startFree") as string}
              highlighted={false}
              onClick={() => { setSelectedPlan("free"); window.location.href = "/register"; }}
            />
            <PricingCard
              name={t("pricing.researcher.name") as string}
              price={convertPrice(parseFloat(t("pricing.researcher.priceAnnual") as string) * 12)}
              currency={selectedCurr.code}
              currencyLabel={selectedCurr.label.split(" ")[0]}
              features={t("pricing.researcher.features") as any as string[]}
              cta={t("pricing.subscribe") as string}
              highlighted={true}
              badge={lang === "ar" ? "الأكثر طلبًا" : "Most Popular"}
              onClick={() => { setSelectedPlan("researcher"); setSubscribeOpen(true); }}
            />
            <PricingCard
              name={t("pricing.institution.name") as string}
              price={convertPrice(parseFloat(t("pricing.institution.priceAnnual") as string) * 12)}
              currency={selectedCurr.code}
              currencyLabel={selectedCurr.label.split(" ")[0]}
              features={t("pricing.institution.features") as any as string[]}
              cta={t("pricing.contactUs") as string}
              highlighted={false}
              onClick={() => { setSelectedPlan("institution"); setContactOpen(true); }}
            />
          </div>
          <p className="text-center text-xs text-muted-foreground mt-6">
            {lang === "ar" ? "* الأسعار المعروضة تقريبية حسب سعر الصرف. السعر الأساسي بالريال السعودي." : "* Displayed prices are approximate based on exchange rates. Base price in SAR."}
          </p>
        </div>
      </section>

      {/* ══════════ ADVERTISE WITH US ══════════ */}
      <section className="py-20" style={{ background: "hsl(var(--navy-deep))", position: "relative", overflow: "hidden" }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle, hsl(42 85% 50% / 0.15) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="container relative text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-6 mx-auto" style={{ background: "hsl(var(--gold) / 0.12)", border: "1px solid hsl(var(--gold) / 0.25)" }}>
            <Megaphone className="h-6 w-6" style={{ color: "hsl(var(--gold))" }} />
          </div>
          <h2 className="mb-4" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 600, color: "hsl(var(--cream))" }}>
            Advertise With Us
          </h2>
          <p className="max-w-2xl mx-auto mb-3 text-sm" style={{ color: "hsl(var(--cream) / 0.65)", lineHeight: 1.8 }}>
            {lang === "ar"
              ? "هل تسعى للوصول إلى مجتمع متخصص من الباحثين والأكاديميين وصناع المعرفة؟ توفر منصة Co-Research بيئة فريدة تتيح لك عرض مشروعك والترويج لخدماتك والإعلان عن مؤتمرات وورش عمل ودعوات للنشر والفرص المهنية أمام جمهور متخصص وفعّال."
              : "Looking to reach a specialized community of researchers, academics, and knowledge creators? Co-Research offers a unique environment to showcase your project, promote your services, and announce conferences, workshops, publication calls, and career opportunities to a targeted audience."}
          </p>
          <button
            onClick={() => setAdvertiseOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all"
            style={{ background: "hsl(var(--gold))", color: "hsl(var(--navy-deep))" }}
          >
            {lang === "ar" ? "قدم طلب إعلان" : "Submit Ad Request"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* ══════════ RESOURCES ══════════ */}
      <section className="py-20" style={{ background: "hsl(var(--background))" }}>
        <div className="container">
          <div className="text-center mb-12">
            <span className="section-label mb-4 inline-flex">{lang === "ar" ? "المصادر" : "Resources"}</span>
            <h2 className="mt-4" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 600, color: "hsl(var(--navy-deep))" }}>
              {lang === "ar" ? "مواد ووثائق للباحثين" : "Materials & Documents for Researchers"}
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            {/* Article */}
            <div className="rounded-2xl border border-border bg-card p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "hsl(var(--navy-deep))" }}>
                  <BookOpen className="h-5 w-5" style={{ color: "hsl(var(--gold))" }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "مقالة بحثية" : "Research Article"}</span>
              </div>
              <h3 className="font-heading text-lg font-bold mb-3" style={{ color: "hsl(var(--navy-deep))", lineHeight: 1.3 }}>
                From Isolation to Impact: Unlock Research Collaboration with Co-Research
              </h3>
              <p className="text-sm text-muted-foreground mb-4" style={{ lineHeight: 1.75 }}>
                Baron (2007) once stated, "Crossing boundaries between disciplines is always difficult... But the rewards, too, may be great." This observation challenges the long-standing myth of the "Lone Genius"—the isolated researcher working in a vacuum...
              </p>
              {showArticle && (
                <div className="text-sm text-muted-foreground space-y-3 mb-4" style={{ lineHeight: 1.75 }}>
                  <p>In response to this reality, the "Co-research" platform has been developed to support a transition toward structured, high-impact collaboration among Arab researchers. Guided by a clear vision—"Together, everything becomes better"—the platform addresses a critical gap in how researchers connect, evaluate, and collaborate beyond their immediate surroundings.</p>
                  <p>Beyond identifying collaborators, managing the research process itself presents another major challenge. Co-research provides a unified digital workspace organized into "Discussions," "Tasks," and "Files." This integrated environment centralizes all project activities.</p>
                  <p>Moreover, the platform introduces a clear project management framework that enhances coordination and accountability. Through a color-coded Task Board—where tasks are labeled Yellow (In Progress), Green (Under Review), and Blue (Completed)—team members gain real-time visibility into the project's status.</p>
                  <p>Importantly, this integration extends beyond operational convenience to address the protection of intellectual property. By maintaining a centralized and traceable record of all contributions and communications, the platform safeguards researchers' rights.</p>
                  <p className="italic font-medium">* This article was prepared with the assistance of artificial intelligence tools.</p>
                </div>
              )}
              <button onClick={() => setShowArticle(v => !v)} className="inline-flex items-center gap-1.5 text-sm font-semibold" style={{ color: "hsl(var(--primary))" }}>
                {showArticle ? (lang === "ar" ? "عرض أقل" : "Show less") : (lang === "ar" ? "اقرأ المزيد" : "Read more")}
                {showArticle ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {/* Legal Docs */}
            <div className="rounded-2xl border border-border bg-card p-7">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "hsl(var(--navy-deep))" }}>
                  <FileText className="h-5 w-5" style={{ color: "hsl(var(--gold))" }} />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{lang === "ar" ? "القوانين والوثائق" : "Legal Documents"}</span>
              </div>
              <h3 className="font-heading text-lg font-bold mb-3" style={{ color: "hsl(var(--navy-deep))" }}>
                {lang === "ar" ? "الوثائق والسياسات" : "Platform Policies & Documents"}
              </h3>
              <p className="text-sm text-muted-foreground mb-6" style={{ lineHeight: 1.75 }}>
                {lang === "ar"
                  ? "اطلع على وثائق المنصة الرسمية التي تشمل سياسة الخصوصية، شروط الاستخدام، وسياسة حماية الملكية الفكرية."
                  : "Access the platform's official documents including privacy policy, terms of use, and intellectual property protection policy."}
              </p>
              <a
                href="https://drive.google.com/drive/folders/1vQW2UNdbk42l2JF5ho-AgRuk_HDmZe34"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-all"
                style={{ background: "hsl(var(--navy-deep))", color: "hsl(var(--cream))" }}
              >
                <FileText className="h-4 w-4" />
                {lang === "ar" ? "تحميل الوثائق" : "Download Documents"}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ HELP CENTER ══════════ */}
      <section className="py-20" style={{ background: "hsl(var(--navy-deep))" }}>
        <div className="container text-center">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl mb-6 mx-auto" style={{ background: "hsl(var(--gold) / 0.12)", border: "1px solid hsl(var(--gold) / 0.25)" }}>
            <HelpCircle className="h-6 w-6" style={{ color: "hsl(var(--gold))" }} />
          </div>
          <h2 className="mb-2" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 600, color: "hsl(var(--cream))" }}>
            Help Center
          </h2>
          <p className="mb-10 text-sm" style={{ color: "hsl(var(--cream) / 0.55)" }}>
            {lang === "ar" ? "كيف يمكنني مساعدتك في العثور على ما تبحث عنه؟" : "What can we help you find?"}
          </p>

          <div className="grid gap-5 sm:grid-cols-3 max-w-3xl mx-auto">
            {[
              {
                icon: MessageSquare,
                title: lang === "ar" ? "الاستفسارات" : "Inquiries",
                desc: lang === "ar" ? "تواصل مع فريق الدعم عبر المحادثة الفورية" : "Chat with our support team instantly",
                action: () => { setChatOpen(true); setHelpOpen(false); },
              },
              {
                icon: AlertTriangle,
                title: lang === "ar" ? "الشكاوى" : "Complaints",
                desc: lang === "ar" ? "الإبلاغ عن انتهاك حقوق الملكية الفكرية" : "Report intellectual property infringement",
                action: () => { setComplaintsOpen(true); setHelpOpen(false); },
              },
              {
                icon: Send,
                title: lang === "ar" ? "أخرى" : "Other",
                desc: lang === "ar" ? "راسلنا لأي استفسار آخر" : "Contact us for any other inquiry",
                action: () => { setContactOpen(true); setHelpOpen(false); },
              },
            ].map((card, i) => (
              <button key={i} onClick={card.action} className="rounded-xl p-5 text-start transition-all hover:-translate-y-1 group" style={{ background: "hsl(var(--cream) / 0.04)", border: "1px solid hsl(var(--cream) / 0.1)" }}>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl mb-4" style={{ background: "hsl(var(--gold) / 0.1)" }}>
                  <card.icon className="h-5 w-5" style={{ color: "hsl(var(--gold))" }} />
                </div>
                <h3 className="font-semibold mb-1.5 text-sm" style={{ color: "hsl(var(--cream))" }}>{card.title}</h3>
                <p className="text-xs" style={{ color: "hsl(var(--cream) / 0.5)" }}>{card.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CONTACT US ══════════ */}
      <section className="py-20" style={{ background: "hsl(var(--background))" }}>
        <div className="container">
          <div className="max-w-lg mx-auto text-center">
            <span className="section-label mb-4 inline-flex">{lang === "ar" ? "تواصل معنا" : "Contact Us"}</span>
            <h2 className="mt-4 mb-3" style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "clamp(1.75rem, 4vw, 2.5rem)", fontWeight: 600, color: "hsl(var(--navy-deep))" }}>
              {lang === "ar" ? "اقتراحاتك تُشكّل مستقبلنا" : "Your Suggestions Shape Our Future"}
            </h2>
            <p className="text-sm text-muted-foreground mb-8">{lang === "ar" ? "شاركنا أفكارك لتحسين المنصة" : "Share your ideas to help improve the platform"}</p>
            <ContactForm lang={lang} onSuccess={() => setSubmitted("contact")} submitted={submitted === "contact"} apiCall={apiCall} />
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background: "hsl(var(--navy-deep))", borderTop: "1px solid hsl(var(--cream) / 0.06)", padding: "2.5rem 0" }}>
        <div className="divider-gold mx-auto max-w-xs mb-6" />
        <div className="container text-center">
          <p style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "1.1rem", color: "hsl(var(--gold))", marginBottom: "1rem" }}>
            Co-Research
          </p>
          <div className="flex items-center justify-center gap-4 mb-4">
            <a href="https://www.linkedin.com/company/co-research-company/" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-75" style={{ color: "hsl(var(--cream) / 0.6)" }}>
              <LinkedinIcon />
            </a>
            <a href="https://www.facebook.com/share/185JfDB22T/" target="_blank" rel="noopener noreferrer" className="transition-opacity hover:opacity-75" style={{ color: "hsl(var(--cream) / 0.6)" }}>
              <FacebookIcon />
            </a>
          </div>
          <p style={{ fontSize: "0.75rem", color: "hsl(var(--cream) / 0.35)", letterSpacing: "0.04em" }}>
            © 2025 Co-Research.{" "}{lang === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}
          </p>
        </div>
      </footer>

      {/* ══════════ MODALS ══════════ */}

      {/* Subscribe Modal */}
      {subscribeOpen && (
        <Modal title={lang === "ar" ? `الاشتراك في خطة ${selectedPlan === "researcher" ? "الباحث" : "المؤسسة"}` : `Subscribe to ${selectedPlan} plan`} onClose={() => setSubscribeOpen(false)}>
          <p className="text-sm text-muted-foreground mb-5">{lang === "ar" ? "أرسل بياناتك وسيتواصل معك فريقنا لإتمام عملية الاشتراك." : "Submit your details and our team will contact you to complete the subscription process."}</p>
          <SubscribeForm lang={lang} plan={selectedPlan} apiCall={apiCall} onClose={() => setSubscribeOpen(false)} />
        </Modal>
      )}

      {/* Advertise Modal */}
      {advertiseOpen && (
        <Modal title={lang === "ar" ? "قدم طلب إعلان" : "Submit Ad Request"} onClose={() => setAdvertiseOpen(false)}>
          <AdvertiseForm lang={lang} apiCall={apiCall} onClose={() => setAdvertiseOpen(false)} />
        </Modal>
      )}

      {/* Contact Modal */}
      {contactOpen && (
        <Modal title={lang === "ar" ? "تواصل معنا" : "Contact Us"} onClose={() => setContactOpen(false)}>
          <ContactForm lang={lang} apiCall={apiCall} onSuccess={() => { setSubmitted("modal"); setTimeout(() => setContactOpen(false), 2000); }} submitted={submitted === "modal"} />
        </Modal>
      )}

      {/* IP Complaints Modal */}
      {complaintsOpen && (
        <Modal title={lang === "ar" ? "الإبلاغ عن انتهاك الملكية الفكرية" : "Report Intellectual Property Infringement"} onClose={() => setComplaintsOpen(false)} wide>
          <ComplaintsForm lang={lang} apiCall={apiCall} onClose={() => setComplaintsOpen(false)} />
        </Modal>
      )}

      {/* Chat Modal */}
      {chatOpen && (
        <div className="fixed bottom-6 end-6 z-50 w-80 rounded-2xl border border-border bg-white shadow-2xl overflow-hidden animate-scale-in" style={{ boxShadow: "0 8px 40px hsl(222 25% 12% / 0.2)" }}>
          <div className="flex items-center justify-between px-4 py-3" style={{ background: "hsl(var(--navy-deep))" }}>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ background: "hsl(var(--gold))", color: "hsl(var(--navy-deep))" }}>CR</div>
              <span className="text-sm font-semibold" style={{ color: "hsl(var(--cream))" }}>Co-Research Support</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-white/60 hover:text-white"><X className="h-4 w-4" /></button>
          </div>
          <div className="h-48 overflow-y-auto p-3 space-y-2" style={{ background: "hsl(var(--background))" }}>
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${m.from === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2 p-3 border-t border-border">
            <input
              className="flex-1 rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder={lang === "ar" ? "اكتب رسالتك..." : "Type a message..."}
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleChatSend(); }}
            />
            <button onClick={handleChatSend} className="rounded-lg bg-primary px-3 py-2 text-primary-foreground"><Send className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ── Modal wrapper ── */
const Modal: React.FC<{ title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }> = ({ title, onClose, children, wide }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
    <div className={`w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6`}>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-heading text-lg font-bold">{title}</h2>
        <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground hover:text-foreground" /></button>
      </div>
      {children}
    </div>
  </div>
);

/* ── Subscribe Form ── */
const SubscribeForm: React.FC<{ lang: string; plan: string; apiCall: Function; onClose: () => void }> = ({ lang, plan, apiCall, onClose }) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    setLoading(true);
    try {
      await apiCall("contact", { name: form.name, email: form.email, message: `[${plan} plan subscription request] ${form.message}` });
      setDone(true);
      setTimeout(onClose, 2000);
    } catch {}
    setLoading(false);
  };
  if (done) return <p className="text-center text-sm text-green-600 py-4">{lang === "ar" ? "تم إرسال طلبك بنجاح!" : "Request sent successfully!"}</p>;
  return (
    <div className="space-y-3">
      <input className="form-input w-full" placeholder={lang === "ar" ? "الاسم" : "Name"} value={form.name} onChange={set("name")} />
      <input className="form-input w-full" type="email" placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email"} value={form.email} onChange={set("email")} />
      <textarea className="form-input w-full min-h-[80px] resize-none" placeholder={lang === "ar" ? "ملاحظات (اختياري)" : "Notes (optional)"} value={form.message} onChange={set("message")} />
      <button onClick={submit} disabled={!form.name || !form.email || loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {lang === "ar" ? "إرسال الطلب" : "Send Request"}
      </button>
    </div>
  );
};

/* ── Advertise Form ── */
const AdvertiseForm: React.FC<{ lang: string; apiCall: Function; onClose: () => void }> = ({ lang, apiCall, onClose }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", organization: "", adType: "", description: "", duration: "" });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const adTypes = lang === "ar"
    ? ["مشروع بحثي", "مؤتمر", "ورشة عمل", "خدمة", "فرصة عمل", "مجلة"]
    : ["Research Project", "Conference", "Workshop", "Service", "Career Opportunity", "Journal"];
  const submit = async () => {
    setLoading(true);
    try { await apiCall("advertise", form); setDone(true); setTimeout(onClose, 2000); } catch {}
    setLoading(false);
  };
  if (done) return <p className="text-center text-sm text-green-600 py-4">{lang === "ar" ? "تم إرسال طلبك بنجاح!" : "Request sent successfully!"}</p>;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input className="form-input" placeholder={lang === "ar" ? "الاسم *" : "Name *"} value={form.name} onChange={set("name")} />
        <input className="form-input" type="email" placeholder={lang === "ar" ? "البريد الإلكتروني *" : "Email *"} value={form.email} onChange={set("email")} />
      </div>
      <input className="form-input w-full" placeholder={lang === "ar" ? "رقم الهاتف (مع رمز الدولة)" : "Phone (with country code)"} value={form.phone} onChange={set("phone")} />
      <input className="form-input w-full" placeholder={lang === "ar" ? "اسم الجهة أو المشروع" : "Organization or Project Name"} value={form.organization} onChange={set("organization")} />
      <select className="form-input w-full" value={form.adType} onChange={set("adType")}>
        <option value="">{lang === "ar" ? "نوع الإعلان *" : "Ad Type *"}</option>
        {adTypes.map(t => <option key={t} value={t}>{t}</option>)}
      </select>
      <textarea className="form-input w-full min-h-[80px] resize-none" placeholder={lang === "ar" ? "وصف الإعلان *" : "Ad Description *"} value={form.description} onChange={set("description")} />
      <input className="form-input w-full" placeholder={lang === "ar" ? "مدة الإعلان المطلوبة" : "Desired Duration"} value={form.duration} onChange={set("duration")} />
      <button onClick={submit} disabled={!form.name || !form.email || !form.adType || !form.description || loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {lang === "ar" ? "إرسال الطلب" : "Submit Request"}
      </button>
    </div>
  );
};

/* ── Contact Form ── */
const ContactForm: React.FC<{ lang: string; apiCall: Function; onSuccess: () => void; submitted: boolean }> = ({ lang, apiCall, onSuccess, submitted }) => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    setLoading(true);
    try { await apiCall("contact", form); onSuccess(); } catch {}
    setLoading(false);
  };
  if (submitted) return <p className="text-center text-sm text-green-600 py-4">{lang === "ar" ? "شكرًا! تم إرسال رسالتك بنجاح." : "Thank you! Your message has been sent."}</p>;
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <input className="form-input" placeholder={lang === "ar" ? "الاسم" : "Name"} value={form.name} onChange={set("name")} />
        <input className="form-input" type="email" placeholder={lang === "ar" ? "البريد الإلكتروني" : "Email"} value={form.email} onChange={set("email")} />
      </div>
      <textarea className="form-input w-full min-h-[100px] resize-none" placeholder={lang === "ar" ? "اكتب اقتراحك أو رسالتك... *" : "Write your suggestion or message... *"} value={form.message} onChange={set("message")} />
      <button onClick={submit} disabled={!form.message || loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {lang === "ar" ? "إرسال" : "Send"}
      </button>
    </div>
  );
};

/* ── IP Complaints Form ── */
const ComplaintsForm: React.FC<{ lang: string; apiCall: Function; onClose: () => void }> = ({ lang, apiCall, onClose }) => {
  const [form, setForm] = useState({ issueType: "", country: "", fullName: "", email: "", contentUrl: "", description: "" });
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const submit = async () => {
    if (!confirmed) return;
    setLoading(true);
    try { await apiCall("complaints", form); setDone(true); setTimeout(onClose, 3000); } catch {}
    setLoading(false);
  };

  const notice = lang === "ar"
    ? "في إطار سياستنا للتعامل مع الشكاوى المتعلقة بادعاءات انتهاك حقوق الملكية الفكرية المقدمة من الباحثين، يتم التعامل مع هذه الشكاوى وفقًا لأحكام قانون حماية الملكية الفكرية المصري رقم 82 لسنة 2002، أو ما يعادله من قوانين الدول العربية."
    : "As part of our policy for handling complaints related to alleged intellectual property rights infringement submitted by researchers, such complaints are processed in accordance with the provisions of the Egyptian Intellectual Property Protection Law No. 82 of 2002, or any equivalent laws in Arab countries.";

  if (done) return <p className="text-center text-sm text-green-600 py-4">{lang === "ar" ? "تم تلقي شكواك وسنتواصل معك." : "Your complaint has been received. We will follow up."}</p>;
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-sm">Report intellectual property infringement</h3>
      <p className="text-xs text-muted-foreground rounded-lg bg-secondary p-3" style={{ lineHeight: 1.7 }}>{notice}</p>
      <p className="text-sm font-medium">What issue are you reporting?</p>
      <div className="space-y-2">
        {["Copyright infringement", "Patent infringement", "Unauthorized disclosure of a trade secret"].map(opt => (
          <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
            <input type="radio" name="issue" value={opt} checked={form.issueType === opt} onChange={set("issueType")} className="accent-primary" />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <input className="form-input" placeholder={lang === "ar" ? "الدولة" : "Country"} value={form.country} onChange={set("country")} />
        <input className="form-input" placeholder={lang === "ar" ? "الاسم الكامل *" : "Your full name *"} value={form.fullName} onChange={set("fullName")} />
      </div>
      <input className="form-input w-full" type="email" placeholder={lang === "ar" ? "البريد الإلكتروني *" : "Your email address *"} value={form.email} onChange={set("email")} />
      <div>
        <input className="form-input w-full" placeholder="Where is the content? (URL)" value={form.contentUrl} onChange={set("contentUrl")} />
        <p className="text-xs text-muted-foreground mt-1">The URL(s) leading to the content. If reporting a file, right click on the download button to get the URL.</p>
      </div>
      <textarea className="form-input w-full min-h-[80px] resize-none text-sm" placeholder={lang === "ar" ? "كيف ينتهك المحتوى حقوق الملكية الفكرية؟" : "How does the content infringe the rights owner's intellectual property?"} value={form.description} onChange={set("description")} />
      <label className="flex items-start gap-2.5 cursor-pointer">
        <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="mt-0.5 accent-primary" />
        <span className="text-xs text-muted-foreground">I confirm that the information contained in this notice is accurate and complete and, under penalty of perjury, that I am the owner of the intellectual property rights at issue.</span>
      </label>
      <button onClick={submit} disabled={!form.issueType || !form.fullName || !form.email || !confirmed || loading} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Submit
      </button>
    </div>
  );
};

/* ── Pricing Card ── */
const PricingCard: React.FC<{
  name: string; price: string; currency: string; currencyLabel: string;
  features: string[]; cta: string; highlighted: boolean; badge?: string; onClick: () => void;
}> = ({ name, price, currency, currencyLabel, features, cta, highlighted, badge, onClick }) => (
  <div className="relative rounded-xl p-7 flex flex-col transition-transform duration-300 hover:-translate-y-1"
    style={highlighted
      ? { background: "white", border: "1.5px solid hsl(var(--gold) / 0.5)", boxShadow: "0 8px 40px hsl(0 0% 0% / 0.12), 0 2px 8px hsl(42 85% 50% / 0.2)" }
      : { background: "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}
  >
    {highlighted && <div className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full" style={{ background: "linear-gradient(90deg, transparent, hsl(var(--gold)), transparent)" }} />}
    {badge && (
      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap" style={{ background: "hsl(var(--gold))", color: "hsl(var(--navy-deep))" }}>
        {badge}
      </span>
    )}
    <h3 className="mb-1 text-[0.8125rem] font-bold tracking-[0.1em] uppercase" style={{ color: highlighted ? "hsl(var(--gold))" : "hsl(var(--muted-foreground))" }}>{name}</h3>
    <div className="mb-1 mt-2">
      <span style={{ fontSize: "2.25rem", fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em", color: highlighted ? "hsl(var(--navy-deep))" : "hsl(var(--foreground))" }}>{price}</span>
      <span className="ms-1.5 text-sm font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>{currencyLabel}</span>
    </div>
    <p className="text-xs text-muted-foreground mb-6">/ {price === "0" ? (currency === "SAR" ? "مجاني" : "Free") : "year"}</p>
    <ul className="space-y-3 mb-8 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2.5 text-sm">
          <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full" style={{ background: highlighted ? "hsl(var(--gold-muted))" : "hsl(var(--secondary))", border: "1px solid hsl(var(--border))" }}>
            <Check className="h-2.5 w-2.5" style={{ color: highlighted ? "hsl(36 60% 32%)" : "hsl(var(--primary))" }} />
          </div>
          <span style={{ color: highlighted ? "hsl(var(--navy))" : "hsl(var(--foreground))" }}>{f}</span>
        </li>
      ))}
    </ul>
    <button onClick={onClick} className="w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 hover:opacity-90"
      style={highlighted
        ? { background: "hsl(var(--navy-deep))", color: "hsl(var(--cream))" }
        : { background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
    >
      {cta}
    </button>
  </div>
);

export default LandingPage;
