/**
 * The sub-path this build is served under: "" at iitbinvent.com, "/invent" on
 * the LAN host (http://10.127.1.23/invent). Fixed at build time.
 *
 * Next.js prefixes it on <Link>, redirect() and router navigation by itself.
 * Everything else that names a root-relative URL goes through withBasePath():
 * fetch(), plain <a>/<form>, window.location, and Auth.js redirect targets.
 */
export const BASE_PATH = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/+$/, "");

export function withBasePath(path: string): string {
  if (!BASE_PATH || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === BASE_PATH || path.startsWith(`${BASE_PATH}/`)) return path;
  return `${BASE_PATH}${path}`;
}
