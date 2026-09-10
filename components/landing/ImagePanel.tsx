import type { ReactNode } from "react";
import Image from "next/image";
import { OrbitBackdrop } from "./OrbitBackdrop";
import { cx } from "./cx";

export function ImagePanel({
  src,
  alt,
  caption,
  className,
  priority = false,
  sizes = "(max-width: 960px) 100vw, 48vw",
  grade = "cinematic",
  testId,
  imgClassName,
  children,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  grade?: "cinematic" | "photo";
  testId?: string;
  imgClassName?: string;
  children?: ReactNode;
}) {
  return (
    <figure
      className={cx("image-panel", grade === "photo" && "image-panel-photo", className)}
      data-testid={testId}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={72}
        className={cx("object-cover", imgClassName)}
      />
      {grade === "cinematic" ? (
        <>
          <div className="veil" />
          <OrbitBackdrop variant="corner" />
        </>
      ) : (
        <div className="veil" />
      )}
      {caption ? <figcaption className="caption">{caption}</figcaption> : null}
      {children}
    </figure>
  );
}

export function ImageSplit({
  image,
  imageSide = "right",
  children,
  className,
  caption,
  priority = false,
  grade = "cinematic",
  imageClassName,
  imgClassName,
  testId,
}: {
  image: { src: string; alt: string };
  imageSide?: "left" | "right";
  children: ReactNode;
  className?: string;
  caption?: string;
  priority?: boolean;
  grade?: "cinematic" | "photo";
  imageClassName?: string;
  imgClassName?: string;
  testId?: string;
}) {
  return (
    <div
      className={cx(
        "grid items-center gap-10 lg:grid-cols-2 lg:gap-16",
        className,
      )}
    >
      <div className={imageSide === "left" ? "lg:order-2" : undefined}>
        {children}
      </div>
      <ImagePanel
        src={image.src}
        alt={image.alt}
        caption={caption}
        priority={priority}
        grade={grade}
        testId={testId}
        imgClassName={imgClassName}
        className={cx(
          imageClassName ? undefined : "min-h-[280px] lg:min-h-[420px]",
          imageSide === "left" ? "lg:order-1" : undefined,
          imageClassName,
        )}
      />
    </div>
  );
}
