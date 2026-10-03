// Assessment data and synchronization for Pre-Test and Post-Test
// Matched directly to the official Google Forms for MA Darunnajah 9

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
  ratings: Record<number, number>; // statementId (1..5) -> scaleValue (1..5)
  averageScore: number; // 1 to 5 scale
  percentIndex: number; // 0 to 100 scale
  completedAt: string;
  submittedToGoogleForm?: boolean;
}

export const PRETEST_FORM_DATA: SurveyAssessmentData = {
  moduleId: "mod-aljabar-1",
  type: "pretest",
  title: "PRE-TEST PERSEPSI DAN PENGALAMAN BELAJAR MATEMATIKA",
  subtitle: "Sebelum Memulai Pembelajaran & Modul Bab 1",
  badge: "SURVEI KESIAPAN AWAL",
  description:
    "Halo, adik-adik manis! 👋 Sebelum memulai simulasi SIGMA, kami ingin mengetahui bagaimana pandangan dan pengalaman kamu dalam belajar matematika saat ini. Pengisian ini bukan ujian dan bukan penilaian terhadap nilai matematika kamu. Tidak ada jawaban benar atau salah. Jawablah dengan jujur sesuai dengan pendapat dan kebiasaan kamu sendiri.",
  googleFormViewUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSerjfBME1a6seLNukLyK_haOvXO_CJC-nJHmfN5W038Yv7LgQ/viewform",
  googleFormSubmitUrl:
    "https://docs.google.com/forms/d/e/1FAIpQLSerjfBME1a6seLNukLyK_haOvXO_CJC-nJHmfN5W038Yv7LgQ/formResponse",
  entryIds: {
    nama: "entry.1719406101",
    nomorAbsen: "entry.1867000390",
    kelas: "entry.1006304875",
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
      entryId: "entry.1621123050",
    },
    {
      id: 2,
      label: "Saya lebih mudah memahami materi matematika jika materi, latihan soal, dan pembahasannya diberikan secara berurutan.",
      entryId: "entry.1266791216",
    },
    {
      id: 3,
      label: "Saya dapat mengetahui apakah saya sudah memahami materi matematika setelah mengerjakan latihan atau kuis.",
      entryId: "entry.86060728",
    },
    {
      id: 4,
      label: "Jika hasil latihan atau kuis saya masih kurang, saya mau mempelajari kembali materi yang belum saya pahami.",
      entryId: "entry.83925857",
    },
    {
      id: 5,
      label: "Saya lebih tertarik belajar matematika jika pembelajarannya menggunakan materi visual, latihan soal, kuis, dan aktivitas interaktif.",
      entryId: "entry.1158564614",
    },
  ],
};

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
  if (type === "pretest") {
    return PRETEST_FORM_DATA;
  }
  return POSTTEST_FORM_DATA;
}

export function saveSurveyResult(result: StudentSurveyResult): void {
  const key = `sigma_survey_${result.type}_${result.moduleId}`;
  localStorage.setItem(key, JSON.stringify(result));

  // Legacy key compatibility so other components react
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
  } catch {
    // ignore
  }
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

/**
 * Submits the survey response directly to the Google Form in the background.
 */
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

    // Send using fetch with no-cors so browser doesn't block cross-origin Google Forms
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
