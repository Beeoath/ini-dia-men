// Service for storing and managing custom PDF files and module materials in Supabase Storage and database
import { supabase } from "./supabase";
import { MODULES } from "./sigmaData";

export interface CustomMaterialData {
  moduleId: string;
  title: string;
  description: string;
  durationMinutes: number;
  pageCount?: number;
  pdfFileName?: string;
  pdfFileSize?: number;
  externalPdfUrl?: string;
  updatedAt: number;
  isCustomPdf: boolean;
}

/**
 * Default fallback HTML slide modules for each chapter.
 * Rule: Never use /modul_peluang.html for any module other than mod-stat-1!
 */
export function getDefaultModulePdfUrl(moduleId: string): string {
  switch (moduleId) {
    case "mod-aljabar-1":
      return "/modul_bilangan.html";
    case "mod-aljabar-2":
      return "/modul_aljabar.html";
    case "mod-geometri-1":
      return "/modul_geometri.html";
    case "mod-trigo-1":
      return "/modul_trigonometri.html";
    case "mod-stat-1":
      return "/modul_peluang.html";
    default:
      return "/modul_bilangan.html";
  }
}

/**
 * Get district ID for a given module ID
 */
export function getDistrictIdForModule(moduleId: string): number {
  switch (moduleId) {
    case "mod-stat-1":
      return 5;
    case "mod-trigo-1":
      return 4;
    case "mod-geometri-1":
      return 3;
    case "mod-aljabar-2":
      return 2;
    case "mod-aljabar-1":
    default:
      return 1;
  }
}

/**
 * Sanitize filename for Supabase storage:
 * - Strip existing .pdf extension(s) and fix duplicate (.pdf.pdf)
 * - Replace whitespace and special characters with hyphens/underscores
 * - Append clean .pdf
 */
export function sanitizeStorageFileName(rawName: string): string {
  const withoutExt = rawName.replace(/(\.pdf)+$/gi, "").trim();
  const safeBase = withoutExt
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_\-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");

  const finalName = safeBase.length > 0 ? safeBase : "modul";
  return `${finalName}.pdf`;
}

export interface SaveMaterialParams {
  moduleId: string;
  title: string;
  description: string;
  durationMinutes: number;
  pageCount?: number;
  file?: File | null;
  externalPdfUrl?: string;
  existingFileName?: string;
  existingFileSize?: number;
  onProgress?: (percent: number) => void;
  onStatus?: (status: string) => void;
}

/**
 * Upload PDF to Supabase Storage bucket 'materials' and persist row in public.module_materials
 * Do NOT save row if storage upload fails!
 */
