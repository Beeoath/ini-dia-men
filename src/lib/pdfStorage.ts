// Service for storing and managing custom PDF files and module materials
// Uses browser IndexedDB for robust large file storage (up to hundreds of MBs) and syncs with Supabase
import { supabase } from "./supabase";

export interface CustomMaterialData {
  moduleId: string;
  title: string;
  description: string;
  durationMinutes: number;
  pageCount?: number;
  pdfFileName?: string;
  pdfFileSize?: number;
  externalPdfUrl?: string;
  pdfBlob?: Blob;
  updatedAt: number;
  isCustomPdf: boolean;
}

const DB_NAME = "sigma_materials_db";
const STORE_NAME = "module_files";
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;
const blobUrlCache = new Map<string, string>();

// Default seeded materials
const SEED_MATERIALS: Record<string, Partial<CustomMaterialData>> = {
  "mod-stat-1": {
    moduleId: "mod-stat-1",
    title: "BAB 5: DATA DAN PELUANG (Statistika & Peluang)",
    description:
      "Menampilkan 14 slide resmi Bab 5 Data dan Peluang: penyajian data grafik/tabel, ukuran pemusatan (mean, median, modus), kuartil/desil/persentil, ukuran penyebaran, kaidah pencacahan, faktorial/permutasi/kombinasi, peluang bersyarat, dan frekuensi harapan.",
    durationMinutes: 25,
    pageCount: 14,
    pdfFileName: "BAB_5_DATA_DAN_PELUANG.pdf",
    externalPdfUrl: "/modul_peluang.html",
    isCustomPdf: true,
    updatedAt: Date.now(),
  },
};

async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "moduleId" });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error("IndexedDB error:", (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Save custom material and PDF blob to IndexedDB & sync light meta to localStorage
 */
export async function saveCustomMaterial(data: CustomMaterialData): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    const record = {
      ...data,
      updatedAt: Date.now(),
    };

    const request = store.put(record);

    request.onsuccess = () => {
      // Sync fast metadata to localStorage for synchronous UI read
      try {
        const lightMeta = {
          moduleId: data.moduleId,
          title: data.title,
          description: data.description,
          durationMinutes: data.durationMinutes,
          pageCount: data.pageCount,
          pdfFileName: data.pdfFileName,
          pdfFileSize: data.pdfFileSize,
          externalPdfUrl: data.externalPdfUrl,
          isCustomPdf: data.isCustomPdf,
          updatedAt: record.updatedAt,
        };
        localStorage.setItem(`sigma_material_meta_${data.moduleId}`, JSON.stringify(lightMeta));
      } catch (e) {
        console.warn("Could not save to localStorage quota:", e);
      }

      // Invalidate blob cache
      if (blobUrlCache.has(data.moduleId)) {
        URL.revokeObjectURL(blobUrlCache.get(data.moduleId)!);
        blobUrlCache.delete(data.moduleId);
      }

      // Asynchronously sync to Supabase database if table exists
      (async () => {
        try {
          const { error } = await supabase
            .from("module_materials")
            .upsert({
              module_id: data.moduleId,
              district_id: data.moduleId === "mod-stat-1" ? 5 : 1,
              title: data.title,
              description: data.description,
              duration_minutes: data.durationMinutes,
              page_count: data.pageCount || 14,
              pdf_file_name: data.pdfFileName || "modul.pdf",
              pdf_url: data.externalPdfUrl || "/modul_peluang.html",
              is_custom_pdf: data.isCustomPdf,
              updated_at: new Date().toISOString(),
            });
          if (error) {
            console.error("[pdfStorage] Supabase error saat menyimpan module_materials:", error);
          }
        } catch (err) {
          console.error("[pdfStorage] Exception saat sinkronisasi ke Supabase:", err);
        }
      })();

      // Notify other components (like Material.tsx)
      window.dispatchEvent(
        new CustomEvent("sigma_material_updated", {
          detail: { moduleId: data.moduleId },
        })
      );

      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Retrieve custom material data by moduleId
 */
export async function getCustomMaterial(moduleId: string): Promise<CustomMaterialData | null> {
  try {
    const db = await getDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(moduleId);

      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else if (SEED_MATERIALS[moduleId]) {
          const seeded = SEED_MATERIALS[moduleId] as CustomMaterialData;
          // Seed to IndexedDB in background
          try {
            const writeTx = db.transaction([STORE_NAME], "readwrite");
            writeTx.objectStore(STORE_NAME).put(seeded);
          } catch {}
          resolve(seeded);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        if (SEED_MATERIALS[moduleId]) {
          resolve(SEED_MATERIALS[moduleId] as CustomMaterialData);
        } else {
          reject(request.error);
        }
      };
    });
  } catch (err) {
    console.error("Error fetching material:", err);
    if (SEED_MATERIALS[moduleId]) {
      return SEED_MATERIALS[moduleId] as CustomMaterialData;
    }
    return null;
  }
}

/**
 * Get synchronously cached metadata from localStorage
 */
export function getMaterialMetaSync(moduleId: string): Partial<CustomMaterialData> | null {
  try {
    const raw = localStorage.getItem(`sigma_material_meta_${moduleId}`);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Failed to parse cached material meta:", e);
  }
  if (SEED_MATERIALS[moduleId]) {
    try {
      localStorage.setItem(`sigma_material_meta_${moduleId}`, JSON.stringify(SEED_MATERIALS[moduleId]));
    } catch {}
    return SEED_MATERIALS[moduleId];
  }
  return null;
}

/**
 * Get a renderable URL for the module PDF (either Blob URL, External URL, or default system URL)
 */
export async function getModulePdfUrl(moduleId: string, defaultUrl: string): Promise<{
  url: string;
  isCustom: boolean;
  fileName?: string;
  data?: CustomMaterialData | null;
}> {
  const custom = await getCustomMaterial(moduleId);

  if (custom && custom.isCustomPdf) {
    if (custom.externalPdfUrl) {
      return {
        url: custom.externalPdfUrl,
        isCustom: true,
        fileName: custom.pdfFileName || "Dokumen PDF Online",
        data: custom,
      };
    }

    if (custom.pdfBlob) {
      let blobUrl = blobUrlCache.get(moduleId);
      if (!blobUrl) {
        blobUrl = URL.createObjectURL(custom.pdfBlob);
        blobUrlCache.set(moduleId, blobUrl);
      }
      return {
        url: blobUrl,
        isCustom: true,
        fileName: custom.pdfFileName || "modul_guru.pdf",
        data: custom,
      };
    }
  }

  return {
    url: defaultUrl,
    isCustom: false,
    fileName: undefined,
    data: custom,
  };
}

/**
 * Reset module back to system default PDF and properties
 */
export async function resetModuleToDefault(moduleId: string): Promise<void> {
  const db = await getDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(moduleId);

    request.onsuccess = () => {
      localStorage.removeItem(`sigma_material_meta_${moduleId}`);
      if (blobUrlCache.has(moduleId)) {
        URL.revokeObjectURL(blobUrlCache.get(moduleId)!);
        blobUrlCache.delete(moduleId);
      }
      window.dispatchEvent(
        new CustomEvent("sigma_material_updated", {
          detail: { moduleId },
        })
      );
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}
