import { supabase } from "@/lib/supabase";
import type {
  Researcher,
  ResearchProject,
  Task,
  Message,
} from "@/data/mockData";
import type {
  ResearcherRow,
  ProjectRow,
  TaskRow,
  MessageRow,
} from "@/lib/database.types";

// ---------- row → app shape mappers ----------------------------------
export const rowToResearcher = (r: ResearcherRow): Researcher => ({
  id: r.id,
  name: r.name,
  nameEn: r.name_en,
  email: r.email,
  avatar: r.avatar,
  degree: r.degree,
  degreeEn: r.degree_en,
  university: r.university,
  universityEn: r.university_en,
  faculty: r.faculty,
  facultyEn: r.faculty_en,
  field: r.field,
  fieldEn: r.field_en,
  subField: r.sub_field,
  subFieldEn: r.sub_field_en,
  interests: r.interests,
  interestsEn: r.interests_en,
  orcid: r.orcid ?? undefined,
  scholar: r.scholar ?? undefined,
  scopus: r.scopus ?? undefined,
});

export const rowToTask = (t: TaskRow): Task => ({
  id: t.id,
  title: t.title,
  titleEn: t.title_en,
  description: t.description,
  descriptionEn: t.description_en,
  assigneeId: t.assignee_id ?? "",
  status: t.status,
  dueDate: t.due_date ?? "",
});

export const rowToMessage = (m: MessageRow): Message => ({
  id: m.id,
  senderId: m.sender_id,
  text: m.text,
  textEn: m.text_en,
  timestamp: m.created_at,
  attachment:
    m.attachment_name && m.attachment_type
      ? { name: m.attachment_name, type: m.attachment_type }
      : undefined,
});

interface ProjectWithRelations extends ProjectRow {
  project_members: { researcher_id: string }[];
  tasks: TaskRow[];
  messages: MessageRow[];
}

export const rowToProject = (p: ProjectWithRelations): ResearchProject => ({
  id: p.id,
  title: p.title,
  titleEn: p.title_en,
  description: p.description,
  descriptionEn: p.description_en,
  field: p.field,
  fieldEn: p.field_en,
  subField: p.sub_field,
  subFieldEn: p.sub_field_en,
  interests: p.interests,
  interestsEn: p.interests_en,
  type: p.type,
  status: p.status,
  startDate: p.start_date,
  endDate: p.end_date,
  maxMembers: p.max_members,
  members: (p.project_members ?? []).map((m) => m.researcher_id),
  leaderId: p.leader_id,
  completion: p.completion,
  tasks: (p.tasks ?? []).map(rowToTask),
  messages: (p.messages ?? []).map(rowToMessage),
});

// ---------- reads ----------------------------------------------------
export async function fetchResearchers(): Promise<Researcher[]> {
  const { data, error } = await supabase.from("researchers").select("*");
  if (error) throw error;
  return (data ?? []).map(rowToResearcher);
}

export async function fetchMyResearcher(
  userId: string,
): Promise<Researcher | null> {
  const { data, error } = await supabase
    .from("researchers")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToResearcher(data) : null;
}

export async function fetchProjects(): Promise<ResearchProject[]> {
  const { data, error } = await supabase
    .from("projects")
    .select(
      "*, project_members(researcher_id), tasks(*), messages(*)",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p) =>
    rowToProject(p as unknown as ProjectWithRelations),
  );
}

// ---------- writes ---------------------------------------------------
export interface NewProjectInput {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  field: string;
  fieldEn: string;
  subField: string;
  subFieldEn: string;
  interests: string[];
  interestsEn: string[];
  type: ResearchProject["type"];
  startDate: string;
  endDate: string;
  maxMembers: number;
  leaderId: string;
}

export async function createProject(input: NewProjectInput): Promise<string> {
  const { data, error } = await supabase
    .from("projects")
    .insert({
      title: input.title,
      title_en: input.titleEn,
      description: input.description,
      description_en: input.descriptionEn,
      field: input.field,
      field_en: input.fieldEn,
      sub_field: input.subField,
      sub_field_en: input.subFieldEn,
      interests: input.interests,
      interests_en: input.interestsEn,
      type: input.type,
      start_date: input.startDate,
      end_date: input.endDate,
      max_members: input.maxMembers,
      leader_id: input.leaderId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function joinProject(projectId: string, researcherId: string) {
  const { error } = await supabase
    .from("project_members")
    .insert({ project_id: projectId, researcher_id: researcherId });
  if (error) throw error;
}

export async function leaveProject(projectId: string, researcherId: string) {
  const { error } = await supabase
    .from("project_members")
    .delete()
    .eq("project_id", projectId)
    .eq("researcher_id", researcherId);
  if (error) throw error;
}

export async function updateProjectStatus(
  projectId: string,
  status: ResearchProject["status"],
) {
  const { error } = await supabase
    .from("projects")
    .update({ status })
    .eq("id", projectId);
  if (error) throw error;
}

export async function updateProjectCompletion(
  projectId: string,
  completion: number,
) {
  const { error } = await supabase
    .from("projects")
    .update({ completion })
    .eq("id", projectId);
  if (error) throw error;
}

export interface NewTaskInput {
  projectId: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  assigneeId?: string;
  dueDate?: string;
}

export async function createTask(input: NewTaskInput): Promise<string> {
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: input.projectId,
      title: input.title,
      title_en: input.titleEn,
      description: input.description,
      description_en: input.descriptionEn,
      assignee_id: input.assigneeId ?? null,
      due_date: input.dueDate ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

export async function updateTaskStatus(
  taskId: string,
  status: Task["status"],
) {
  const { error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", taskId);
  if (error) throw error;
}

export interface NewMessageInput {
  projectId: string;
  senderId: string;
  text: string;
  textEn?: string;
  attachment?: { name: string; type: string };
}

export async function sendMessage(input: NewMessageInput): Promise<string> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      project_id: input.projectId,
      sender_id: input.senderId,
      text: input.text,
      text_en: input.textEn ?? "",
      attachment_name: input.attachment?.name ?? null,
      attachment_type: input.attachment?.type ?? null,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

// ---------- auth-side researcher creation ---------------------------
export interface NewResearcherInput {
  id: string; // auth.users.id
  name: string;
  nameEn: string;
  email: string;
  degree: string;
  degreeEn: string;
  university: string;
  universityEn: string;
  faculty: string;
  facultyEn: string;
  field: string;
  fieldEn: string;
  subField: string;
  subFieldEn: string;
  interests?: string[];
  interestsEn?: string[];
  orcid?: string;
  scholar?: string;
  scopus?: string;
}

export async function createResearcherProfile(input: NewResearcherInput) {
  const { error } = await supabase.from("researchers").insert({
    id: input.id,
    name: input.name,
    name_en: input.nameEn,
    email: input.email,
    degree: input.degree,
    degree_en: input.degreeEn,
    university: input.university,
    university_en: input.universityEn,
    faculty: input.faculty,
    faculty_en: input.facultyEn,
    field: input.field,
    field_en: input.fieldEn,
    sub_field: input.subField,
    sub_field_en: input.subFieldEn,
    interests: input.interests ?? [],
    interests_en: input.interestsEn ?? [],
    orcid: input.orcid ?? null,
    scholar: input.scholar ?? null,
    scopus: input.scopus ?? null,
  });
  if (error) throw error;
}
