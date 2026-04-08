import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { showToast } from "@/components/ToastHelper";
import { Plus, Search, Users, Calendar, X, Loader2, UserCircle2, Trash2 } from "lucide-react";
import { apiGet, apiPost } from "@/lib/api";
import type { ResearchProject } from "@/data/mockData";

const RESEARCH_TYPES = [
  "field", "experimental", "mixed", "qualitative", "quantitative",
  "book", "conference", "review", "meta", "other",
] as const;
type ResearchType = typeof RESEARCH_TYPES[number];

const DashboardPage: React.FC = () => {
  const { t, lang } = useLang();
  const { user } = useAuth();
  const [tab, setTab] = useState<"mine" | "discover">("mine");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestedIds, setRequestedIds] = useState<number[]>([]);

  const [joinModalProject, setJoinModalProject] = useState<ResearchProject | null>(null);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinAnswers, setJoinAnswers] = useState<string[]>([]);
  const [isJoining, setIsJoining] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newTitleEn, setNewTitleEn] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newDescEn, setNewDescEn] = useState("");
  const [newField, setNewField] = useState("");
  const [newSubField, setNewSubField] = useState("");
  const [newType, setNewType] = useState<ResearchType>("mixed");
  const [newOtherType, setNewOtherType] = useState("");
  const [newResearchLang, setNewResearchLang] = useState<"arabic" | "english">("arabic");
  const [newMaxMembers, setNewMaxMembers] = useState("4");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [joinQuestions, setJoinQuestions] = useState<string[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  const fields = t("register.fields") as unknown as string[];

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<ResearchProject[]>("/api/projects");
      setProjects(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const myProjects = projects.filter((p) => user && p.member_ids?.includes(user.id));
  const discoverProjects = projects.filter((p) => user && !p.member_ids?.includes(user.id) && p.status !== "final");
  const filtered = discoverProjects.filter((p) => {
    const q = search.toLowerCase();
    if (!q) return true;
    const title = (lang === "ar" ? p.title : p.title_en) || "";
    const field = (lang === "ar" ? p.field : p.field_en) || "";
    const subField = (lang === "ar" ? p.sub_field : p.sub_field_en) || "";
    return (
      title.toLowerCase().includes(q) ||
      field.toLowerCase().includes(q) ||
      subField.toLowerCase().includes(q)
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "idea": return "bg-blue-500/10 text-blue-400";
      case "in-progress": return "bg-yellow-500/10 text-yellow-400";
      case "final": return "bg-green-500/10 text-green-400";
      default: return "bg-secondary text-muted-foreground";
    }
  };

  const resetCreateForm = () => {
    setNewTitle(""); setNewTitleEn(""); setNewDesc(""); setNewDescEn("");
    setNewField(""); setNewSubField(""); setNewType("mixed");
    setNewOtherType(""); setNewResearchLang("arabic");
    setNewMaxMembers("4"); setNewStartDate(""); setNewEndDate("");
    setJoinQuestions([]); setNewQuestion(""); setCreateErrors({});
  };

  const handleAddQuestion = () => {
    const q = newQuestion.trim();
    if (!q) return;
    setJoinQuestions((prev) => [...prev, q]);
    setNewQuestion("");
  };

  const handleRemoveQuestion = (idx: number) => {
    setJoinQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateTeam = async () => {
    const errs: Record<string, string> = {};
    const req = t("register.errors.required") as string;
    if (!newTitle.trim()) errs.title = req;
    if (!newTitleEn.trim()) errs.titleEn = req;
    if (!newField) errs.field = req;
    if (!newStartDate) errs.startDate = req;
    if (!newEndDate) errs.endDate = req;
    setCreateErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsCreating(true);
    try {
      const project = await apiPost<ResearchProject>("/api/projects", {
        title: newTitle, titleEn: newTitleEn,
        description: newDesc, descriptionEn: newDescEn,
        field: newField, subField: newSubField,
        type: newType, otherType: newOtherType,
        researchLang: newResearchLang,
        joinQuestions,
        startDate: newStartDate, endDate: newEndDate,
        maxMembers: parseInt(newMaxMembers) || 4,
      });
      setProjects((prev) => [project, ...prev]);
      showToast(t("createTeamModal.created") as string);
      setShowCreateModal(false);
      resetCreateForm();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setIsCreating(false);
    }
  };

  const openJoinModal = (project: ResearchProject) => {
    setJoinModalProject(project);
    setJoinMessage("");
    const questions = (project as any).join_questions || [];
    setJoinAnswers(questions.map(() => ""));
  };

  const handleSubmitJoin = async () => {
    if (!joinModalProject) return;
    setIsJoining(true);
    try {
      await apiPost(`/api/projects/${joinModalProject.id}/join-request`, {
        message: joinMessage,
        answers: joinAnswers,
      });
      setRequestedIds((prev) => [...prev, joinModalProject.id]);
      showToast(t("toast.requestSent") as string);
      setJoinModalProject(null);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to send request");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="font-heading text-3xl font-bold mb-6">{t("dashboard.title")}</h1>

        <div className="flex gap-1 border-b border-border mb-8">
          <button
            onClick={() => setTab("mine")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "mine" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t("dashboard.myTeams")}
          </button>
          <button
            onClick={() => setTab("discover")}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === "discover" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {t("dashboard.discover")}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-destructive">{error}</div>
        ) : tab === "mine" ? (
          <div>
            {myProjects.length === 0 ? (
              <div className="text-center py-20">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading text-xl font-semibold mb-2">{t("dashboard.noTeams")}</h3>
                <p className="text-muted-foreground text-sm">{t("dashboard.noTeamsDesc")}</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myProjects.map((p) => (
                  <Link
                    key={p.id}
                    to={`/team/${p.id}`}
                    className="rounded-xl border border-border bg-card p-5 card-hover block"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(p.status)}`}>
                        {t(`dashboard.status.${p.status}`)}
                      </span>
                      <span className="text-xs text-muted-foreground">{p.completion}% {t("dashboard.completion")}</span>
                    </div>
                    <h3 className="font-heading font-semibold mb-1 line-clamp-2">{lang === "ar" ? p.title : p.title_en}</h3>
                    <p className="text-xs text-muted-foreground mb-3">{lang === "ar" ? p.field : p.field_en}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      {p.member_ids?.length || 0}/{p.max_members} {t("dashboard.members")}
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${p.completion}%` }} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              {t("dashboard.createTeam")}
            </button>
          </div>
        ) : (
          <div>
            <div className="relative mb-6">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                className="form-input ps-10"
                placeholder={t("dashboard.search") as string}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {filtered.length === 0 ? (
              <div className="text-center py-20">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-heading text-xl font-semibold">{t("dashboard.noResults")}</h3>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => {
                  const slotsAvailable = p.max_members - (p.member_ids?.length || 0);
                  const requested = requestedIds.includes(p.id);
                  const leaderName = (p as any).leader_name;
                  const leaderId = p.leader_id;
                  const typeLabel = t(`dashboard.type.${p.type}`) || p.type;
                  return (
                    <div key={p.id} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(p.status)}`}>
                          {t(`dashboard.status.${p.status}`)}
                        </span>
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs">
                          {typeLabel as string}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-heading font-semibold mb-0.5 line-clamp-2">{lang === "ar" ? p.title : p.title_en}</h3>
                        <p className="text-xs text-muted-foreground">
                          {lang === "ar" ? p.field : p.field_en}
                          {(lang === "ar" ? p.sub_field : p.sub_field_en) ? ` · ${lang === "ar" ? p.sub_field : p.sub_field_en}` : ""}
                        </p>
                      </div>

                      {leaderName && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <UserCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>{t("dashboard.founderBy") as string}:</span>
                          <Link
                            to={`/profile/${leaderId}`}
                            className="font-medium text-primary hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {leaderName}
                          </Link>
                        </div>
                      )}

                      {p.start_date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{p.start_date} → {p.end_date}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-1">
                        <span className="text-xs text-muted-foreground">{slotsAvailable} {t("dashboard.slots") as string}</span>
                        <button
                          disabled={requested || slotsAvailable <= 0}
                          onClick={() => !requested && openJoinModal(p)}
                          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                            requested || slotsAvailable <= 0
                              ? "bg-secondary text-muted-foreground cursor-default"
                              : "bg-primary text-primary-foreground hover:opacity-90"
                          }`}
                        >
                          {requested ? t("dashboard.requestSent") as string : t("dashboard.requestJoin") as string}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-xl font-bold">{t("createTeamModal.title")}</h2>
              <button onClick={() => { setShowCreateModal(false); resetCreateForm(); }}>
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>
            <div className="space-y-4">
              <MF label={t("createTeamModal.researchTitle") as string} error={createErrors.title}>
                <input className="form-input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </MF>
              <MF label={t("createTeamModal.researchTitleEn") as string} error={createErrors.titleEn}>
                <input className="form-input" dir="ltr" value={newTitleEn} onChange={(e) => setNewTitleEn(e.target.value)} />
              </MF>
              <MF label={t("createTeamModal.description") as string}>
                <textarea className="form-input min-h-[72px] resize-none" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
              </MF>
              <MF label={t("createTeamModal.descriptionEn") as string}>
                <textarea className="form-input min-h-[72px] resize-none" dir="ltr" value={newDescEn} onChange={(e) => setNewDescEn(e.target.value)} />
              </MF>

              <div className="grid grid-cols-2 gap-4">
                <MF label={t("createTeamModal.field") as string} error={createErrors.field}>
                  <select className="form-input" value={newField} onChange={(e) => setNewField(e.target.value)}>
                    <option value=""></option>
                    {fields.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </MF>
                <MF label={t("createTeamModal.subField") as string}>
                  <input className="form-input" value={newSubField} onChange={(e) => setNewSubField(e.target.value)} />
                </MF>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <MF label={t("createTeamModal.type") as string}>
                  <select className="form-input" value={newType} onChange={(e) => setNewType(e.target.value as ResearchType)}>
                    {RESEARCH_TYPES.map((tp) => (
                      <option key={tp} value={tp}>{t(`dashboard.type.${tp}`) as string}</option>
                    ))}
                  </select>
                </MF>
                <MF label={t("createTeamModal.researchLang") as string}>
                  <select className="form-input" value={newResearchLang} onChange={(e) => setNewResearchLang(e.target.value as "arabic" | "english")}>
                    <option value="arabic">{t("createTeamModal.langArabic") as string}</option>
                    <option value="english">{t("createTeamModal.langEnglish") as string}</option>
                  </select>
                </MF>
              </div>

              {newType === "other" && (
                <MF label={t("createTeamModal.otherType") as string}>
                  <input className="form-input" value={newOtherType} onChange={(e) => setNewOtherType(e.target.value)} />
                </MF>
              )}

              <div className="grid grid-cols-2 gap-4">
                <MF label={t("createTeamModal.maxMembers") as string}>
                  <input
                    className="form-input" type="number" min="2" max="4"
                    value={newMaxMembers}
                    onChange={(e) => {
                      const v = Math.min(4, Math.max(2, parseInt(e.target.value) || 2));
                      setNewMaxMembers(String(v));
                    }}
                  />
                </MF>
                <div />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <MF label={t("createTeamModal.startDate") as string} error={createErrors.startDate}>
                  <input className="form-input" type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} />
                </MF>
                <MF label={t("createTeamModal.endDate") as string} error={createErrors.endDate}>
                  <input className="form-input" type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
                </MF>
              </div>

              <div className="rounded-lg border border-border p-4 space-y-3">
                <div>
                  <p className="text-sm font-medium mb-0.5">{t("createTeamModal.joinQuestionsTitle") as string}</p>
                  <p className="text-xs text-muted-foreground">{t("createTeamModal.joinQuestionsHint") as string}</p>
                </div>
                {joinQuestions.map((q, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="flex-shrink-0 mt-2.5 text-xs text-muted-foreground font-medium">{i + 1}.</span>
                    <p className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm">{q}</p>
                    <button
                      onClick={() => handleRemoveQuestion(i)}
                      className="mt-2 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    className="form-input flex-1 text-sm"
                    placeholder={t("createTeamModal.questionPlaceholder") as string}
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddQuestion(); } }}
                  />
                  <button
                    onClick={handleAddQuestion}
                    className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-secondary transition-colors whitespace-nowrap"
                  >
                    {t("createTeamModal.addQuestion") as string}
                  </button>
                </div>
              </div>

              <button
                onClick={handleCreateTeam}
                disabled={isCreating}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-70 mt-2"
              >
                {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("createTeamModal.create") as string}
              </button>
            </div>
          </div>
        </div>
      )}

      {joinModalProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-lg font-bold">
                {t("dashboard.requestJoin") as string}
              </h2>
              <button onClick={() => setJoinModalProject(null)}>
                <X className="h-5 w-5 text-muted-foreground hover:text-foreground" />
              </button>
            </div>

            <div className="rounded-lg bg-secondary/50 px-4 py-3 mb-5">
              <p className="font-medium text-sm line-clamp-2">
                {lang === "ar" ? joinModalProject.title : joinModalProject.title_en}
              </p>
              {(joinModalProject as any).leader_name && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                  <UserCircle2 className="h-3.5 w-3.5" />
                  <span>{t("dashboard.founderBy") as string}: </span>
                  <Link
                    to={`/profile/${joinModalProject.leader_id}`}
                    className="text-primary hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {(joinModalProject as any).leader_name}
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {((joinModalProject as any).join_questions || []).length > 0 && (
                <div className="space-y-3">
                  {((joinModalProject as any).join_questions as string[]).map((q, i) => (
                    <MF key={i} label={`${i + 1}. ${q}`}>
                      <textarea
                        className="form-input min-h-[72px] resize-none text-sm"
                        value={joinAnswers[i] || ""}
                        onChange={(e) => {
                          const updated = [...joinAnswers];
                          updated[i] = e.target.value;
                          setJoinAnswers(updated);
                        }}
                      />
                    </MF>
                  ))}
                </div>
              )}

              <MF label={lang === "ar" ? "رسالة (اختياري)" : "Message (optional)"}>
                <textarea
                  className="form-input min-h-[72px] resize-none text-sm"
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                />
              </MF>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setJoinModalProject(null)}
                  className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
                >
                  {t("common.cancel") as string}
                </button>
                <button
                  onClick={handleSubmitJoin}
                  disabled={isJoining}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {isJoining && <Loader2 className="h-4 w-4 animate-spin" />}
                  {t("dashboard.requestJoin") as string}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const MF: React.FC<{ label: string; error?: string; children: React.ReactNode }> = ({ label, error, children }) => (
  <div>
    <label className="block text-sm font-medium mb-1.5">{label}</label>
    {children}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export default DashboardPage;
