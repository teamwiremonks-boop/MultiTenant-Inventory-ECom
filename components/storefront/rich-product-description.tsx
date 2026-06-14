import { cn } from "@/lib/utils";
import { sanitizeProductDescription } from "@/lib/storefront-products";

type RichProductDescriptionProps = {
  className?: string;
  html: string;
  compact?: boolean;
};

export function RichProductDescription({
  className,
  html,
  compact = false,
}: RichProductDescriptionProps) {
  const sanitizedHtml = sanitizeProductDescription(html, { links: !compact });
  if (!sanitizedHtml) return null;

  return (
    <div
      className={cn(
        "text-sm leading-6 text-muted-foreground [&_a]:font-medium [&_a]:text-foreground [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:pl-4 [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_ol]:list-decimal [&_p+p]:mt-3 [&_ul]:list-disc",
        compact && "line-clamp-3",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
}
