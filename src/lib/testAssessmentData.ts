// Assessment data and synchronization for Pre-Test and Post-Test
// Pre-Test Bab 1: 5 Soal Diagnostik Bilangan Real
import { supabase } from "./supabaseClient";

export interface PretestOption {
  letter: "A" | "B" | "C" | "D" | "E";
  text: string;
}

export interface PretestQuestion {
  id: number;
  question: string;
  options: PretestOption[];
  correctAnswer: "A" | "B" | "C" | "D" | "E";
}

/**
 * 5 Soal Diagnostik Resmi Pre-Test Bab 1 (mod-aljabar-1)
 * KUNCI: 1=C, 2=C, 3=B, 4=D, 5=D
 */
export const PRETEST_QUESTIONS: PretestQuestion[] = [
  {
    id: 1,
    question: "Manakah pernyataan yang paling tepat mengenai bilangan real?",
    options: [
      { letter: "A", text: "Himpunan semua bilangan bulat positif dan negatif" },
      { letter: "B", text: "Himpunan semua bilangan yang dapat dinyatakan dalam bentuk pecahan" },
      { letter: "C", text: "Himpunan semua bilangan yang dapat digambarkan pada garis bilangan, termasuk bilangan rasional dan irasional" },
      { letter: "D", text: "Himpunan semua bilangan yang hanya dapat ditulis dalam bentuk desimal" },
      { letter: "E", text: "Himpunan semua bilangan yang tidak memiliki nilai negative" },
    ],
    correctAnswer: "C",
  },
  {
    id: 2,
    question: "Operasi a × b = b × a merupakan contoh sifat ...",
    options: [
      { letter: "A", text: "Asosiatif" },
      { letter: "B", text: "Distributif" },
      { letter: "C", text: "Komutatif" },
      { letter: "D", text: "Identitas" },
      { letter: "E", text: "Invers" },
    ],
    correctAnswer: "C",
  },
  {
    id: 3,
    question: "Operasi a + (b + c) = (a + b) + c menunjukkan bahwa ...",
    options: [
      { letter: "A", text: "Urutan bilangan dalam operasi dapat ditukar" },
      { letter: "B", text: "Pengelompokan bilangan dalam operasi dapat diubah tanpa mengubah hasil" },
      { letter: "C", text: "Perkalian dapat didistribusikan terhadap penjumlahan" },
      { letter: "D", text: "Setiap bilangan memiliki bilangan kebalikan" },
      { letter: "E", text: "Setiap bilangan jika ditambah nol tetap menghasilkan bilangan semula" },
    ],
    correctAnswer: "B",
  },
  {
    id: 4,
    question: "Operasi a × (b + c) = (a × b) + (a × c) merupakan sifat ...",
    options: [
      { letter: "A", text: "Komutatif" },
      { letter: "B", text: "Asosiatif" },
      { letter: "C", text: "Identitas" },
      { letter: "D", text: "Distributif" },
      { letter: "E", text: "Invers" },
    ],
    correctAnswer: "D",
  },
  {
    id: 5,
    question: "Manakah pernyataan yang paling tepat mengenai perbedaan bilangan dan angka?",
    options: [
      { letter: "A", text: "Bilangan dan angka merupakan istilah yang selalu memiliki arti sama" },
      { letter: "B", text: "Bilangan adalah simbol untuk menuliskan angka, sedangkan angka adalah nilai yang dihitung" },
      { letter: "C", text: "Angka merupakan konsep nilai, sedangkan bilangan hanya merupakan simbol" },
      { letter: "D", text: "Bilangan merupakan konsep atau nilai yang menyatakan kuantitas, sedangkan angka merupakan simbol yang digunakan untuk menuliskan bilangan" },
      { letter: "E", text: "Angka hanya digunakan untuk bilangan positif, sedangkan bilangan digunakan untuk bilangan negative" },
    ],
    correctAnswer: "D",
  },
];

