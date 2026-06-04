import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'jobseeker' | 'recruiter';

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  created_at: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  skills: string[];
  recruiter_id: string;
  created_at: string;
  profiles?: Profile;
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  match_percentage: number;
  created_at: string;
  jobs?: Job;
  profiles?: Profile;
}

export interface Resume {
  id: string;
  user_id: string;
  text: string;
  extracted_skills: string[];
  created_at: string;
}
