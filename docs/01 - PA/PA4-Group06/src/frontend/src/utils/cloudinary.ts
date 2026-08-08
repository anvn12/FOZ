export function getOptimizedCloudinaryUrl(
  url: string,
  options: { width?: number; quality?: string; format?: string } = {}
): string {
  if (!url || !url.includes("res.cloudinary.com")) {
    return url;
  }

  const { width, quality = "auto", format = "auto" } = options;
  const transformations: string[] = [`f_${format}`, `q_${quality}`];

  if (width) {
    transformations.push(`c_limit,w_${width}`);
  }

  const transformString = transformations.join(",");

  // Inject transformation string right after /upload/
  return url.replace("/upload/", `/upload/${transformString}/`);
}
