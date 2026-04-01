// ── Type definitions only — no dummy data ─────────────────────────────────

export interface Researcher {
  id: number;
  display_name: string;
  full_name: string;
  email: string;
  profile_photo: string | null;
  degree: string;
  university: string;
  faculty: string;
  field: string;
  sub_field: string;
  interests: string[];
  orcid?: string;
  scholar?: string;
  scopus?: string;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  description: string;
  assignee_id: number | null;
  assignee_name?: string;
  status: "in-progress" | "under-review" | "completed";
  due_date: string | null;
  created_at: string;
}

export interface Message {
  id: number;
  project_id: number;
  sender_id: number;
  sender_name: string;
  sender_photo: string | null;
  text: string;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_data?: string | null;
  created_at: string;
}

export interface ResearchProject {
  id: number;
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
  type: "empirical" | "mixed" | "theoretical" | "qualitative";
  status: "idea" | "in-progress" | "final";
  start_date: string | null;
  end_date: string | null;
  max_members: number;
  member_ids: number[];
  leader_id: number;
  completion: number;
  created_at: string;
  tasks?: Task[];
  messages?: Message[];
  members?: Researcher[];
}
