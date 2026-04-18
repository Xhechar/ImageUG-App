// ─── CLOUDINARY UPLOAD HELPER ────────────────────────────────────
export const CLOUDINARY_CONFIG = {
  cloudName: "dakyiye2e",
  uploadPreset: "imagen",
};

export async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video" = "image"
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
  formData.append("cloud_name", CLOUDINARY_CONFIG.cloudName);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = await res.json();
  return data.secure_url as string;
}