export interface AssessmentResultRow {
  id?: string;
  user_id: string;
  module_id: string;
  kind: "pretest" | "posttest";
  score: number;
  correct_count: number;
  total_questions: number;
  answers: Record<string, string>; // e.g. {"1":"C","2":"C","3":"B","4":"D","5":"D"}
  created_at?: string;
}

/**
 * Fetch a user's assessment result (pretest / posttest) from database
 */
export async function fetchUserAssessmentResult(
  userId: string,
  moduleId: string = "mod-aljabar-1",
  kind: "pretest" | "posttest" = "pretest"
): Promise<AssessmentResultRow | null> {
  try {
    const { data, error } = await supabase
      .from("assessment_results")
      .select("id, user_id, module_id, kind, score, correct_count, total_questions, answers, created_at")
      .eq("user_id", userId)
      .eq("module_id", moduleId)
      .eq("kind", kind)
      .maybeSingle();

    if (error) {
      console.error(`[testAssessmentData] Gagal mengambil assessment_results (${kind}):`, {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      return null;
    }

    if (data) {
      const res: AssessmentResultRow = {
        id: data.id,
        user_id: data.user_id,
        module_id: data.module_id,
        kind: data.kind,
        score: Number(data.score) || 0,
        correct_count: Number(data.correct_count) || 0,
        total_questions: Number(data.total_questions) || 5,
        answers: (data.answers as Record<string, string>) || {},
        created_at: data.created_at,
      };

      // Cache locally
      try {
        localStorage.setItem(`sigma_assessment_db_${kind}_${moduleId}`, JSON.stringify(res));
      } catch {}

      return res;
    }
  } catch (err) {
    console.error(`[testAssessmentData] Exception saat fetchUserAssessmentResult:`, err);
  }
  return null;
}

/**
 * Save user pretest submission to public.assessment_results table
 */
export async function insertPretestAssessmentResult(params: {
  userId: string;
  moduleId?: string;
  answers: Record<number, string>; // { 1: "C", 2: "C", ... }
}): Promise<AssessmentResultRow> {
  const { userId, moduleId = "mod-aljabar-1", answers } = params;

  // 1. Calculate correct count and score
  let correctCount = 0;
  const cleanedAnswers: Record<string, string> = {};

  PRETEST_QUESTIONS.forEach((q) => {
    const userChoice = answers[q.id];
    if (userChoice) {
      cleanedAnswers[String(q.id)] = userChoice;
      if (userChoice === q.correctAnswer) {
        correctCount += 1;
      }
    }
  });

  const totalQuestions = PRETEST_QUESTIONS.length;
  // Skor = jumlah benar / 5 * 100 (tiap soal bernilai 20 poin)
  const score = Math.round((correctCount / totalQuestions) * 100);

  const payload = {
    user_id: userId,
    module_id: moduleId,
    kind: "pretest",
    score,
    correct_count: correctCount,
    total_questions: totalQuestions,
    answers: cleanedAnswers,
  };

  const { data, error } = await supabase
    .from("assessment_results")
    .insert(payload)
    .select("id, user_id, module_id, kind, score, correct_count, total_questions, answers, created_at")
    .single();

  if (error) {
    console.error("[testAssessmentData] Gagal menyimpan pre-test ke public.assessment_results:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    throw error;
  }

  const result: AssessmentResultRow = {
    id: data.id,
    user_id: data.user_id,
    module_id: data.module_id,
    kind: data.kind,
    score: data.score,
    correct_count: data.correct_count,
    total_questions: data.total_questions,
    answers: (data.answers as Record<string, string>) || {},
    created_at: data.created_at,
  };

  try {
    localStorage.setItem(`sigma_assessment_db_pretest_${moduleId}`, JSON.stringify(result));
  } catch {}

  window.dispatchEvent(
    new CustomEvent("sigma_assessment_updated", {
      detail: { moduleId, kind: "pretest", score: result.score },
    })
  );

  return result;
}

// ================= POST-TEST DATA & RETENTION (UNCHANGED) =================
export interface LikertStatement {
  id: number;
  label: string;
  entryId: string;
}

export interface SurveyAssessmentData {
  moduleId: string;
  type: "pretest" | "posttest";
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  googleFormViewUrl: string;
  googleFormSubmitUrl: string;
  entryIds: {
    nama: string;
    nomorAbsen: string;
    kelas: string;
  };
  kelasOptions: string[];
  scaleOptions: Array<{
    value: number;
    label: string;
    desc: string;
  }>;
  statements: LikertStatement[];
}

export interface StudentSurveyResult {
  moduleId: string;
  type: "pretest" | "posttest";
  nama: string;
  nomorAbsen: string;
  kelas: string;
  ratings: Record<number, number>;
  averageScore: number;
  percentIndex: number;
  completedAt: string;
  submittedToGoogleForm?: boolean;
}

export const POSTTEST_FORM_DATA: SurveyAssessmentData = {
  moduleId: "mod-aljabar-1",
  type: "posttest",
  title: "POST-TEST PERSEPSI DAN PENGALAMAN BELAJAR MATEMATIKA",
  subtitle: "Setelah Mengikuti Pembelajaran & Lolos Kuis Bab 1",
  badge: "SURVEI EVALUASI AKHIR",
  description:
    "Halo adik-adik manis, kembali lagi dengan kami! 👋 Setelah mengikuti simulasi SIGMA, kami ingin mengetahui kembali pandangan dan pengalaman kamu dalam belajar matematika. Pengisian ini bukan ujian dan bukan penilaian nilai matematika kamu. Jawablah setiap pertanyaan dengan jujur sesuai dengan pengalaman setelah belajar di platform.",
  googleFormViewUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLScsBqJaZfzL8LIdZeIzNz_IcxAniUQ_ifGn7yRORgnREJSM2g/viewform?usp=send_form",
  googleFormSubmitUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLScsBqJaZfzL8LIdZeIzNz_IcxAniUQ_ifGn7yRORgnREJSM2g/formResponse",
  entryIds: {
    nama: "entry.301457321",
    nomorAbsen: "entry.738417255",
    kelas: "entry.595517248",
  },
  kelasOptions: ["XI. 1", "XI. 2"],
  scaleOptions: [
    { value: 1, label: "Sangat Tidak Setuju", desc: "Sama sekali tidak sesuai dengan saya" },
    { value: 2, label: "Tidak Setuju", desc: "Kurang sesuai dengan kebiasaan saya" },
    { value: 3, label: "Netral", desc: "Cukup / Ragu-ragu" },
    { value: 4, label: "Setuju", desc: "Sesuai dengan apa yang saya rasakan" },
    { value: 5, label: "Sangat Setuju", desc: "Sangat mewakili pandangan & kebiasaan saya" },
  ],
  statements: [
    {
      id: 1,
      label: "Saya merasa siap mengerjakan soal matematika sebagai persiapan menghadapi TKA.",
      entryId: "entry.56295851",
    },
    {
      id: 2,
      label: "Saya lebih mudah memahami materi matematika jika materi, latihan soal, dan pembahasannya diberikan secara berurutan.",
      entryId: "entry.1498369270",
    },
    {
      id: 3,
      label: "Saya dapat mengetahui apakah saya sudah memahami materi matematika setelah mengerjakan latihan atau kuis.",
      entryId: "entry.1396828755",
    },
    {
      id: 4,
      label: "Jika hasil latihan atau kuis saya masih kurang, saya mau mempelajari kembali materi yang belum saya pahami.",
      entryId: "entry.1022874028",
    },
    {
      id: 5,
      label: "Saya lebih tertarik belajar matematika jika pembelajarannya menggunakan materi visual, latihan soal, kuis, dan aktivitas interaktif.",
      entryId: "entry.863152137",
    },
  ],
};

export function getSurveyAssessmentData(
  moduleId: string,
  type: "pretest" | "posttest"
): SurveyAssessmentData {
  return POSTTEST_FORM_DATA;
}

export function saveSurveyResult(result: StudentSurveyResult): void {
  const key = `sigma_survey_${result.type}_${result.moduleId}`;
  localStorage.setItem(key, JSON.stringify(result));

  localStorage.setItem(
    `sigma_assessment_${result.type}_${result.moduleId}`,
    JSON.stringify({
      moduleId: result.moduleId,
      type: result.type,
      score: result.percentIndex,
      correctCount: Object.keys(result.ratings).length,
      totalQuestions: 5,
      selectedAnswers: result.ratings,
      completedAt: result.completedAt,
    })
  );

  window.dispatchEvent(
    new CustomEvent("sigma_assessment_updated", {
      detail: { moduleId: result.moduleId, type: result.type, score: result.percentIndex },
    })
  );
}

export function getSurveyResult(
  moduleId: string,
  type: "pretest" | "posttest"
): StudentSurveyResult | null {
  try {
    const raw = localStorage.getItem(`sigma_survey_${type}_${moduleId}`);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error("Error loading survey result:", err);
  }
  return null;
}

export function getAssessmentResult(
  moduleId: string,
  type: "pretest" | "posttest"
): { score: number; completedAt: string } | null {
  try {
    const dbRaw = localStorage.getItem(`sigma_assessment_db_${type}_${moduleId}`);
    if (dbRaw) {
      const parsed = JSON.parse(dbRaw);
      return { score: parsed.score, completedAt: parsed.created_at || new Date().toISOString() };
    }
  } catch {}

  const survey = getSurveyResult(moduleId, type);
  if (survey) {
    return {
      score: survey.percentIndex,
      completedAt: survey.completedAt,
    };
  }
  try {
    const raw = localStorage.getItem(`sigma_assessment_${type}_${moduleId}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export interface PerceptionGainData {
  preIndex: number;
  postIndex: number;
  gainPoints: number;
  nGain: number;
  category: "Peningkatan Tinggi" | "Peningkatan Sedang" | "Stabil / Cukup" | "Belum Dihitung";
}

export function calculatePerceptionGain(preIndex: number, postIndex: number): PerceptionGainData {
  const diff = postIndex - preIndex;
  const maxPossible = 100 - preIndex;
  const nGain = maxPossible > 0 ? Math.max(0, Math.min(1, diff / maxPossible)) : 1.0;

  let category: "Peningkatan Tinggi" | "Peningkatan Sedang" | "Stabil / Cukup" = "Stabil / Cukup";
  if (diff >= 15 || nGain >= 0.5) {
    category = "Peningkatan Tinggi";
  } else if (diff >= 5 || nGain >= 0.2) {
    category = "Peningkatan Sedang";
  }

  return {
    preIndex,
    postIndex,
    gainPoints: diff,
    nGain: Math.round(nGain * 100) / 100,
    category,
  };
}

export function calculateNGain(preScore: number, postScore: number) {
  const p = calculatePerceptionGain(preScore, postScore);
  return {
    preScore,
    postScore,
    gainScore: p.gainPoints,
    nGain: p.nGain,
    category: p.category,
  };
}

export async function submitToGoogleForm(
  data: SurveyAssessmentData,
  nama: string,
  nomorAbsen: string,
  kelas: string,
  ratings: Record<number, number>
): Promise<boolean> {
  try {
    const formData = new URLSearchParams();
    formData.append(data.entryIds.nama, nama);
    formData.append(data.entryIds.nomorAbsen, nomorAbsen);
    formData.append(data.entryIds.kelas, kelas);

    data.statements.forEach((stmt) => {
      const val = ratings[stmt.id];
      if (val !== undefined) {
        const option = data.scaleOptions.find((opt) => opt.value === val);
        if (option) {
          formData.append(stmt.entryId, option.label);
        }
      }
    });

    await fetch(data.googleFormSubmitUrl, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    return true;
  } catch (err) {
    console.warn("Background submission to Google Form notice:", err);
    return false;
  }
}
