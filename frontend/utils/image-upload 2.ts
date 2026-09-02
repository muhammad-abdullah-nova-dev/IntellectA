const MAX_FILE_BYTES = 4 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export interface PreparedImage {
  base64: string;
  mimeType: string;
  dataUrl: string;
}

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, or WebP images are supported.";
  }
  if (file.size > MAX_FILE_BYTES) {
    return "Image must be under 4 MB.";
  }
  return null;
}

export async function prepareImageForUpload(file: File): Promise<PreparedImage> {
  const error = validateImageFile(file);
  if (error) {
    throw new Error(error);
  }

  const dataUrl = await resizeImage(file);
  const [header, base64] = dataUrl.split(",");
  const mimeMatch = header.match(/data:(.*?);/);
  const mimeType = mimeMatch?.[1] || "image/jpeg";

  const sizeBytes = Math.ceil((base64.length * 3) / 4);
  if (sizeBytes > MAX_FILE_BYTES) {
    throw new Error("Image is too large after compression. Try a smaller image.");
  }

  return { base64, mimeType, dataUrl };
}

function resizeImage(file: File, maxWidth = 1280): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not process image."));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
        const quality = outputType === "image/jpeg" ? 0.85 : undefined;
        resolve(canvas.toDataURL(outputType, quality));
      };
      img.onerror = () => reject(new Error("Could not load image."));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read image file."));
    reader.readAsDataURL(file);
  });
}
