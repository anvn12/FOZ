import { z } from "zod";

const websiteSchema = z
  .string()
  .trim()
  .max(200, "Website URL must be at most 200 characters")
  .nullable()
  .optional()
  .transform((val) => {
    if (!val || val === "") return null;
    return val;
  })
  .refine((val) => {
    if (!val) return true;
    try {
      // Check if it is a valid URL, prepending https:// if it has no protocol
      const urlString = val.match(/^https?:\/\//i) ? val : `https://${val}`;
      const url = new URL(urlString);
      // Ensure hostname has at least one dot (e.g. google.com) and is not just a single word
      return (url.protocol === "http:" || url.protocol === "https:") && url.hostname.includes(".");
    } catch (_) {
      return false;
    }
  }, "Invalid website URL format")
  .transform((val) => {
    if (!val) return null;
    return val.match(/^https?:\/\//i) ? val : `https://${val}`;
  });

export const UpdateProfileRequest = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(50, "Display name must be at most 50 characters")
    .regex(
      /^[\p{L}\p{N}\s._'-]+$/u,
      "Display name contains invalid or special characters"
    ),
  bio: z
    .string()
    .max(160, "Bio must be at most 160 characters")
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  location: z
    .string()
    .max(100, "Location must be at most 100 characters")
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  website: websiteSchema,
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequest>;

const base64Regex = /^data:image\/(png|jpeg|jpg|gif|webp);base64,[A-Za-z0-9+/=]+$/;

const isUrlOrBase64 = (val: string) => {
  if (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/uploads/")) {
    return true;
  }
  return base64Regex.test(val);
};

export const UpdateAvatarRequest = z.object({
  avatar: z
    .string()
    .min(1, "Avatar image or URL is required")
    .refine((val) => isUrlOrBase64(val), "Invalid avatar image format or URL")
    .refine((val) => {
      if (val.startsWith("http://") || val.startsWith("https://") || val.startsWith("/uploads/")) {
        return true;
      }
      const parts = val.split(",");
      const base64Data = parts[1];
      if (!base64Data) return false;
      let padding = 0;
      if (val.endsWith("==")) padding = 2;
      else if (val.endsWith("=")) padding = 1;
      const sizeInBytes = (base64Data.length * 3) / 4 - padding;
      return sizeInBytes <= 2 * 1024 * 1024; // 2MB limit
    }, "Image file size exceeds 2MB limit"),
});

export type UpdateAvatarRequest = z.infer<typeof UpdateAvatarRequest>;
