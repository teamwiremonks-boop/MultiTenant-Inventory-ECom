import type { CSSProperties } from "react";
import Image from "next/image";

import { productBentoLayout } from "@/lib/storefront-products";

type ProductImageBentoProps = {
  imageUrls: string[];
  productName: string;
};

export function ProductImageBento({
  imageUrls,
  productName,
}: ProductImageBentoProps) {
  const images = imageUrls.slice(0, 5);
  const rows = productBentoLayout(images.length);
  let imageIndex = 0;

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg border bg-muted text-sm text-muted-foreground">
        No image
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {rows.map((weights, rowIndex) => {
        const rowImages = images.slice(imageIndex, imageIndex + weights.length);
        imageIndex += weights.length;
        const style = {
          "--bento-columns": weights.map((weight) => `${weight}fr`).join(" "),
        } as CSSProperties;

        return (
          <div
            className="grid grid-cols-1 gap-3 md:[grid-template-columns:var(--bento-columns)]"
            key={`${rowIndex}-${weights.join("-")}`}
            style={style}
          >
            {rowImages.map((url, itemIndex) => (
              <div
                className="relative aspect-square overflow-hidden rounded-lg border bg-muted md:aspect-auto md:min-h-72"
                key={`${url}-${itemIndex}`}
              >
                <Image
                  alt={`${productName} image ${imageIndex - rowImages.length + itemIndex + 1}`}
                  className="object-cover"
                  fill
                  priority={rowIndex === 0 && itemIndex === 0}
                  sizes="(min-width: 768px) 45vw, 100vw"
                  src={url}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
