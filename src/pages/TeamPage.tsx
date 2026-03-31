import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useLang } from "@/contexts/LanguageContext";
import { useApp } from "@/contexts/AppContext";
import Header from "@/components/Header";
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Paperclip,
  Send,
  FileText,
  AlertCircle,
  X,
  Download,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type TaskStatus = "in-progress" | "under-review" | "completed";

// ─── Helper: generate IDs ─────────────────────────────────────────────────────
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const TeamPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t, lang } = useLang();
  const { allProjects, allResearchers, setProjects } = useApp();

  const [activeTab, setActiveTab] = useState(0);

  // ── Discussion state ────────────────────────────────────────────────────────
  const [newMsg, setNewMsg] = useState("");
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [fileUrls, setFileUrls] = useState<Record<string, string>>({});

  // ── Task state ──────────────────────────────────────────────────────────────
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [newTaskDue, setNewTaskDue] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>("in-progress");

  // ── Drag state ──────────────────────────────────────────────────────────────
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const project = allProjects.find((p) => p.id === id);
  if (!project)
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center text-muted-foreground">
          Project not found
        </div>
      </div>
    );

  const members = project.members
    .map((mId) => allResearchers.find((r) => r.id === mId)!)
    .filter(Boolean);

  const tabs = [
    t("team.overview"),
    t("team.tasks"),
    t("team.discussions"),
    t("team.files"),
  ];

  const getRole = (i: number) => {
    if (i === 0) return t("team.roles.firstAuthor");
    if (i === members.length - 1 && members.length > 1)
      return t("team.roles.lastAuthor");
    return t("team.roles.coAuthor");
  };

  const moveAuthor = (index: number, dir: -1 | 1) => {
    const newMembers = [...project.members];
    const target = index + dir;
    if (target < 0 || target >= newMembers.length) return;
    [newMembers[index], newMembers[target]] = [
      newMembers[target],
      newMembers[index],
    ];
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, members: newMembers } : p)),
    );
  };

  // ── Auto-scroll chat ────────────────────────────────────────────────────────
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [project.messages]);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = () => {
    if (!newMsg.trim() && !attachedFile) return;
    const newMessage: any = {
      id: `m${uid()}`,
      senderId: "r1",
      text: newMsg || (attachedFile ? attachedFile.name : ""),
      textEn: newMsg || (attachedFile ? attachedFile.name : ""),
      timestamp: new Date().toISOString(),
    };
    if (attachedFile) {
      newMessage.attachment = {
        name: attachedFile.name,
        type: attachedFile.name.split(".").pop()?.toLowerCase() ?? "file",
      };
    }
    // If there's a real file, create a blob URL and save it
    if (attachedFile) {
      const url = URL.createObjectURL(attachedFile);
      setFileUrls((prev) => ({ ...prev, [newMessage.id]: url }));
    }

    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, messages: [...p.messages, newMessage] } : p,
      ),
    );
    setNewMsg("");
    setAttachedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // ── Create task ─────────────────────────────────────────────────────────────
  const createTask = () => {
    if (!newTaskTitle.trim()) return;
    const task = {
      id: `t${uid()}`,
      title: newTaskTitle,
      titleEn: newTaskTitle,
      description: newTaskDesc,
      descriptionEn: newTaskDesc,
      assigneeId: newTaskAssignee || (members[0]?.id ?? ""),
      dueDate: newTaskDue || new Date().toISOString().slice(0, 10),
      status: newTaskStatus,
    };
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, tasks: [...p.tasks, task] } : p)),
    );
    setShowNewTask(false);
    setNewTaskTitle("");
    setNewTaskDesc("");
    setNewTaskAssignee("");
    setNewTaskDue("");
    setNewTaskStatus("in-progress");
  };

  // ── Drag handlers ───────────────────────────────────────────────────────────
  const onDragStart = (taskId: string) => setDraggingTaskId(taskId);
  const onDragEnd = () => {
    setDraggingTaskId(null);
    setDragOverCol(null);
  };

  const onDropColumn = (status: TaskStatus) => {
    if (!draggingTaskId) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              tasks: p.tasks.map((tk) =>
                tk.id === draggingTaskId ? { ...tk, status } : tk,
              ),
            }
          : p,
      ),
    );
    setDraggingTaskId(null);
    setDragOverCol(null);
  };

  // ── Derived ─────────────────────────────────────────────────────────────────
  const tasksByStatus: Record<TaskStatus, typeof project.tasks> = {
    "in-progress": project.tasks.filter((tk) => tk.status === "in-progress"),
    "under-review": project.tasks.filter((tk) => tk.status === "under-review"),
    completed: project.tasks.filter((tk) => tk.status === "completed"),
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

  const filesFromMessages = project.messages
    .filter((m) => m.attachment)
    .map((m) => ({
      ...m.attachment!,
      uploadedBy: allResearchers.find((r) => r.id === m.senderId),
      date: m.timestamp,
    }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="font-heading text-2xl font-bold mb-1">
          {lang === "ar" ? project.title : project.titleEn}
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          {lang === "ar" ? project.field : project.fieldEn} ·{" "}
          {lang === "ar" ? project.subField : project.subFieldEn}
        </p>

        {/* ── Tabs ── */}
        <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === i
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ══════════════ TAB 0 — OVERVIEW ══════════════ */}
        {activeTab === 0 && (
          <div className="space-y-8">
            <div className="rounded-xl border border-border bg-card p-6">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {lang === "ar" ? project.description : project.descriptionEn}
              </p>
              <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>
                  {t("common.from")}: {project.startDate}
                </span>
                <span>
                  {t("common.to")}: {project.endDate}
                </span>
                <span>{t(`dashboard.type.${project.type}`)}</span>
                <span>{t(`dashboard.status.${project.status}`)}</span>
              </div>
            </div>

            {/* Members */}
            <div>
              <h2 className="font-heading text-lg font-semibold mb-4">
                {t("dashboard.members")}
              </h2>
              <div className="space-y-3">
                {members.map((m, i) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                      {(lang === "ar" ? m.name : m.nameEn).charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">
                        {lang === "ar" ? m.name : m.nameEn}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRole(i)}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {
                        project.tasks.filter((tk) => tk.assigneeId === m.id)
                          .length
                      }{" "}
                      {t("team.tasks")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Author order */}
            <div>
              <h2 className="font-heading text-lg font-semibold mb-2">
                {t("team.authorOrder")}
              </h2>
              <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {t("team.authorNote")}
              </p>
              <div className="space-y-2">
                {members.map((m, i) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <span className="text-sm font-bold text-muted-foreground w-6 text-center">
                      {i + 1}
                    </span>
                    <span className="flex-1 text-sm font-medium">
                      {lang === "ar" ? m.name : m.nameEn}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveAuthor(i, -1)}
                        disabled={i === 0}
                        className="rounded p-1 hover:bg-secondary disabled:opacity-30"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => moveAuthor(i, 1)}
                        disabled={i === members.length - 1}
                        className="rounded p-1 hover:bg-secondary disabled:opacity-30"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════ TAB 1 — TASKS ══════════════ */}
        {activeTab === 1 && (
          <div>
            {/* New Task Button */}
            <button
              onClick={() => setShowNewTask(true)}
              className="mb-6 flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" /> {t("team.newTask")}
            </button>

            {/* New Task Modal */}
            {showNewTask && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-heading text-lg font-bold">
                      {t("team.newTask")}
                    </h3>
                    <button
                      onClick={() => setShowNewTask(false)}
                      className="rounded-lg p-1.5 hover:bg-secondary transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                        {lang === "ar" ? "عنوان المهمة *" : "Task Title *"}
                      </label>
                      <input
                        className="form-input w-full"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder={
                          lang === "ar"
                            ? "أدخل عنوان المهمة"
                            : "Enter task title"
                        }
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                        {lang === "ar" ? "الوصف" : "Description"}
                      </label>
                      <textarea
                        className="form-input w-full resize-none"
                        rows={3}
                        value={newTaskDesc}
                        onChange={(e) => setNewTaskDesc(e.target.value)}
                        placeholder={
                          lang === "ar"
                            ? "وصف المهمة (اختياري)"
                            : "Task description (optional)"
                        }
                      />
                    </div>

                    {/* Assignee */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                        {lang === "ar" ? "المسؤول" : "Assignee"}
                      </label>
                      <select
                        className="form-input w-full"
                        value={newTaskAssignee}
                        onChange={(e) => setNewTaskAssignee(e.target.value)}
                      >
                        <option value="">
                          {lang === "ar" ? "اختر عضواً" : "Select a member"}
                        </option>
                        {members.map((m) => (
                          <option key={m.id} value={m.id}>
                            {lang === "ar" ? m.name : m.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                        {lang === "ar" ? "تاريخ الاستحقاق" : "Due Date"}
                      </label>
                      <input
                        type="date"
                        className="form-input w-full"
                        value={newTaskDue}
                        onChange={(e) => setNewTaskDue(e.target.value)}
                      />
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 text-muted-foreground">
                        {lang === "ar" ? "الحالة" : "Status"}
                      </label>
                      <select
                        className="form-input w-full"
                        value={newTaskStatus}
                        onChange={(e) =>
                          setNewTaskStatus(e.target.value as TaskStatus)
                        }
                      >
                        <option value="in-progress">
                          {t("team.inProgress")}
                        </option>
                        <option value="under-review">
                          {t("team.underReview")}
                        </option>
                        <option value="completed">{t("team.completed")}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={createTask}
                      disabled={!newTaskTitle.trim()}
                      className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
                    >
                      {lang === "ar" ? "إنشاء المهمة" : "Create Task"}
                    </button>
                    <button
                      onClick={() => setShowNewTask(false)}
                      className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
                    >
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Task Board — 3 draggable columns */}
            <div className="grid gap-6 md:grid-cols-3">
              {(
                ["in-progress", "under-review", "completed"] as TaskStatus[]
              ).map((status) => (
                <div
                  key={status}
                  className={`rounded-xl border p-4 transition-all duration-150 ${statusColors[status]} ${dragOverCol === status ? dragOverStyles[status] : ""}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverCol(status);
                  }}
                  onDragLeave={() => setDragOverCol(null)}
                  onDrop={() => onDropColumn(status)}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${statusDotColors[status]}`}
                    />
                    <h3 className="text-sm font-semibold">
                      {statusLabels[status]}
                    </h3>
                    <span className="text-xs text-muted-foreground ms-auto">
                      {tasksByStatus[status].length}
                    </span>
                  </div>

                  {/* Drop hint when empty and dragging */}
                  {tasksByStatus[status].length === 0 && draggingTaskId && (
                    <div className="rounded-lg border-2 border-dashed border-border h-16 flex items-center justify-center text-xs text-muted-foreground">
                      {lang === "ar" ? "أفلت هنا" : "Drop here"}
                    </div>
                  )}

                  <div className="space-y-3">
                    {tasksByStatus[status].map((task) => {
                      const assignee = allResearchers.find(
                        (r) => r.id === task.assigneeId,
                      );
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={() => onDragStart(task.id)}
                          onDragEnd={onDragEnd}
                          className={`rounded-lg border border-border bg-card p-3 cursor-grab active:cursor-grabbing select-none card-hover transition-opacity ${
                            draggingTaskId === task.id
                              ? "opacity-40"
                              : "opacity-100"
                          }`}
                          onClick={() =>
                            setExpandedTask(
                              expandedTask === task.id ? null : task.id,
                            )
                          }
                        >
                          {/* Drag handle hint */}
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="text-sm font-medium flex-1">
                              {lang === "ar" ? task.title : task.titleEn}
                            </h4>
                            <span className="text-muted-foreground/30 text-xs ms-2 select-none">
                              ⠿
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center text-[10px]">
                                {assignee
                                  ? (lang === "ar"
                                      ? assignee.name
                                      : assignee.nameEn
                                    ).charAt(0)
                                  : "?"}
                              </div>
                              {assignee
                                ? (lang === "ar"
                                    ? assignee.name
                                    : assignee.nameEn
                                  ).split(" ")[0]
                                : ""}
                            </span>
                            <span>{task.dueDate}</span>
                          </div>
                          {expandedTask === task.id && (
                            <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">
                              {lang === "ar"
                                ? task.description
                                : task.descriptionEn}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════ TAB 2 — DISCUSSIONS ══════════════ */}
        {activeTab === 2 && (
          <div>
            {/* Privacy notice */}
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-gold-subtle p-3 text-xs text-primary">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {t("team.discussionNote")}
            </div>

            {/* Messages list */}
            <div className="space-y-4 mb-4 max-h-[460px] overflow-y-auto pr-1">
              {project.messages.map((msg) => {
                const sender = allResearchers.find(
                  (r) => r.id === msg.senderId,
                );
                return (
                  <div key={msg.id} className="flex gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold">
                      {sender
                        ? (lang === "ar" ? sender.name : sender.nameEn).charAt(
                            0,
                          )
                        : "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {sender
                            ? lang === "ar"
                              ? sender.name
                              : sender.nameEn
                            : "?"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleString(
                            lang === "ar" ? "ar-SA" : "en-US",
                          )}
                        </span>
                      </div>
                      {msg.text && (
                        <p className="text-sm text-muted-foreground">
                          {lang === "ar" ? msg.text : msg.textEn}
                        </p>
                      )}
                      {msg.attachment &&
                        (fileUrls[msg.id] ? (
                          <a
                            href={fileUrls[msg.id]}
                            download={msg.attachment.name}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-secondary/80 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span>{msg.attachment.name}</span>
                            <Download className="h-3 w-3 text-muted-foreground ms-1" />
                          </a>
                        ) : (
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-secondary/50 px-3 py-1.5 text-xs font-medium opacity-60">
                            <FileText className="h-3.5 w-3.5 text-primary" />
                            <span>{msg.attachment.name}</span>
                            <span className="text-muted-foreground ms-1">
                              {lang === "ar"
                                ? "(غير متاح للتنزيل)"
                                : "(not downloadable)"}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
              <div ref={chatBottomRef} />
            </div>

            {/* Attached file preview */}
            {attachedFile && (
              <div className="mb-2 inline-flex items-center gap-2 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium">
                <FileText className="h-3.5 w-3.5 text-primary" />
                <span className="max-w-[200px] truncate">
                  {attachedFile.name}
                </span>
                <button
                  onClick={() => {
                    setAttachedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="rounded p-0.5 hover:bg-border transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}

            {/* Input row */}
            <div className="flex gap-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={(e) => setAttachedFile(e.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-lg border p-2.5 transition-colors ${
                  attachedFile
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border hover:bg-secondary text-muted-foreground"
                }`}
                title={lang === "ar" ? "إرفاق ملف" : "Attach file"}
              >
                <Paperclip className="h-4 w-4" />
              </button>
              <input
                className="form-input flex-1"
                placeholder={t("team.sendMessage")}
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={sendMessage}
                disabled={!newMsg.trim() && !attachedFile}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════ TAB 3 — FILES ══════════════ */}
        {activeTab === 3 && (
          <div>
            {filesFromMessages.length === 0 ? (
              <div className="text-center py-20">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  {t("dashboard.noResults")}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-card">
                      <th className="text-start p-3 font-medium">
                        {t("team.fileName")}
                      </th>
                      <th className="text-start p-3 font-medium">
                        {t("team.uploadedBy")}
                      </th>
                      <th className="text-start p-3 font-medium">
                        {t("team.date")}
                      </th>
                      <th className="text-start p-3 font-medium">
                        {t("team.type")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filesFromMessages.map((f, i) => (
                      <tr
                        key={i}
                        className="border-b border-border last:border-0 hover:bg-secondary/40 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                            <span>{f.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {f.uploadedBy
                            ? lang === "ar"
                              ? f.uploadedBy.name
                              : f.uploadedBy.nameEn
                            : "—"}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(f.date).toLocaleDateString(
                            lang === "ar" ? "ar-SA" : "en-US",
                          )}
                        </td>
                        <td className="p-3">
                          <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium uppercase">
                            {f.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPage;
