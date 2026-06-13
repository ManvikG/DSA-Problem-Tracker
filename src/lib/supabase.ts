import { createClient } from '@supabase/supabase-js';

export interface Reminder {
  id: string;
  title: string;
  notes: string | null;
  deadline_date: string | null;
  deadline_time: string | null;
  reminder_date: string | null;
  reminder_time: string | null;
  priority: number;
  list_color: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface FocusSession {
  id: string;
  task_name: string;
  duration_minutes: number;
  apps_to_avoid: string[];
  started_at: string;
  ended_at: string | null;
  screenshot_url: string | null;
  verification_status: 'pending' | 'verified' | 'rejected';
  ai_feedback: string | null;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);