export async function saveCustomMaterial(params: SaveMaterialParams): Promise<void> {
  const {
    moduleId,
    title,
    description,
    durationMinutes,
    pageCount = 14,
    file,
    externalPdfUrl,
    existingFileName,
    existingFileSize,
    onProgress,
    onStatus,
  } = params;

  let publicUrl: string | undefined = undefined;
  let savedFileName: string | undefined = undefined;
  let savedFileSize: number | undefined = undefined;
  let isCustom = false;

  // 1. If a new File is provided, upload it to bucket "materials"
  if (file) {
    // Validate: only .pdf and max 50 MB
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("Format file harus berupa dokumen PDF (.pdf)");
    }
    if (file.size > 50 * 1024 * 1024) {
      throw new Error("Ukuran file melebihi batas maksimum 50 MB");
    }

    onStatus?.("Menyiapkan berkas PDF untuk diunggah...");
    onProgress?.(10);

    const timestamp = Date.now();
    const safeFileName = sanitizeStorageFileName(file.name);
    const storagePath = `${moduleId}/${timestamp}-${safeFileName}`;

    onStatus?.("Mengunggah berkas ke Supabase Storage (bucket materials)...");
    onProgress?.(35);

    const { error: uploadError } = await supabase.storage
      .from("materials")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: "application/pdf",
      });

    if (uploadError) {
      console.error("[pdfStorage] Gagal mengunggah file ke bucket 'materials':", {
        code: (uploadError as any)?.statusCode || (uploadError as any)?.code || "STORAGE_UPLOAD_ERROR",
        message: uploadError.message,
        details: uploadError,
      });
      throw new Error(`Gagal mengunggah file PDF: ${uploadError.message}`);
    }

    onProgress?.(75);
    onStatus?.("Mendapatkan tautan publik dokumen...");

    const { data: urlData } = supabase.storage
      .from("materials")
      .getPublicUrl(storagePath);

    if (!urlData || !urlData.publicUrl) {
      throw new Error("Gagal memperoleh URL publik dokumen dari Supabase Storage");
    }

    publicUrl = urlData.publicUrl;
    savedFileName = file.name;
    savedFileSize = file.size;
    isCustom = true;
  } else if (externalPdfUrl && externalPdfUrl.trim()) {
    // External URL provided
    publicUrl = externalPdfUrl.trim();
    savedFileName = existingFileName || "Dokumen PDF Online";
    savedFileSize = existingFileSize;
    isCustom = true;
  } else if (existingFileName) {
    // Retaining existing custom PDF
    savedFileName = existingFileName;
    savedFileSize = existingFileSize;
    isCustom = true;
  }

  // 2. Persist to public.module_materials
  onStatus?.("Menyimpan konfigurasi modul ke database...");
  onProgress?.(90);

  const districtId = getDistrictIdForModule(moduleId);
  const finalPdfUrl = publicUrl || getDefaultModulePdfUrl(moduleId);

  const payload = {
    module_id: moduleId,
    district_id: districtId,
    title: title.trim(),
    description: description.trim(),
    duration_minutes: durationMinutes,
    page_count: pageCount,
    pdf_file_name: isCustom ? savedFileName : null,
    pdf_url: finalPdfUrl,
    is_custom_pdf: isCustom,
    updated_at: new Date().toISOString(),
  };

  const { error: dbError } = await supabase
    .from("module_materials")
    .upsert(payload);

  if (dbError) {
    console.error("[pdfStorage] Gagal menyimpan ke public.module_materials:", {
      code: dbError.code,
      message: dbError.message,
      details: dbError.details,
      hint: dbError.hint,
    });
    throw new Error(`Gagal menyimpan data modul ke database: ${dbError.message}`);
  }

  onProgress?.(100);
  onStatus?.("Selesai!");

  // Keep localStorage metadata in sync for instant sync
  try {
    const lightMeta = {
      moduleId,
      title: title.trim(),
      description: description.trim(),
      durationMinutes,
      pageCount,
      pdfFileName: savedFileName,
      pdfFileSize: savedFileSize,
      externalPdfUrl: finalPdfUrl,
      isCustomPdf: isCustom,
      updatedAt: Date.now(),
    };
    localStorage.setItem(`sigma_material_meta_${moduleId}`, JSON.stringify(lightMeta));
  } catch (e) {
    console.warn("[pdfStorage] LocalStorage sync warning:", e);
  }

  window.dispatchEvent(
    new CustomEvent("sigma_material_updated", {
      detail: { moduleId },
    })
  );
}

/**
 * Delete custom PDF from bucket 'materials' and reset module_materials row to default
 */
export async function deleteCustomMaterialPdf(moduleId: string): Promise<void> {
  // 1. Remove all files inside folder `${moduleId}` in bucket "materials"
  try {
    const { data: files, error: listError } = await supabase.storage
      .from("materials")
      .list(moduleId);

    if (listError) {
      console.warn("[pdfStorage] Gagal memeriksa berkas di storage:", listError);
    } else if (files && files.length > 0) {
      const pathsToRemove = files.map((f) => `${moduleId}/${f.name}`);
      const { error: removeError } = await supabase.storage
        .from("materials")
        .remove(pathsToRemove);

      if (removeError) {
        console.error("[pdfStorage] Gagal menghapus file dari storage bucket 'materials':", {
          code: (removeError as any)?.statusCode || (removeError as any)?.code,
          message: removeError.message,
          details: removeError,
        });
      }
    }
  } catch (err) {
    console.error("[pdfStorage] Exception saat menghapus berkas storage:", err);
  }

  // 2. Set module_materials row: is_custom_pdf = false, pdf_url = default URL
  const defaultUrl = getDefaultModulePdfUrl(moduleId);
  const districtId = getDistrictIdForModule(moduleId);
  const modDef = MODULES.find((m) => m.id === moduleId);

  const { error: updateError } = await supabase
    .from("module_materials")
    .upsert({
      module_id: moduleId,
      district_id: districtId,
      title: modDef?.title || "Modul Pembelajaran",
      description: modDef?.description || "",
      duration_minutes: modDef?.durationMinutes || 20,
      page_count: modDef?.slides?.length || 14,
      pdf_file_name: null,
      pdf_url: defaultUrl,
      is_custom_pdf: false,
      updated_at: new Date().toISOString(),
    });

  if (updateError) {
    console.error("[pdfStorage] Gagal mereset module_materials:", {
      code: updateError.code,
      message: updateError.message,
      details: updateError.details,
      hint: updateError.hint,
    });
    throw new Error(`Gagal mereset data modul di database: ${updateError.message}`);
  }

  // 3. Clear localStorage cache
  try {
    localStorage.removeItem(`sigma_material_meta_${moduleId}`);
  } catch {}

  window.dispatchEvent(
    new CustomEvent("sigma_material_updated", {
      detail: { moduleId },
    })
  );
}

