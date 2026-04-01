import React, { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import {
  ChevronUp, ChevronDown, Plus, Paperclip, Send,
  FileText, AlertCircle, X, Loader2,
} from "lucide-react";
import { apiGet, apiPost, apiPatch } from "@/lib/api";
import type { ResearchProject, Task, Message, Researcher } from "@/data/mockData";

type TaskStatus = "in-progress" | "under-review" | "completed";

const TeamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  const { user } = useAuth();

  const [project, setProject] = useState<ResearchProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  const [newMsg, setNewMsg] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("in-progress");
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  const [draggingTaskId, setDraggingTaskId] = useState<number | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const fetchProject = useCallback(async () => {
    if (!id) return;
    try {
      const data = await apiGet<ResearchProject & { tasks: Task[]; messages: Message[]; members: Researcher[] }>(`/api/projects/${id}`);
      setProject(data);
    } catch {
      // handled by null check below
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project?.messages]);

  if (isLoading) {
    return <div className="min-h-screen bg-background"><Header /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div></div>;
  }

  if (!project) {
    return <div className="min-h-screen bg-background"><Header /><div className="container py-20 text-center text-muted-foreground">Project not found</div></div>;
  }

  const members: Researcher[] = project.members || [];
  const tasks: Task[] = project.tasks || [];
  const messages: Message[] = project.messages || [];

  const tabs = [t("team.overview"), t("team.tasks"), t("team.discussions"), t("team.files")];

  const getRole = (i: number) => {
    if (i === 0) return t("team.roles.firstAuthor");
    if (i === members.length - 1 && members.length > 1) return t("team.roles.lastAuthor");
    return t("team.roles.coAuthor");
  };

  const moveAuthor = async (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= members.length) return;
    const newMembers = [...members];
    [newMembers[index], newMembers[target]] = [newMembers[target], newMembers[index]];
    const orderedUserIds = newMembers.map((m) => m.id);
    try {
      await apiPatch(`/api/projects/${id}/members/reorder`, { orderedUserIds });
      setProject((prev) => prev ? { ...prev, members: newMembers } : prev);
    } catch { /* ignore */ }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() && !attachedFile) return;
    setIsSendingMsg(true);
    try {
      let attachmentData: string | null = null;
      let attachmentName: string | null = null;
      let attachmentType: string | null = null;
      if (attachedFile) {
        attachmentName = attachedFile.name;
        attachmentType = attachedFile.name.split(".").pop()?.toLowerCase() ?? "file";
        attachmentData = await new Promise<string>((res, rej) => {
          const reader = new FileReader();
          reader.onload = () => res(reader.result as string);
          reader.onerror = rej;
          reader.readAsDataURL(attachedFile);
        });
      }
      const msg = await apiPost<Message>(`/api/projects/${id}/messages`, {
        text: newMsg,
        attachmentName,
        attachmentType,
        attachmentData,
      });
      setProject((prev) => prev ? { ...prev, messages: [...(prev.messages || []), msg] } : prev);
      setNewMsg("");
      setAttachedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch { /* ignore */ } finally {
      setIsSendingMsg(false);
    }
  };

  const createTask = async () => {
    if (!newTaskTitle.trim()) return;
    setIsCreatingTask(true);
    try {
      const task = await apiPost<Task>(`/api/projects/${id}/tasks`, {
        title: newTaskTitle,
        description: newTaskDesc,
        assigneeId: newTaskAssignee ? parseInt(newTaskAssignee) : null,
        dueDate: newTaskDue || null,
        status: newTaskStatus,
      });
      setProject((prev) => prev ? { ...prev, tasks: [...(prev.tasks || []), task] } : prev);
      setShowNewTask(false);
      setNewTaskTitle(""); setNewTaskDesc(""); setNewTaskAssignee(""); setNewTaskDue(""); setNewTaskStatus("in-progress");
    } catch { /* ignore */ } finally {
      setIsCreatingTask(false);
    }
  };

  const moveTask = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await apiPatch(`/api/projects/${id}/tasks/${taskId}`, { status: newStatus });
      setProject((prev) => prev ? {
        ...prev,
        tasks: (prev.tasks || []).map((tk) => tk.id === taskId ? { ...tk, status: newStatus } : tk),
      } : prev);
    } catch { /* ignore */ }
  };

  const tasksByStatus: Record<TaskStatus, Task[]> = {
    "in-progress": tasks.filter((tk) => tk.status === "in-progress"),
    "under-review": tasks.filter((tk) => tk.status === "under-review"),
    completed: tasks.filter((tk) => tk.status === "completed"),
  };

  const statusLabels: Record<TaskStatus, string> = {
    "in-progress": t("team.inProgress"),
    "under-review": t("team.underReview"),
    completed: t("team.completed"),
  };
  const statusColors: Record<TaskStatus, string> = {
    "in-progress": "border-yellow-500/30 bg-yellow-500/5",
    "under-review": "border-green-500/30 bg-green-500/5",
    completed: "border-blue-500/30 bg-blue-500/5",
  };
  const statusDotColors: Record<TaskStatus, string> = {
    "in-progress": "bg-yellow-400",
    "under-review": "bg-green-400",
    completed: "bg-blue-400",
  };
  const dragOverStyles: Record<TaskStatus, string> = {
    "in-progress": "ring-2 ring-yellow-400/60",
    "under-review": "ring-2 ring-green-400/60",
    completed: "ring-2 ring-blue-400/60",
  };

  const filesFromMessages = messages
    .filter((m) => m.attachment_name)
    .map((m) => ({
      name: m.attachment_name!,
      type: m.attachment_type!,
      data: m.attachment_data,
      senderName: m.sender_name,
      date: m.created_at,
    }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="font-heading text-2xl font-bold mb-1">
          {lang === "ar" ? project.title : project.title_en}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {lang === "ar" ? project.field : project.field_en}
          {project.sub_field ? ` · ${lang === "ar" ? project.sub_field : project.sub_field_en}` : ""}
        </p>

        <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === i ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ══ TAB 0 — OVERVIEW ══ */}
        {activeTab === 0 && (
          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {lang === "ar" ? project.description : project.description_en}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                {project.start_date && <span>{t("common.from")}: {project.start_date}</span>}
                {project.end_date && <span>{t("common.to")}: {project.end_date}</span>}
                <span>{t(`dashboard.type.${project.type}`)}</span>
                <span>{t(`dashboard.status.${project.status}`)}</span>
              </div>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold mb-4">{t("dashboard.members")}</h2>
              <div className="space-y-3">
                {members.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
                    {m.profile_photo ? (
                      <img src={m.profile_photo} alt="" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                        {m.display_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{m.display_name}</p>
                      <p className="text-xs text-muted-foreground">{getRole(i)}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {tasks.filter((tk) => tk.assignee_id === m.id).length} {t("team.tasks")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-lg font-semibold mb-2">{t("team.authorOrder")}</h2>
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {t("team.authorNote")}
              </p>
              <div className="space-y-2">
                {members.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
                    <span className="text-sm font-bold text-muted-foreground w-6 text-center">{i + 1}</span>
                    <span className="flex-1 text-sm font-medium">{m.display_name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveAuthor(i, -1)} disabled={i === 0} className="rounded p-1 hover:bg-secondary disabled:opacity-30">
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => moveAuthor(i, 1)} disabled={i === members.length - 1} className="rounded p-1 hover:bg-secondary disabled:opacity-30">
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ TAB 1 — TASKS ══ */}
        {activeTab === 1 && (
          <div>
            <button
              onClick={() => setShowNewTask(true)}
              className="mb-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> {t("team.newTask")}
            </button>

            {showNewTask && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-heading text-lg font-bold">{t("team.newTask")}</h3>
                    <button onClick={() => setShowNewTask(false)} className="rounded-lg p-1.5 hover:bg-secondary transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">{lang === "ar" ? "عنوان المهمة *" : "Task Title *"}</label>
                      <input className="form-input w-full" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder={lang === "ar" ? "أدخل عنوان المهمة" : "Enter task title"} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">{lang === "ar" ? "الوصف" : "Description"}</label>
                      <textarea className="form-input w-full resize-none" rows={3} value={newTaskDesc} onChange={(e) => setNewTaskDesc(e.target.value)} placeholder={lang === "ar" ? "وصف المهمة (اختياري)" : "Task description (optional)"} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">{lang === "ar" ? "المسؤول" : "Assignee"}</label>
                      <select className="form-input w-full" value={newTaskAssignee} onChange={(e) => setNewTaskAssignee(e.target.value)}>
                        <option value="">{lang === "ar" ? "اختر عضواً" : "Select a member"}</option>
                        {members.map((m) => <option key={m.id} value={m.id}>{m.display_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">{lang === "ar" ? "تاريخ الاستحقاق" : "Due Date"}</label>
                      <input type="date" className="form-input w-full" value={newTaskDue} onChange={(e) => setNewTaskDue(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">{lang === "ar" ? "الحالة" : "Status"}</label>
                      <select className="form-input w-full" value={newTaskStatus} onChange={(e) => setNewTaskStatus(e.target.value as TaskStatus)}>
                        <option value="in-progress">{t("team.inProgress")}</option>
                        <option value="under-review">{t("team.underReview")}</option>
                        <option value="completed">{t("team.completed")}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={createTask}
                      disabled={!newTaskTitle.trim() || isCreatingTask}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      {isCreatingTask && <Loader2 className="h-4 w-4 animate-spin" />}
                      {lang === "ar" ? "إنشاء المهمة" : "Create Task"}
                    </button>
                    <button onClick={() => setShowNewTask(false)} className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors">
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-3">
              {(["in-progress", "under-review", "completed"] as TaskStatus[]).map((status) => (
                <div
                  key={status}
                  className={`rounded-xl border p-4 transition-all duration-150 ${statusColors[status]} ${dragOverCol === status ? dragOverStyles[status] : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOverCol(status); }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={() => { if (draggingTaskId) moveTask(draggingTaskId, status); setDraggingTaskId(null); setDragOverCol(null); }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`h-2.5 w-2.5 rounded-full ${statusDotColors[status]}`} />
                    <h3 className="text-sm font-semibold">{statusLabels[status]}</h3>
                    <span className="text-xs text-muted-foreground ms-auto">{tasksByStatus[status].length}</span>
                  </div>
                  {tasksByStatus[status].length === 0 && draggingTaskId && (
                    <div className="rounded-lg border-2 border-dashed border-border h-16 flex items-center justify-center text-xs text-muted-foreground">
                      {lang === "ar" ? "أفلت هنا" : "Drop here"}
                    </div>
                  )}
                  <div className="space-y-3">
                    {tasksByStatus[status].map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => setDraggingTaskId(task.id)}
                        onDragEnd={() => { setDraggingTaskId(null); setDragOverCol(null); }}
                        className={`rounded-lg border border-border bg-card p-3 cursor-grab active:cursor-grabbing select-none card-hover transition-opacity ${draggingTaskId === task.id ? "opacity-40" : "opacity-100"}`}
                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="text-sm font-medium flex-1">{task.title}</h4>
                          <span className="text-muted-foreground/30 text-xs ms-2 select-none">⠿</span>
                        </div>
                        {task.due_date && <p className="text-xs text-muted-foreground">{task.due_date}</p>}
                        {task.assignee_name && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                              {task.assignee_name.charAt(0)}
                            </div>
                            <span className="text-xs text-muted-foreground">{task.assignee_name}</span>
                          </div>
                        )}
                        {expandedTask === task.id && task.description && (
                          <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">{task.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══ TAB 2 — DISCUSSIONS ══ */}
        {activeTab === 2 && (
          <div className="flex flex-col h-[60vh]">
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1">
              {messages.length === 0 && (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  {lang === "ar" ? "لا توجد رسائل بعد" : "No messages yet"}
                </div>
              )}
              {messages.map((msg) => {
                const isMe = user && msg.sender_id === user.id;
                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
                      {msg.sender_name?.charAt(0)}
                    </div>
                    <div className={`max-w-[70%] rounded-xl px-3 py-2 ${isMe ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                      {!isMe && <p className="text-[11px] font-semibold mb-1 opacity-70">{msg.sender_name}</p>}
                      {msg.text && <p className="text-sm">{msg.text}</p>}
                      {msg.attachment_name && (
                        <div className="mt-1">
                          {msg.attachment_data && msg.attachment_type && ["jpg","jpeg","png","gif","webp"].includes(msg.attachment_type) ? (
                            <img src={msg.attachment_data} alt={msg.attachment_name} className="max-h-32 rounded-lg object-cover" />
                          ) : (
                            <a
                              href={msg.attachment_data || "#"}
                              download={msg.attachment_name}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-2 py-1 text-xs hover:opacity-75"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {msg.attachment_name}
                            </a>
                          )}
                        </div>
                      )}
                      <p className="text-[10px] mt-1 opacity-50">{new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {attachedFile && (
              <div className="flex items-center gap-2 mb-2 rounded-lg bg-secondary px-3 py-2 text-xs">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate">{attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)}><X className="h-3.5 w-3.5" /></button>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                className="sr-only"
                onChange={(e) => setAttachedFile(e.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl border border-border p-2.5 hover:bg-secondary transition-colors"
              >
                <Paperclip className="h-4 w-4 text-muted-foreground" />
              </button>
              <input
                className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder={lang === "ar" ? "اكتب رسالة..." : "Type a message..."}
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                disabled={isSendingMsg}
              />
              <button
                onClick={sendMessage}
                disabled={isSendingMsg || (!newMsg.trim() && !attachedFile)}
                className="rounded-xl bg-primary px-3 py-2.5 text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSendingMsg ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        {/* ══ TAB 3 — FILES ══ */}
        {activeTab === 3 && (
          <div>
            {filesFromMessages.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">{lang === "ar" ? "لا توجد ملفات بعد" : "No files yet"}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filesFromMessages.map((f, i) => (
                  <div key={i} className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{f.senderName} · {new Date(f.date).toLocaleDateString()}</p>
                    </div>
                    {f.data && (
                      <a href={f.data} download={f.name} className="rounded-lg border border-border px-3 py-1.5 text-xs hover:bg-secondary transition-colors">
                        {lang === "ar" ? "تحميل" : "Download"}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
