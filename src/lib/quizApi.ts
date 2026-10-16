import { supabase } from "./supabaseClient";
import { QuizQuestion } from "./sigmaData";

export interface QuizQuestionRow {
  id: string;
  module_id: string;
  order_index: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_at?: string | null;
}

/**
 * Mengambil soal aktif untuk siswa dari tabel quiz_questions.
 * Kolom yang diminta: id, module_id, order_index, question, options, correct_answer, explanation, is_active.
 * Diurutkan berdasarkan order_index ASC.
 * Jika kosong atau terjadi kesalahan, menggunakan fallback soal bawaan di kode.
 */
export async function getStudentQuizQuestions(
  moduleId: string,
  fallbackQuestions: QuizQuestion[] = []
): Promise<QuizQuestion[]> {
  try {
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("id, module_id, order_index, question, options, correct_answer, explanation, is_active")
      .eq("module_id", moduleId)
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error(`[QuizApi] Gagal memuat soal kuis siswa untuk modul ${moduleId}:`, error);
      return fallbackQuestions;
    }

    if (!data || data.length === 0) {
      return fallbackQuestions;
    }

    return data.map((row, idx) => {
      const optionsArray: string[] = Array.isArray(row.options)
        ? row.options
        : typeof row.options === "string"
        ? [row.options]
        : [];

      return {
        id: idx + 1,
        question: row.question || "",
        options: optionsArray,
        correctAnswer: typeof row.correct_answer === "number" ? row.correct_answer : 0,
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
 * Kolom: id, module_id, order_index, question, options, correct_answer, explanation, is_active, created_by, created_at.
 * Diurutkan berdasarkan order_index ASC.
 */
export async function getTeacherQuizQuestions(moduleId: string): Promise<QuizQuestionRow[]> {
  try {
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("id, module_id, order_index, question, options, correct_answer, explanation, is_active, created_by, created_at")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: true });

    if (error) {
      console.error(`[QuizApi] Gagal memuat daftar soal guru untuk modul ${moduleId}:`, error);
      throw error;
    }

    if (!data) return [];

    return data.map((row) => ({
      ...row,
      options: Array.isArray(row.options) ? row.options : [],
    }));
  } catch (err) {
    console.error(`[QuizApi] Exception saat mengambil soal guru untuk ${moduleId}:`, err);
    throw err;
  }
}

/**
 * Impor soal bawaan di kode ke tabel quiz_questions untuk modul terkait.
 * Tidak mengirim kolom id (uuid dibuat otomatis oleh database).
 * Mengisi created_by dengan id user yang login.
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
      order_index: idx + 1,
      question: q.question,
      options: q.options,
      correct_answer: q.correctAnswer,
      explanation: q.explanation || null,
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
 * Saat insert, id TIDAK disertakan (dibuat otomatis oleh database).
 * created_by diisi dengan id user guru yang login.
 */
export async function upsertQuizQuestion(params: {
  id?: string | null;
  moduleId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
  isActive?: boolean;
  orderIndex?: number;
  userId?: string;
}): Promise<void> {
  const { id, moduleId, question, options, correctAnswer, explanation, isActive = true, orderIndex, userId } = params;

  try {
    if (id) {
      // Update data yang sudah ada
      const { error } = await supabase
        .from("quiz_questions")
        .update({
          question,
          options,
          correct_answer: correctAnswer,
          explanation: explanation || null,
          is_active: isActive,
        })
        .eq("id", id);

      if (error) {
        console.error(`[QuizApi] Gagal memperbarui soal id=${id}:`, error);
        throw error;
      }
    } else {
      // Insert baru tanpa menyertakan kolom id
      const insertPayload: {
        module_id: string;
        order_index: number;
        question: string;
        options: string[];
        correct_answer: number;
        explanation: string | null;
        is_active: boolean;
        created_by?: string;
      } = {
        module_id: moduleId,
        order_index: typeof orderIndex === "number" ? orderIndex : 1,
        question,
        options,
        correct_answer: correctAnswer,
        explanation: explanation || null,
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
export async function deleteQuizQuestion(id: string): Promise<void> {
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
export async function toggleQuizQuestionActive(id: string, currentActive: boolean): Promise<boolean> {
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
 * Menukar urutan (order_index) dua soal (naik / turun).
 */
export async function swapQuizQuestionOrders(
  q1: { id: string; order_index: number },
  q2: { id: string; order_index: number }
): Promise<void> {
  try {
    const res1 = await supabase.from("quiz_questions").update({ order_index: q2.order_index }).eq("id", q1.id);
    if (res1.error) throw res1.error;

    const res2 = await supabase.from("quiz_questions").update({ order_index: q1.order_index }).eq("id", q2.id);
    if (res2.error) throw res2.error;
  } catch (err) {
    console.error(`[QuizApi] Gagal menukar urutan soal ${q1.id} <-> ${q2.id}:`, err);
    throw err;
  }
}
