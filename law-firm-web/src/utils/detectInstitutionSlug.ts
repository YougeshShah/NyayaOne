// Detects which organization's entry point the user is on -- never
// shown to or chosen by the user, just read from the environment.
//
// Production: a subdomain like raju-law.technocraftx.com -> slug "raju-law"
// Local development (no real subdomains yet): a "?org=raju-law" query
// param on the URL, falling back to nothing if absent.
export function detectInstitutionSlug(): string | undefined {
  const params = new URLSearchParams(window.location.search);
  const orgParam = params.get("org");
  if (orgParam) return orgParam;

  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  if (parts.length >= 3 && parts[0] !== "www" && parts[0] !== "localhost") {
    return parts[0];
  }

  return undefined;
}
