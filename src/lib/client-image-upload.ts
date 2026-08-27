/** Preparación y subida de fotos desde el navegador (Mac / iPhone). */

const DEFAULT_MAX_EDGE = 2048;
const DEFAULT_MAX_BYTES = 3.5 * 1024 * 1024;

function baseName(file: File): string {
  const raw = file.name.replace(/\.[^.]+$/, "").trim() || "foto";
  return raw.slice(0, 80);
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file);
  } catch {
    // Fallback para algunos HEIC / formatos raros vía <img>.
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const el = new Image();
        el.onload = () => resolve(el);
        el.onerror = () =>
          reject(
            new Error(
              "No se ha podido leer la foto. En iPhone, prueba a elegir «Imagen» o convertir a JPEG.",
            ),
          );
        el.src = url;
      });
      return await createImageBitmap(img);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
}

function canvasToJpegBlob(
  canvas: HTMLCanvasElement,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("No se ha podido convertir la foto."));
        else resolve(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

/**
 * Convierte la foto a JPEG, redimensiona y comprime para móvil/Mac.
 * Evita HEIC problemáticos y archivos de 8–12 MB del iPhone.
 */
export async function prepareJpegForUpload(
  file: File,
  options?: { maxEdge?: number; maxBytes?: number },
): Promise<File> {
  const maxEdge = options?.maxEdge ?? DEFAULT_MAX_EDGE;
  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES;

  const bitmap = await loadBitmap(file);
  let width = bitmap.width;
  let height = bitmap.height;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("No se ha podido procesar la foto en este navegador.");
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  let quality = 0.88;
  let blob = await canvasToJpegBlob(canvas, quality);
  while (blob.size > maxBytes && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToJpegBlob(canvas, quality);
  }

  // Si sigue enorme, reducir resolución y reintentar.
  if (blob.size > maxBytes) {
    const shrink = Math.sqrt(maxBytes / blob.size) * 0.92;
    const w2 = Math.max(1, Math.round(canvas.width * shrink));
    const h2 = Math.max(1, Math.round(canvas.height * shrink));
    const c2 = document.createElement("canvas");
    c2.width = w2;
    c2.height = h2;
    const ctx2 = c2.getContext("2d");
    if (!ctx2) throw new Error("No se ha podido comprimir la foto.");
    ctx2.drawImage(canvas, 0, 0, w2, h2);
    blob = await canvasToJpegBlob(c2, 0.72);
  }

  if (blob.size > 5 * 1024 * 1024) {
    throw new Error(
      "La foto sigue siendo demasiado grande. Prueba otra o recórtala un poco.",
    );
  }

  return new File([blob], `${baseName(file)}.jpg`, { type: "image/jpeg" });
}

export async function uploadPreparedImage(options: {
  bucket: string;
  file: File;
  userId: string;
}): Promise<{ url: string }> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const path = `${options.userId}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage
    .from(options.bucket)
    .upload(path, options.file, {
      contentType: "image/jpeg",
      upsert: false,
    });
  if (error) {
    throw new Error("No se ha podido subir la imagen.");
  }
  return {
    url: supabase.storage.from(options.bucket).getPublicUrl(path).data
      .publicUrl,
  };
}

/** Sube una foto de formulario: comprime + Storage directo (sin pasar por Vercel). */
export async function uploadFormImage(options: {
  bucket: string;
  file: File;
}): Promise<{ url: string }> {
  const { createClient } = await import("@/lib/supabase/client");
  const supabase = createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("Sesión caducada. Vuelve a entrar e inténtalo de nuevo.");
  }
  const prepared = await prepareJpegForUpload(options.file);
  return uploadPreparedImage({
    bucket: options.bucket,
    file: prepared,
    userId: user.id,
  });
}
