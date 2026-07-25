"use client";

import { createClient } from "@/lib/supabase/client";
import type {
  FavoriteVocabularyRow,
  FlashcardProgressRow,
  FlashcardStatus,
} from "@/types/vocabulary";

export async function getFlashcardState(level: number) {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      userId: null,
      favorites: [] as FavoriteVocabularyRow[],
      progress: [] as FlashcardProgressRow[],
    };
  }

  const [favoritesResult, progressResult] = await Promise.all([
    supabase
      .from("vocabulary_favorites")
      .select("id,user_id,vocab_id,level,created_at")
      .eq("user_id", user.id)
      .eq("level", level),
    supabase
      .from("flashcard_progress")
      .select(
        "id,user_id,vocab_id,level,status,review_count,last_reviewed_at,updated_at",
      )
      .eq("user_id", user.id)
      .eq("level", level),
  ]);

  if (favoritesResult.error) {
    throw new Error(favoritesResult.error.message);
  }

  if (progressResult.error) {
    throw new Error(progressResult.error.message);
  }

  return {
    userId: user.id,
    favorites:
      (favoritesResult.data ?? []) as FavoriteVocabularyRow[],
    progress:
      (progressResult.data ?? []) as FlashcardProgressRow[],
  };
}

export async function toggleVocabularyFavorite(
  vocabId: string,
  level: number,
  currentlyFavorite: boolean,
): Promise<boolean> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Please log in to save favorites.");
  }

  if (currentlyFavorite) {
    const { error } = await supabase
      .from("vocabulary_favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("vocab_id", vocabId);

    if (error) {
      throw new Error(error.message);
    }

    return false;
  }

  const { error } = await supabase
    .from("vocabulary_favorites")
    .upsert(
      {
        user_id: user.id,
        vocab_id: vocabId,
        level,
      },
      {
        onConflict: "user_id,vocab_id",
      },
    );

  if (error) {
    throw new Error(error.message);
  }

  return true;
}

export async function saveFlashcardProgress(
  vocabId: string,
  level: number,
  status: FlashcardStatus,
): Promise<void> {
  const supabase = createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Please log in to save progress.");
  }

  const { error } = await supabase.rpc(
    "save_flashcard_progress",
    {
      p_vocab_id: vocabId,
      p_level: level,
      p_status: status,
    },
  );

  if (error) {
    throw new Error(error.message);
  }
}
