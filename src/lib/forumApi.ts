import { supabase } from "./supabaseClient";

export interface ThreadWithStats {
  id: string;
  author_id: string;
  author_name: string;
  author_class?: string | null;
  author_avatar?: string | null;
  author_role: "student" | "teacher";
  category: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_answered: boolean;
  created_at: string;
  replies_count: number;
  likes_count: number;
}

export interface ReplyWithAuthor {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  is_verified: boolean;
  created_at: string;
  author?: {
    id: string;
    full_name: string;
    class_name?: string | null;
    avatar_url?: string | null;
    role: "student" | "teacher";
  };
}

export const FORUM_CATEGORIES = [
  "Semua",
  "Aljabar",
  "Fungsi & Kalkulus",
  "Geometri",
  "Trigonometri",
  "Statistika & Peluang",
  "Umum / UTBK",
] as const;

/**
 * Format timestamp ISO menjadi format waktu relatif (misal: "5 menit lalu")
 */
export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return "-";
  const now = new Date();
  const past = new Date(dateString);
  const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffSec < 60) return "Baru saja";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} hari lalu`;

  return past.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export const FORUM_PAGE_SIZE = 20;

export interface ListThreadsResponse {
  threads: ThreadWithStats[];
  hasMore: boolean;
}

/**
 * Escape karakter khusus PostgREST filter (%, ,, (, )) untuk pencarian server-side aman
 */
export function escapeSearchTerm(term: string): string {
  return term
    .replace(/\\/g, "\\\\")
    .replace(/%/g, "\\%")
    .replace(/,/g, "\\,")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/**
 * Ambil daftar threads dengan pagination server-side (20 per halaman) dan pencarian di server
 */
export async function listThreads(
  category?: string,
  page: number = 0,
  search?: string
): Promise<ListThreadsResponse> {
  let query = supabase
    .from("threads_with_stats")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (category && category !== "Semua") {
    query = query.eq("category", category);
  }

  if (search && search.trim()) {
    const cleanSearch = escapeSearchTerm(search.trim());
    query = query.or(`title.ilike.%${cleanSearch}%,content.ilike.%${cleanSearch}%`);
  }

  const from = Math.max(0, page) * FORUM_PAGE_SIZE;
  const to = from + FORUM_PAGE_SIZE; // Minta 21 baris untuk mendeteksi hasMore
  query = query.range(from, to);

  const { data, error } = await query;
  if (error) {
    console.error("[forumApi.listThreads] Error:", error);
    throw new Error(`Gagal memuat daftar topik: ${error.message}`);
  }

  const items = (data as ThreadWithStats[]) || [];
  const hasMore = items.length > FORUM_PAGE_SIZE;
  const threads = hasMore ? items.slice(0, FORUM_PAGE_SIZE) : items;

  return { threads, hasMore };
}

/**
 * Ambil detail thread tunggal berdasarkan ID
 */
export async function getThread(id: string): Promise<ThreadWithStats | null> {
  const { data, error } = await supabase
    .from("threads_with_stats")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[forumApi.getThread] Error:", error);
    throw new Error(`Gagal memuat detail topik: ${error.message}`);
  }

  return data as ThreadWithStats | null;
}

/**
 * Buat thread baru
 */
export async function createThread(params: {
  category: string;
  title: string;
  content: string;
}): Promise<ThreadWithStats> {
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr || !sessionData?.session?.user) {
    throw new Error("Anda harus masuk terlebih dahulu untuk membuat topik.");
  }
  const userId = sessionData.session.user.id;

  const trimmedTitle = params.title.trim();
  const trimmedContent = params.content.trim();

  if (trimmedTitle.length < 5 || trimmedTitle.length > 150) {
    throw new Error("Judul topik harus antara 5 hingga 150 karakter.");
  }
  if (trimmedContent.length < 1 || trimmedContent.length > 5000) {
    throw new Error("Isi pertanyaan tidak boleh kosong (maksimal 5000 karakter).");
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("threads")
    .insert({
      author_id: userId,
      category: params.category,
      title: trimmedTitle,
      content: trimmedContent,
      is_pinned: false,
      is_answered: false,
    })
    .select("id")
    .single();

  if (insertErr || !inserted) {
    console.error("[forumApi.createThread] Error insert:", insertErr);
    throw new Error(insertErr?.message || "Gagal membuat topik diskusi baru.");
  }

  const created = await getThread(inserted.id);
  if (!created) {
    throw new Error("Topik berhasil dibuat namun gagal memuat data tampilan.");
  }
  return created;
}

/**
 * Ambil daftar balasan pada thread tertentu
 */
export async function listReplies(threadId: string): Promise<ReplyWithAuthor[]> {
  const { data, error } = await supabase
    .from("replies")
    .select(`
      id,
      thread_id,
      author_id,
      content,
      is_verified,
      created_at,
      author:profiles!replies_author_id_fkey(
        id,
        full_name,
        class_name,
        avatar_url,
        role
      )
    `)
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[forumApi.listReplies] Error:", error);
    throw new Error(`Gagal memuat balasan diskusi: ${error.message}`);
  }

  return (data as any[]) || [];
}

/**
 * Buat balasan baru pada thread
 */
export async function createReply(params: {
  thread_id: string;
  content: string;
}): Promise<ReplyWithAuthor> {
  const { data: sessionData, error: sessionErr } = await supabase.auth.getSession();
  if (sessionErr || !sessionData?.session?.user) {
    throw new Error("Anda harus masuk terlebih dahulu untuk membalas diskusi.");
  }
  const userId = sessionData.session.user.id;

  const trimmedContent = params.content.trim();
  if (trimmedContent.length < 1 || trimmedContent.length > 5000) {
    throw new Error("Isi balasan tidak boleh kosong (maksimal 5000 karakter).");
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("replies")
    .insert({
      thread_id: params.thread_id,
      author_id: userId,
      content: trimmedContent,
      is_verified: false,
    })
    .select(`
      id,
      thread_id,
      author_id,
      content,
      is_verified,
      created_at,
      author:profiles!replies_author_id_fkey(
        id,
        full_name,
        class_name,
        avatar_url,
        role
      )
    `)
    .single();

  if (insertErr || !inserted) {
    console.error("[forumApi.createReply] Error:", insertErr);
    throw new Error(insertErr?.message || "Gagal mengirim balasan.");
  }

  return inserted as any;
}

/**
 * Periksa apakah user saat ini menyukai thread
 */
export async function checkUserLiked(threadId: string, userId: string): Promise<boolean> {
  if (!userId) return false;
  const { data, error } = await supabase
    .from("thread_likes")
    .select("thread_id")
    .eq("thread_id", threadId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}

/**
 * Toggle like/unlike pada thread langsung dengan insert tanpa cek-lalu-insert.
 * Jika error code 23505 (unique_violation / sudah like), lakukan delete (unlike).
 */
export async function toggleLike(
  threadId: string,
  userId: string
): Promise<{ liked: boolean }> {
  if (!userId) throw new Error("Anda harus masuk untuk menyukai topik.");

  // Coba insert langsung
  const { error: insertError } = await supabase.from("thread_likes").insert({
    thread_id: threadId,
    user_id: userId,
  });

  if (!insertError) {
    return { liked: true };
  }

  // Jika error code 23505 (sudah like), berarti aksi saat ini adalah unlike (delete)
  if (
    insertError.code === "23505" ||
    insertError.message?.includes("23505") ||
    insertError.message?.toLowerCase().includes("duplicate key")
  ) {
    const { error: deleteError } = await supabase
      .from("thread_likes")
      .delete()
      .eq("thread_id", threadId)
      .eq("user_id", userId);

    if (deleteError) {
      console.error("[forumApi.toggleLike] Error delete like:", deleteError);
      throw new Error(`Gagal menghapus like: ${deleteError.message}`);
    }
    return { liked: false };
  }

  console.error("[forumApi.toggleLike] Error insert like:", insertError);
  throw new Error(`Gagal memberikan like: ${insertError.message}`);
}

/**
 * Sematkan/Lepas pin thread (Hanya guru)
 */
export async function setPinned(threadId: string, isPinned: boolean): Promise<void> {
  const { error } = await supabase
    .from("threads")
    .update({ is_pinned: isPinned })
    .eq("id", threadId);

  if (error) {
    console.error("[forumApi.setPinned] Error:", error);
    throw new Error(`Gagal mengubah status pin: ${error.message}`);
  }
}

/**
 * Tandai thread sudah terjawab / belum (Guru atau sistem)
 */
export async function setAnswered(threadId: string, isAnswered: boolean): Promise<void> {
  const { error } = await supabase
    .from("threads")
    .update({ is_answered: isAnswered })
    .eq("id", threadId);

  if (error) {
    console.error("[forumApi.setAnswered] Error:", error);
    throw new Error(`Gagal menandai status terjawab: ${error.message}`);
  }
}

/**
 * Verifikasi solusi balasan (Hanya guru)
 */
export async function setReplyVerified(replyId: string, isVerified: boolean): Promise<void> {
  const { error } = await supabase
    .from("replies")
    .update({ is_verified: isVerified })
    .eq("id", replyId);

  if (error) {
    console.error("[forumApi.setReplyVerified] Error:", error);
    throw new Error(`Gagal memverifikasi balasan: ${error.message}`);
  }
}

/**
 * Hapus thread (Penulis sendiri atau Guru)
 */
export async function deleteThread(threadId: string): Promise<void> {
  const { error } = await supabase.from("threads").delete().eq("id", threadId);
  if (error) {
    console.error("[forumApi.deleteThread] Error:", error);
    throw new Error(`Gagal menghapus topik diskusi: ${error.message}`);
  }
}

/**
 * Hapus balasan (Penulis sendiri atau Guru)
 */
export async function deleteReply(replyId: string): Promise<void> {
  const { error } = await supabase.from("replies").delete().eq("id", replyId);
  if (error) {
    console.error("[forumApi.deleteReply] Error:", error);
    throw new Error(`Gagal menghapus balasan: ${error.message}`);
  }
}
