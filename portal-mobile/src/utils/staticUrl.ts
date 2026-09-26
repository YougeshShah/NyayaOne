import Constants from "expo-constants";

// Mirrors the serverOrigin pattern already used in app/edit-profile.tsx for
// avatars: strip the "/api/v1" suffix off the configured API base URL to get
// the origin that serves /uploads/... static files.
export function getServerOrigin(): string {
  const apiBaseUrl = (Constants.expoConfig?.extra?.apiBaseUrl as string) || "http://localhost:5000/api/v1";
  return apiBaseUrl.replace(/\/api\/v\d+\/?$/, "");
}

export function attachmentUrlFor(path: string): string {
  if (!path) return path;
  return path.startsWith("http") ? path : `${getServerOrigin()}/uploads/${path}`;
}
