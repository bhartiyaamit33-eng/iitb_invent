import { withBasePath } from "@/lib/base-path";

/**
 * next/image loader for sub-path builds only (see next.config.ts). A custom
 * loader switches off Next's /_next/image optimizer, so local images are
 * served as they are, under the base path. Root builds (iitbinvent.com) keep
 * Next's default, optimising loader.
 */
export default function basePathImageLoader({
  src,
  width,
}: {
  src: string;
  width: number;
}): string {
  if (!src.startsWith("/") || src.startsWith("//")) return src;
  return `${withBasePath(src)}${src.includes("?") ? "&" : "?"}w=${width}`;
}
