/**
 * Resolves a public asset path against Vite's base URL (import.meta.env.BASE_URL).
 * Ensures safe handling whether the relative path starts with a slash or not.
 */
export function getAssetUrl(path: string): string {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const baseUrl = import.meta.env.BASE_URL ?? "/";
  return `${baseUrl}${cleanPath}`;
}
