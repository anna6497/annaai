import { createClient } from "@/lib/supabase/client";

export interface HskWritingProgress {
  id: string;
  user_id: string;
  level: number;
  lesson: number;
  best_score: number;
  stars: number;
  completed: boolean;
  attempts_count: number;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SaveWritingProgressInput {
  level: number;
  lesson: number;
  score: number;
}

function validateLevel(level: number) {
  if (!Number.isInteger(level) || level < 1 || level > 9) {
    throw new Error("HSK level must be between 1 and 9.");
  }
}

function validateLesson(lesson: number) {
  if (!Number.isInteger(lesson) || lesson < 1) {
    throw new Error("Lesson must be a positive integer.");
  }
}

function validateScore(score: number) {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new Error("Score must be between 0 and 100.");
  }
}

function isMissingSessionError(message?: string) {
  const normalized = message?.toLowerCase() ?? "";
  return normalized.includes("auth session missing") || normalized.includes("session missing");
}

export function calculateWritingStars(score: number): number {
  validateScore(score);
  if (score >= 95) return 3;
  if (score >= 80) return 2;
  if (score >= 60) return 1;
  return 0;
}

export async function saveWritingProgress({ level, lesson, score }: SaveWritingProgressInput): Promise<HskWritingProgress> {
  validateLevel(level);
  validateLesson(lesson);
  validateScore(score);

  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError && !isMissingSessionError(userError.message)) {
    throw new Error(userError.message || "Authentication check failed.");
  }
  if (!user) throw new Error("Please log in before saving your progress.");

  const { data, error } = await supabase.rpc("save_hsk_writing_progress", {
    p_level: level,
    p_lesson: lesson,
    p_score: Math.round(score),
  });

  if (error) throw new Error(error.message || "Writing progress could not be saved.");
  if (!data) throw new Error("Writing progress was saved, but no result was returned.");
  if (Array.isArray(data)) {
    if (data.length === 0) throw new Error("Writing progress was saved, but no row was returned.");
    return data[0] as HskWritingProgress;
  }
  return data as HskWritingProgress;
}

export async function getWritingProgress(level: number): Promise<HskWritingProgress[]> {
  validateLevel(level);
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError && !isMissingSessionError(userError.message)) {
    throw new Error(userError.message || "Authentication check failed.");
  }
  if (!user) return [];

  const { data, error } = await supabase
    .from("hsk_writing_progress")
    .select("id,user_id,level,lesson,best_score,stars,completed,attempts_count,completed_at,created_at,updated_at")
    .eq("user_id", user.id)
    .eq("level", level)
    .order("lesson", { ascending: true });

  if (error) throw new Error(error.message || "Writing progress could not be loaded.");
  return (data as HskWritingProgress[] | null) ?? [];
}

export async function getWritingLessonProgress(level: number, lesson: number): Promise<HskWritingProgress | null> {
  validateLevel(level);
  validateLesson(lesson);
  const supabase = createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError && !isMissingSessionError(userError.message)) {
    throw new Error(userError.message || "Authentication check failed.");
  }
  if (!user) return null;

  const { data, error } = await supabase
    .from("hsk_writing_progress")
    .select("id,user_id,level,lesson,best_score,stars,completed,attempts_count,completed_at,created_at,updated_at")
    .eq("user_id", user.id)
    .eq("level", level)
    .eq("lesson", lesson)
    .maybeSingle();

  if (error) throw new Error(error.message || "Lesson progress could not be loaded.");
  return data as HskWritingProgress | null;
}

export function isWritingLessonUnlocked(lessonNumber: number, progress: HskWritingProgress[]) {
  if (lessonNumber <= 1) return true;
  return Boolean(progress.find((item) => item.lesson === lessonNumber - 1)?.completed);
}
