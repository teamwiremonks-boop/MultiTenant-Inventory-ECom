"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type ProductMediaCarouselProps = {
  imageUrls: string[];
  productName: string;
};

export function ProductMediaCarousel({
  imageUrls,
  productName,
}: ProductMediaCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const updateSelectedIndex = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setSelectedIndex(carouselApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    updateSelectedIndex(api);
    api.on("select", updateSelectedIndex);
    api.on("reInit", updateSelectedIndex);
    return () => {
      api.off("select", updateSelectedIndex);
      api.off("reInit", updateSelectedIndex);
    };
  }, [api, updateSelectedIndex]);

  if (imageUrls.length === 0) {
    return (
      <div className="flex aspect-4/3 items-center justify-center bg-muted text-sm text-muted-foreground">
        No image
      </div>
    );
  }

  return (
    <div className="relative bg-muted">
      <Carousel opts={{ loop: imageUrls.length > 1 }} setApi={setApi}>
        <CarouselContent className="ml-0">
          {imageUrls.map((url, index) => (
            <CarouselItem className="pl-0" key={`${url}-${index}`}>
              <div className="relative aspect-4/3">
                <Image
                  alt={`${productName} image ${index + 1}`}
                  className="object-cover"
                  fill
                  priority={index === 0}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  src={url}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {imageUrls.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {imageUrls.map((url, index) => (
            <Button
              aria-label={`Show image ${index + 1} of ${imageUrls.length}`}
              className="size-6 rounded-full p-0"
              key={`${url}-dot-${index}`}
              onClick={() => api?.scrollTo(index)}
              size="icon"
              type="button"
              variant="ghost"
            >
              <span
                className={cn(
                  "size-2 rounded-full border border-background/80 shadow-sm",
                  selectedIndex === index ? "bg-foreground" : "bg-background/70",
                )}
              />
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
