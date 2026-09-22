import Image from "next/image";

/**
 * Captioned documentary photo. Works on paper and on navy sections; the caption
 * is the label, so pass something that says what the picture actually is.
 */
export function SitePhoto({
  src,
  alt,
  caption,
  width,
  height,
  sizes = "(max-width: 1180px) 100vw, 1140px",
  className,
  priority,
  testId,
}: {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
  testId?: string;
}) {
  return (
    <figure
      className={["building-photo", className ?? null].filter(Boolean).join(" ")}
      data-testid={testId}
    >
      <Image src={src} alt={alt} width={width} height={height} sizes={sizes} priority={priority} />
      <figcaption>{caption}</figcaption>
    </figure>
  );
}
