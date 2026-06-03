// Hand-written types mirroring supabase/schema.sql.
// Regenerate with `supabase gen types typescript` once the CLI is set up.

export type ProjectType = "empirical" | "mixed" | "theoretical" | "qualitative";
export type ProjectStatus = "idea" | "in-progress" | "final";
export type TaskStatus = "in-progress" | "under-review" | "completed";

export interface ResearcherRow {
  id: string;
  name: string;
  name_en: string;
  email: string;
  avatar: string;
  degree: string;
  degree_en: string;
  university: string;
  university_en: string;
  faculty: string;
  faculty_en: string;
  field: string;
  field_en: string;
  sub_field: string;
  sub_field_en: string;
  interests: string[];
  interests_en: string[];
  orcid: string | null;
  scholar: string | null;
  scopus: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  field: string;
  field_en: string;
  sub_field: string;
  sub_field_en: string;
  interests: string[];
  interests_en: string[];
  type: ProjectType;
  status: ProjectStatus;
  start_date: string;
  end_date: string;
  max_members: number;
  leader_id: string;
  completion: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectMemberRow {
  project_id: string;
  researcher_id: string;
  joined_at: string;
}

export interface TaskRow {
  id: string;
  project_id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  assignee_id: string | null;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface MessageRow {
  id: string;
  project_id: string;
  sender_id: string;
  text: string;
  text_en: string;
  attachment_name: string | null;
  attachment_type: string | null;
  created_at: string;
}

type WithInsert<T, Generated extends keyof T> = Omit<T, Generated> &
  Partial<Pick<T, Generated>>;

export interface Database {
  public: {
    Tables: {
      researchers: {
        Row: ResearcherRow;
        Insert: WithInsert<ResearcherRow, "created_at" | "updated_at" | "avatar" | "interests" | "interests_en" | "orcid" | "scholar" | "scopus">;
        Update: Partial<ResearcherRow>;
      };
      projects: {
        Row: ProjectRow;
        Insert: WithInsert<ProjectRow, "id" | "created_at" | "updated_at" | "status" | "completion" | "interests" | "interests_en">;
        Update: Partial<ProjectRow>;
      };
      project_members: {
        Row: ProjectMemberRow;
        Insert: WithInsert<ProjectMemberRow, "joined_at">;
        Update: Partial<ProjectMemberRow>;
      };
      tasks: {
        Row: TaskRow;
        Insert: WithInsert<TaskRow, "id" | "created_at" | "updated_at" | "status" | "assignee_id" | "due_date">;
        Update: Partial<TaskRow>;
      };
      messages: {
        Row: MessageRow;
        Insert: WithInsert<MessageRow, "id" | "created_at" | "text_en" | "attachment_name" | "attachment_type">;
        Update: Partial<MessageRow>;
      };
    };
  };
}