/**
 * Fetch latest material row for a module from public.module_materials
 */
export async function getModuleMaterial(moduleId: string): Promise<CustomMaterialData | null> {
  try {
    const { data, error } = await supabase
      .from("module_materials")
      .select("module_id, district_id, title, description, duration_minutes, page_count, pdf_file_name, pdf_url, is_custom_pdf, updated_at")
      .eq("module_id", moduleId)
      .maybeSingle();

    if (error) {
      console.error(`[pdfStorage] Gagal mengambil module_materials untuk ${moduleId}:`, {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return getMaterialMetaSync(moduleId) as CustomMaterialData | null;
    }

    if (data) {
      const isCustom = Boolean(data.is_custom_pdf);
      const result: CustomMaterialData = {
        moduleId: data.module_id,
        title: data.title,
        description: data.description,
        durationMinutes: data.duration_minutes,
        pageCount: data.page_count,
        pdfFileName: data.pdf_file_name || undefined,
        externalPdfUrl: data.pdf_url,
        isCustomPdf: isCustom,
        updatedAt: data.updated_at ? new Date(data.updated_at).getTime() : Date.now(),
      };

      try {
        localStorage.setItem(`sigma_material_meta_${moduleId}`, JSON.stringify(result));
      } catch {}

      return result;
    }
  } catch (err) {
    console.error("[pdfStorage] Exception saat membaca module_materials:", err);
  }

  return getMaterialMetaSync(moduleId) as CustomMaterialData | null;
}

/**
 * Backward compatibility alias for getModuleMaterial
 */
export const getCustomMaterial = getModuleMaterial;

/**
 * Fetch all module_materials rows for teacher overview
 */
export async function getAllModuleMaterials(): Promise<Record<string, CustomMaterialData>> {
  const result: Record<string, CustomMaterialData> = {};
  try {
    const { data, error } = await supabase
      .from("module_materials")
      .select("module_id, district_id, title, description, duration_minutes, page_count, pdf_file_name, pdf_url, is_custom_pdf, updated_at");

    if (error) {
      console.error("[pdfStorage] Gagal mengambil daftar module_materials:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return result;
    }

    if (data) {
      for (const row of data) {
        const item: CustomMaterialData = {
          moduleId: row.module_id,
          title: row.title,
          description: row.description,
          durationMinutes: row.duration_minutes,
          pageCount: row.page_count,
          pdfFileName: row.pdf_file_name || undefined,
          externalPdfUrl: row.pdf_url,
          isCustomPdf: Boolean(row.is_custom_pdf),
          updatedAt: row.updated_at ? new Date(row.updated_at).getTime() : Date.now(),
        };
        result[row.module_id] = item;
        try {
          localStorage.setItem(`sigma_material_meta_${row.module_id}`, JSON.stringify(item));
        } catch {}
      }
    }
  } catch (err) {
    console.error("[pdfStorage] Exception saat memuat all module_materials:", err);
  }
  return result;
}

/**
 * Read locally cached metadata from localStorage for initial synchronous render
 */
export function getMaterialMetaSync(moduleId: string): Partial<CustomMaterialData> | null {
  try {
    const raw = localStorage.getItem(`sigma_material_meta_${moduleId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("[pdfStorage] Gagal membaca metadata lokal:", e);
  }

  const modDef = MODULES.find((m) => m.id === moduleId);
  if (modDef) {
    return {
      moduleId,
      title: modDef.title,
      description: modDef.description,
      durationMinutes: modDef.durationMinutes,
      pageCount: modDef.slides?.length || 14,
      externalPdfUrl: getDefaultModulePdfUrl(moduleId),
      isCustomPdf: false,
    };
  }

  return null;
}

/**
 * Get active PDF URL for students:
 * If is_custom_pdf is true and pdf_url is set, return custom PDF URL.
 * Otherwise, return default module URL.
 */
export async function getModulePdfUrl(moduleId: string, defaultUrl: string): Promise<{
  url: string;
  isCustom: boolean;
  fileName?: string;
  data?: CustomMaterialData | null;
}> {
  const material = await getModuleMaterial(moduleId);
  const fallbackUrl = getDefaultModulePdfUrl(moduleId);
  const effectiveDefaultUrl = defaultUrl || fallbackUrl;

  if (material && material.isCustomPdf && material.externalPdfUrl) {
    return {
      url: material.externalPdfUrl,
      isCustom: true,
      fileName: material.pdfFileName || "Dokumen PDF Guru",
      data: material,
    };
  }

  return {
    url: effectiveDefaultUrl,
    isCustom: false,
    fileName: undefined,
    data: material,
  };
}

/**
 * Reset module back to default (alias for deleteCustomMaterialPdf)
 */
export const resetModuleToDefault = deleteCustomMaterialPdf;
