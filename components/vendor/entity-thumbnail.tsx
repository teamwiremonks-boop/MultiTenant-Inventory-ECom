"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";

type EntityThumbnailProps = {
  alt: string;
  url?: string | null;
};

export function EntityThumbnail({ alt, url }: EntityThumbnailProps) {
  if (!url) {
    return (
      <div className="flex size-12 shrink-0 items-center justify-center rounded-md border bg-muted text-muted-foreground">
        <ImageIcon className="size-4" />
      </div>
    );
  }

  return (
    <Image
      alt={alt}
      className="size-12 shrink-0 rounded-md border bg-muted object-cover"
      height={48}
      src={url}
      width={48}
    />
  );
}
