import { supabase } from "./supabaseClient";
import { QuizQuestion } from "./sigmaData";

export interface QuizQuestionRow {
  id: string | number;
  module_id: string;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string | null;
  position: number;
  is_active: boolean;
  created_by?: string | null;
  created_at?: string | null;
}

/**
 * Mengambil soal aktif untuk siswa dari tabel quiz_questions.
 * Jika kosong atau terjadi kesalahan, menggunakan fallback soal bawaan di kode.
 */
export async function getStudentQuizQuestions(
  moduleId: string,
  fallbackQuestions: QuizQuestion[] = []
): Promise<QuizQuestion[]> {
  try {
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("id, module_id, question, options, correct_index, explanation, position, is_active")
      .eq("module_id", moduleId)
      .eq("is_active", true)
      .order("position", { ascending: true });

    if (error) {
      console.error(`[QuizApi] Gagal memuat soal kuis siswa untuk modul ${moduleId}:`, error);
      return fallbackQuestions;
    }

    if (!data || data.length === 0) {
      return fallbackQuestions;
    }

    return data.map((row, idx) => {
      let parsedOptions: string[] = [];
      if (Array.isArray(row.options)) {
        parsedOptions = row.options;
      } else if (typeof row.options === "string") {
        try {
          parsedOptions = JSON.parse(row.options);
        } catch {
          parsedOptions = [row.options];
        }
      }

      return {
        id: typeof row.id === "number" ? row.id : idx + 1,
        question: row.question,
        options: parsedOptions,
        correctAnswer: typeof row.correct_index === "number" ? row.correct_index : 0,
        explanation: row.explanation || undefined,
      };
    });
  } catch (err) {
    console.error(`[QuizApi] Exception saat memuat soal kuis siswa untuk ${moduleId}:`, err);
    return fallbackQuestions;
  }
}

/**
 * Mengambil seluruh soal (aktif & nonaktif) untuk guru di editor soal.
 */
export async function getTeacherQuizQuestions(moduleId: string): Promise<QuizQuestionRow[]> {
  try {
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("id, module_id, question, options, correct_index, explanation, position, is_active, created_by, created_at")
      .eq("module_id", moduleId)
      .order("position", { ascending: true });

    if (error) {
      console.error(`[QuizApi] Gagal memuat daftar soal guru untuk modul ${moduleId}:`, error);
      throw error;
    }

    if (!data) return [];

    return data.map((row) => {
      let parsedOptions: string[] = [];
      if (Array.isArray(row.options)) {
        parsedOptions = row.options;
      } else if (typeof row.options === "string") {
        try {
          parsedOptions = JSON.parse(row.options);
        } catch {
          parsedOptions = [row.options];
        }
      }

      return {
        ...row,
        options: parsedOptions,
      };
    });
  } catch (err) {
    console.error(`[QuizApi] Exception saat mengambil soal guru untuk ${moduleId}:`, err);
    throw err;
  }
}

/**
 * Impor soal bawaan di kode ke tabel quiz_questions untuk modul terkait.
 */
export async function importBuiltinQuizQuestions(
  moduleId: string,
  userId: string,
  builtinQuestions: QuizQuestion[]
): Promise<void> {
  try {
    if (!builtinQuestions || builtinQuestions.length === 0) {
      throw new Error("Tidak ada soal bawaan yang dapat diimpor.");
    }

    const payload = builtinQuestions.map((q, idx) => ({
      module_id: moduleId,
      question: q.question,
      options: q.options,
      correct_index: q.correctAnswer,
      explanation: q.explanation || null,
      position: idx + 1,
      is_active: true,
      created_by: userId,
    }));

    const { error } = await supabase.from("quiz_questions").insert(payload);

    if (error) {
      console.error(`[QuizApi] Gagal mengimpor soal bawaan untuk ${moduleId}:`, error);
      throw error;
    }
  } catch (err) {
    console.error(`[QuizApi] Exception saat impor soal bawaan ${moduleId}:`, err);
    throw err;
  }
}

/**
 * Menyimpan soal baru atau memperbarui soal yang sudah ada.
 */
export async function upsertQuizQuestion(params: {
  id?: string | number | null;
  moduleId: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
  isActive?: boolean;
  position?: number;
  userId?: string;
}): Promise<void> {
  const { id, moduleId, question, options, correctIndex, explanation, isActive = true, position, userId } = params;

  try {
    if (id) {
      // Update
      const { error } = await supabase
        .from("quiz_questions")
        .update({
          question,
          options,
          correct_index: correctIndex,
          explanation: explanation || null,
          is_active: isActive,
        })
        .eq("id", id);

      if (error) {
        console.error(`[QuizApi] Gagal memperbarui soal id=${id}:`, error);
        throw error;
      }
    } else {
      // Insert baru
      const insertPayload: Record<string, any> = {
        module_id: moduleId,
        question,
        options,
        correct_index: correctIndex,
        explanation: explanation || null,
        position: typeof position === "number" ? position : 1,
        is_active: isActive,
      };

      if (userId) {
        insertPayload.created_by = userId;
      }

      const { error } = await supabase.from("quiz_questions").insert(insertPayload);

      if (error) {
        console.error(`[QuizApi] Gagal menambah soal baru ke ${moduleId}:`, error);
        throw error;
      }
    }
  } catch (err) {
    console.error(`[QuizApi] Exception saat upsert soal:`, err);
    throw err;
  }
}

/**
 * Hapus soal dari database.
 */
export async function deleteQuizQuestion(id: string | number): Promise<void> {
  try {
    const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
    if (error) {
      console.error(`[QuizApi] Gagal menghapus soal id=${id}:`, error);
      throw error;
    }
  } catch (err) {
    console.error(`[QuizApi] Exception saat menghapus soal id=${id}:`, err);
    throw err;
  }
}

/**
 * Toggle status aktif / nonaktif soal.
 */
export async function toggleQuizQuestionActive(id: string | number, currentActive: boolean): Promise<boolean> {
  const newActive = !currentActive;
  try {
    const { error } = await supabase
      .from("quiz_questions")
      .update({ is_active: newActive })
      .eq("id", id);

    if (error) {
      console.error(`[QuizApi] Gagal mengubah status aktif soal id=${id}:`, error);
      throw error;
    }
    return newActive;
  } catch (err) {
    console.error(`[QuizApi] Exception saat toggle status aktif id=${id}:`, err);
    throw err;
  }
}

/**
 * Menukar posisi dua soal (reorder naik / turun).
 */
export async function swapQuizQuestionPositions(
  q1: { id: string | number; position: number },
  q2: { id: string | number; position: number }
): Promise<void> {
  try {
    const res1 = await supabase.from("quiz_questions").update({ position: q2.position }).eq("id", q1.id);
    if (res1.error) throw res1.error;

    const res2 = await supabase.from("quiz_questions").update({ position: q1.position }).eq("id", q2.id);
    if (res2.error) throw res2.error;
  } catch (err) {
    console.error(`[QuizApi] Gagal menukar urutan soal ${q1.id} <-> ${q2.id}:`, err);
    throw err;
  }
}
