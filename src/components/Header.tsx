import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet, apiPatch } from "@/lib/api";
import { Bell, Menu, X, User, LogOut, ChevronDown, Check, Loader2, UserPlus, Clock, AlertCircle } from "lucide-react";

interface JoinNotification {
  id: number;
  project_id: number;
  user_id: number;
  message: string;
  created_at: string;
  display_name: string;
  email: string;
  field: string;
  sub_field: string;
  degree: string;
  university: string;
  profile_photo: string | null;
  project_title: string;
  project_title_en: string;
  join_questions: string[] | null;
  answers: string[] | null;
}

interface TaskNotification {
  id: number;
  title: string;
  due_date: string;
  status: string;
  project_id: number;
  project_title: string;
  project_title_en: string;
  assignee_name: string | null;
  urgency: "overdue" | "upcoming";
}

const Header: React.FC = () => {
  const { t, toggleLang, lang } = useLang();
  const { isLoggedIn, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifTab, setNotifTab] = useState<"join" | "tasks">("join");
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState<JoinNotification[]>([]);
  const [taskNotifications, setTaskNotifications] = useState<TaskNotification[]>([]);
  const [processingIds, setProcessingIds] = useState<number[]>([]);
  const navigate = useNavigate();
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const [joinData, taskData] = await Promise.all([
        apiGet<JoinNotification[]>("/api/notifications"),
        apiGet<TaskNotification[]>("/api/task-notifications"),
      ]);
      setNotifications(joinData);
      setTaskNotifications(taskData);
    } catch {
      // silently ignore
    }
  }, [isLoggedIn]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate("/");
  };

  const handleAction = async (notif: JoinNotification, action: "approve" | "reject") => {
    setProcessingIds((prev) => [...prev, notif.id]);
    try {
      await apiPatch(`/api/projects/${notif.project_id}/join-requests/${notif.id}`, { action });
      setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
    } catch {
      // ignore
    } finally {
      setProcessingIds((prev) => prev.filter((id) => id !== notif.id));
    }
  };

  const displayName = user?.display_name || "";

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-white border-b border-border/60"
      }`}
    >
      <div className="container flex h-[68px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="Co-research"
            className="h-[70px] w-auto transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden md:flex items-center gap-7">
          <Link to="/" className="header-nav-link">{t("nav.home")}</Link>
          {isLoggedIn && (
            <Link to="/dashboard" className="header-nav-link">{t("nav.dashboard")}</Link>
          )}

          <button
            onClick={toggleLang}
            className="text-[11px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-md transition-all duration-200"
            style={{
              color: "hsl(var(--navy))",
              border: "1px solid hsl(var(--navy) / 0.2)",
              background: "transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--navy-surface))";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--navy) / 0.4)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--navy) / 0.2)";
            }}
          >
            {t("nav.langToggle")}
          </button>

          {isLoggedIn && user ? (
            <div className="flex items-center gap-3">
              {/* ── Notification Bell ── */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => { setNotifOpen((v) => !v); setDropdownOpen(false); }}
                  className="relative p-1.5 rounded-md hover:bg-secondary transition-colors"
                  data-testid="button-notifications"
                >
                  <Bell className="h-[18px] w-[18px]" style={{ color: "hsl(var(--navy) / 0.5)" }} />
                  {(notifications.length + taskNotifications.length) > 0 && (
                    <span className="absolute top-0.5 end-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "hsl(4 72% 50%)" }}>
                      {(notifications.length + taskNotifications.length) > 9 ? "9+" : (notifications.length + taskNotifications.length)}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div
                    className="absolute end-0 top-full mt-2 w-80 rounded-xl overflow-hidden animate-scale-in"
                    style={{
                      background: "white",
                      border: "1px solid hsl(var(--border))",
                      boxShadow: "0 8px 32px hsl(222 25% 12% / 0.14)",
                    }}
                  >
                    {/* Tabs */}
                    <div className="flex border-b border-border">
                      <button
                        onClick={() => setNotifTab("join")}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${notifTab === "join" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {lang === "ar" ? "طلبات الانضمام" : "Join Requests"}
                        {notifications.length > 0 && (
                          <span className="ms-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "hsl(4 72% 50%)" }}>{notifications.length}</span>
                        )}
                        {notifTab === "join" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />}
                      </button>
                      <button
                        onClick={() => setNotifTab("tasks")}
                        className={`flex-1 py-2.5 text-xs font-semibold transition-colors relative ${notifTab === "tasks" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        {lang === "ar" ? "إشعارات المهام" : "Task Alerts"}
                        {taskNotifications.length > 0 && (
                          <span className="ms-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white" style={{ background: "hsl(4 72% 50%)" }}>{taskNotifications.length}</span>
                        )}
                        {notifTab === "tasks" && <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />}
                      </button>
                    </div>

                    <div className="max-h-[360px] overflow-y-auto divide-y divide-border">
                      {/* ── Task notifications tab ── */}
                      {notifTab === "tasks" && (
                        <>
                          {taskNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                              <Clock className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
                              <p className="text-sm text-muted-foreground">
                                {lang === "ar" ? "لا توجد مهام متأخرة أو قريبة الاستحقاق" : "No overdue or upcoming tasks"}
                              </p>
                            </div>
                          ) : (
                            taskNotifications.map((tn) => {
                              const projTitle = lang === "ar" ? tn.project_title : tn.project_title_en;
                              return (
                                <div key={tn.id} className="p-4">
                                  <div className="flex items-start gap-3">
                                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${tn.urgency === "overdue" ? "bg-red-100" : "bg-yellow-100"}`}>
                                      {tn.urgency === "overdue"
                                        ? <AlertCircle className="h-4 w-4 text-red-500" />
                                        : <Clock className="h-4 w-4 text-yellow-600" />
                                      }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-semibold truncate">{tn.title}</p>
                                      <p className="text-xs text-muted-foreground">{projTitle}</p>
                                      <p className={`text-xs mt-0.5 font-medium ${tn.urgency === "overdue" ? "text-red-500" : "text-yellow-600"}`}>
                                        {tn.urgency === "overdue"
                                          ? (lang === "ar" ? `⚠ تأخرت عن ${tn.due_date}` : `⚠ Overdue since ${tn.due_date}`)
                                          : (lang === "ar" ? `⏳ يستحق في ${tn.due_date}` : `⏳ Due ${tn.due_date}`)
                                        }
                                      </p>
                                      {tn.assignee_name && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{lang === "ar" ? "مسؤول:" : "Assigned to:"} {tn.assignee_name}</p>
                                      )}
                                    </div>
                                  </div>
                                  <Link
                                    to={`/team/${tn.project_id}`}
                                    onClick={() => setNotifOpen(false)}
                                    className="mt-2 block text-center text-[11px] transition-opacity hover:opacity-75"
                                    style={{ color: "hsl(var(--primary))" }}
                                  >
                                    {lang === "ar" ? "فتح الفريق" : "Open Team"}
                                  </Link>
                                </div>
                              );
                            })
                          )}
                          {/* Drag-drop tip */}
                          <div className="p-3 m-3 rounded-lg text-xs" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
                            <span className="font-medium">{lang === "ar" ? "💡 نصيحة:" : "💡 Tip:"}</span>{" "}
                            {lang === "ar"
                              ? "استخدم السحب والإفلات لتغيير حالة المهام بين الأعمدة (قيد التنفيذ، تحت المراجعة، مكتملة)"
                              : "Use drag & drop in the task board to move tasks between columns (In Progress, Under Review, Completed)"}
                          </div>
                        </>
                      )}

                      {/* ── Join requests tab ── */}
                      {notifTab === "join" && (
                      <>
                      {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                          <UserPlus className="h-8 w-8 text-muted-foreground mb-2 opacity-40" />
                          <p className="text-sm text-muted-foreground">
                            {lang === "ar" ? "لا توجد طلبات انضمام جديدة" : "No pending join requests"}
                          </p>
                        </div>
                      ) : (
                        notifications.map((notif) => {
                          const isProcessing = processingIds.includes(notif.id);
                          const projectTitle = lang === "ar" ? notif.project_title : notif.project_title_en;
                          return (
                            <div key={notif.id} className="p-4">
                              {/* Requester info */}
                              <div className="flex items-start gap-3 mb-3">
                                {notif.profile_photo ? (
                                  <img src={notif.profile_photo} alt="" className="h-9 w-9 rounded-full object-cover shrink-0" />
                                ) : (
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold" style={{ background: "hsl(var(--navy-deep))", color: "hsl(var(--gold))" }}>
                                    {notif.display_name.charAt(0)}
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold truncate" style={{ color: "hsl(var(--navy-deep))" }}>
                                    {notif.display_name}
                                  </p>
                                  <p className="text-xs truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                                    {notif.degree && `${notif.degree} · `}{notif.field}
                                  </p>
                                  <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                                    {lang === "ar" ? "يرغب في الانضمام إلى:" : "Wants to join:"}{" "}
                                    <span className="font-medium" style={{ color: "hsl(var(--navy))" }}>{projectTitle}</span>
                                  </p>
                                </div>
                              </div>

                              {/* Q&A answers */}
                              {notif.join_questions && notif.join_questions.length > 0 && (
                                <div className="rounded-lg mb-3 p-3 space-y-2" style={{ background: "hsl(var(--secondary))" }}>
                                  {notif.join_questions.map((q, qi) => (
                                    <div key={qi}>
                                      <p className="text-[11px] font-medium mb-0.5" style={{ color: "hsl(var(--navy))" }}>{q}</p>
                                      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                                        {notif.answers?.[qi] || (lang === "ar" ? "لا توجد إجابة" : "No answer provided")}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Message if any */}
                              {notif.message && (
                                <div className="rounded-lg mb-3 px-3 py-2 text-xs" style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}>
                                  "{notif.message}"
                                </div>
                              )}

                              {/* Approve / Reject buttons */}
                              <div className="flex gap-2">
                                <button
                                  disabled={isProcessing}
                                  onClick={() => handleAction(notif, "approve")}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                                  style={{ background: "hsl(142 71% 45% / 0.12)", color: "hsl(142 71% 35%)", border: "1px solid hsl(142 71% 45% / 0.3)" }}
                                  onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = "hsl(142 71% 45% / 0.2)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(142 71% 45% / 0.12)")}
                                  data-testid={`button-approve-${notif.id}`}
                                >
                                  {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                                  {lang === "ar" ? "قبول" : "Approve"}
                                </button>
                                <button
                                  disabled={isProcessing}
                                  onClick={() => handleAction(notif, "reject")}
                                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold transition-all disabled:opacity-50"
                                  style={{ background: "hsl(4 72% 50% / 0.08)", color: "hsl(4 72% 45%)", border: "1px solid hsl(4 72% 50% / 0.25)" }}
                                  onMouseEnter={(e) => !isProcessing && (e.currentTarget.style.background = "hsl(4 72% 50% / 0.16)")}
                                  onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(4 72% 50% / 0.08)")}
                                  data-testid={`button-reject-${notif.id}`}
                                >
                                  {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                                  {lang === "ar" ? "رفض" : "Reject"}
                                </button>
                              </div>

                              {/* View profile link */}
                              <Link
                                to={`/profile/${notif.user_id}`}
                                onClick={() => setNotifOpen(false)}
                                className="mt-2 block text-center text-[11px] transition-opacity hover:opacity-75"
                                style={{ color: "hsl(var(--primary))" }}
                              >
                                {lang === "ar" ? "عرض الملف الشخصي" : "View profile"}
                              </Link>
                            </div>
                          );
                        })
                      )}
                      </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ── User dropdown ── */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => { setDropdownOpen(!dropdownOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-secondary"
                >
                  {user.profile_photo ? (
                    <img src={user.profile_photo} alt="" className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-bold" style={{ background: "hsl(var(--navy-deep))", color: "hsl(var(--gold))" }}>
                      {displayName.charAt(0)}
                    </div>
                  )}
                  <span className="text-sm font-medium hidden lg:block" style={{ color: "hsl(var(--navy))" }}>
                    {displayName}
                  </span>
                  <ChevronDown
                    className="h-3.5 w-3.5 transition-transform duration-200"
                    style={{ color: "hsl(var(--muted-foreground))", transform: dropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute end-0 top-full mt-2 w-52 rounded-xl p-1.5 animate-scale-in"
                    style={{ background: "white", border: "1px solid hsl(var(--border))", boxShadow: "0 8px 32px hsl(222 25% 12% / 0.12)" }}
                  >
                    <div className="px-3 py-2.5 mb-1" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                      <p className="text-[13px] font-semibold" style={{ color: "hsl(var(--navy-deep))" }}>{displayName}</p>
                      <p className="text-[11px]" style={{ color: "hsl(var(--muted-foreground))" }}>{user.university}</p>
                    </div>
                    <Link
                      to={`/profile/${user.id}`}
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
                      style={{ color: "hsl(var(--navy))" }}
                    >
                      <User className="h-3.5 w-3.5" />
                      {t("nav.myProfile")}
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-red-50"
                      style={{ color: "hsl(var(--destructive))" }}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      {t("nav.signOut")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-medium transition-colors" style={{ color: "hsl(var(--navy) / 0.65)" }}>
                {t("nav.signIn")}
              </Link>
              <Link to="/register" className="btn-primary text-sm" style={{ padding: "0.5rem 1.25rem" }}>
                {t("nav.register")}
              </Link>
            </div>
          )}
        </nav>

        {/* ── Mobile hamburger ── */}
        <button
          className="md:hidden p-2 rounded-md transition-colors hover:bg-secondary"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" style={{ color: "hsl(var(--navy))" }} />
          ) : (
            <div className="relative">
              <Menu className="h-5 w-5" style={{ color: "hsl(var(--navy))" }} />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -end-1 flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "hsl(4 72% 50%)" }}>
                  {notifications.length}
                </span>
              )}
            </div>
          )}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden p-4 space-y-1 animate-fade-in" style={{ background: "white", borderTop: "1px solid hsl(var(--border))" }}>
          <MobileLink to="/" label={t("nav.home")} onClick={() => setMobileOpen(false)} />
          {isLoggedIn && (
            <MobileLink to="/dashboard" label={t("nav.dashboard")} onClick={() => setMobileOpen(false)} />
          )}
          <button
            onClick={() => { toggleLang(); setMobileOpen(false); }}
            className="block w-full text-start px-3 py-2.5 rounded-lg text-sm hover:bg-secondary transition-colors"
            style={{ color: "hsl(var(--navy))" }}
          >
            {t("nav.langToggle")}
          </button>

          {/* Mobile notifications section */}
          {isLoggedIn && notifications.length > 0 && (
            <div className="rounded-lg border border-border p-3 mt-2">
              <p className="text-xs font-semibold text-muted-foreground mb-2">
                {lang === "ar" ? "طلبات الانضمام" : "Join Requests"} ({notifications.length})
              </p>
              <div className="space-y-3">
                {notifications.map((notif) => {
                  const isProcessing = processingIds.includes(notif.id);
                  const projectTitle = lang === "ar" ? notif.project_title : notif.project_title_en;
                  return (
                    <div key={notif.id} className="text-sm">
                      <p className="font-medium">{notif.display_name}</p>
                      <p className="text-xs text-muted-foreground mb-2">{projectTitle}</p>
                      <div className="flex gap-2">
                        <button
                          disabled={isProcessing}
                          onClick={() => handleAction(notif, "approve")}
                          className="flex-1 rounded-lg py-1.5 text-xs font-semibold"
                          style={{ background: "hsl(142 71% 45% / 0.12)", color: "hsl(142 71% 35%)" }}
                        >
                          {lang === "ar" ? "قبول" : "Approve"}
                        </button>
                        <button
                          disabled={isProcessing}
                          onClick={() => handleAction(notif, "reject")}
                          className="flex-1 rounded-lg py-1.5 text-xs font-semibold"
                          style={{ background: "hsl(4 72% 50% / 0.08)", color: "hsl(4 72% 45%)" }}
                        >
                          {lang === "ar" ? "رفض" : "Reject"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!isLoggedIn ? (
            <>
              <MobileLink to="/login" label={t("nav.signIn")} onClick={() => setMobileOpen(false)} />
              <Link to="/register" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 rounded-lg text-sm font-semibold mt-2 btn-primary">
                {t("nav.register")}
              </Link>
            </>
          ) : (
            <>
              <MobileLink to={`/profile/${user?.id}`} label={t("nav.myProfile")} onClick={() => setMobileOpen(false)} />
              <button
                onClick={handleLogout}
                className="block w-full text-start px-3 py-2.5 rounded-lg text-sm transition-colors hover:bg-red-50"
                style={{ color: "hsl(var(--destructive))" }}
              >
                {t("nav.signOut")}
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};

const MobileLink: React.FC<{ to: string; label: string; onClick: () => void }> = ({ to, label, onClick }) => (
  <Link to={to} onClick={onClick} className="block px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-secondary transition-colors" style={{ color: "hsl(var(--navy))" }}>
    {label}
  </Link>
);

export default Header;
