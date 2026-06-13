"use client";

import { ImageUp, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getVendorWorkspace } from "@/lib/actions/vendor/workspace";
import { uploadPublicImage } from "@/lib/supabase/storage";

type ImageUrlUploaderProps = {
  folder: "brand" | "stores" | "products";
  label: string;
  urls: string[];
  compact?: boolean;
  disabled?: boolean;
  onChange: (urls: string[]) => void;
  vendorId?: string;
};

export function ImageUrlUploader({
  compact = false,
  folder,
  label,
  urls,
  disabled = false,
  onChange,
  vendorId: providedVendorId,
}: ImageUrlUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vendorId, setVendorId] = useState<string | null>(
    providedVendorId ?? null,
  );

  useEffect(() => {
    if (providedVendorId) {
      setVendorId(providedVendorId);
      return;
    }

    let mounted = true;

    async function loadVendorId() {
      const workspace = await getVendorWorkspace();
      if (!mounted) return;

      if (workspace.ok && workspace.data.vendorId) {
        setVendorId(workspace.data.vendorId);
        setError(null);
      } else if (!workspace.ok) {
        setError(workspace.error.message);
      }
    }

    loadVendorId();

    return () => {
      mounted = false;
    };
  }, [providedVendorId]);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;

    setIsUploading(true);
    setError(null);

    try {
      if (!vendorId) {
        throw new Error("Vendor profile is not ready for uploads.");
      }

      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const uploaded = await uploadPublicImage({ folder, file, vendorId });
        uploadedUrls.push(uploaded.publicUrl);
      }

      onChange([...urls, ...uploadedUrls]);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Image upload failed.",
      );
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  function removeUrl(url: string) {
    onChange(urls.filter((item) => item !== url));
  }

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <Label className={compact ? "text-xs" : undefined}>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          accept="image/*"
          className="hidden"
          disabled={disabled || isUploading}
          multiple
          onChange={(event) => uploadFiles(event.target.files)}
          ref={inputRef}
          type="file"
        />
        <Button
          disabled={disabled || isUploading}
          onClick={() => inputRef.current?.click()}
          type="button"
          variant="outline"
        >
          <ImageUp className="size-4" />
          {isUploading ? "Uploading..." : compact ? "Upload" : "Upload image"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {urls.length > 0 && (
        <div className={compact ? "space-y-2" : "grid gap-3 sm:grid-cols-2"}>
          {urls.map((url) => (
            <div
              className="flex items-center gap-3 rounded-md border p-2"
              key={url}
            >
              <div
                aria-label="Uploaded image preview"
                className={
                  compact
                    ? "size-10 shrink-0 rounded-md border bg-cover bg-center"
                    : "size-14 shrink-0 rounded-md border bg-cover bg-center"
                }
                style={{ backgroundImage: `url(${url})` }}
              />
              <div className="min-w-0 flex-1 text-xs text-muted-foreground">
                Image uploaded
              </div>
              <Button
                disabled={disabled}
                onClick={() => removeUrl(url)}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
