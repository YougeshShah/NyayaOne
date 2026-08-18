// Detects which institution's entry point the student is on -- never
// shown to or chosen by the student, just read from the environment.
//
// Production: a subdomain like raju-law.technocraftx.com -> slug "raju-law"
// Local development (no real subdomains yet): a "?org=raju-law" query
// param on the URL, falling back to nothing (direct/Company registration)
// if absent.
export function detectInstitutionSlug(): string | undefined {
  // Dev/testing override -- lets a specific institution's flow be tested
  // locally before real subdomains exist.
  const params = new URLSearchParams(window.location.search);
  const orgParam = params.get("org");
  if (orgParam) return orgParam;

  const hostname = window.location.hostname;
  const parts = hostname.split(".");

  // "raju-law.technocraftx.com" -> ["raju-law", "technocraftx", "com"] -- 3+
  // parts with a real subdomain (not "www" or "localhost") means an
  // institution-specific entry point.
  if (parts.length >= 3 && parts[0] !== "www" && parts[0] !== "localhost") {
    return parts[0];
  }

  return undefined; // bare domain or localhost with no ?org= -- direct/Company registration
}
