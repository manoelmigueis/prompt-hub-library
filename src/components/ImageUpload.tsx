import { useState, useRef, useEffect } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onError?: (error: string) => void;
  bucket?: string;
  maxSizeMB?: number;
  onUploadingChange?: (uploading: boolean) => void;
}

export function ImageUpload({ value, onChange, onError, bucket = "prompt-images", maxSizeMB = 20, onUploadingChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync preview with external value changes
  useEffect(() => {
    setPreview(value || null);
  }, [value]);

  const handleFile = async (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      onError?.("Tipo de arquivo não suportado. Use JPG, PNG, WebP ou GIF.");
      return;
    }

    // Validate file size (20MB - matches bucket limit)
    if (file.size > 20 * 1024 * 1024) {
      onError?.("Arquivo muito grande. O tamanho máximo é 20MB.");
      return;
    }

    setIsUploading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        onError?.("Você precisa estar logado para fazer upload de imagens.");
        setIsUploading(false);
        return;
      }

      // Create unique file name
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from("prompt-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("Upload error:", error);
        onError?.("Erro ao fazer upload da imagem. Tente novamente.");
        setIsUploading(false);
        return;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("prompt-images")
        .getPublicUrl(data.path);

      setPreview(publicUrl);
      onChange(publicUrl);
    } catch (error) {
      console.error("Upload error:", error);
      onError?.("Erro inesperado ao fazer upload. Tente novamente.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="relative rounded-lg overflow-hidden border-2 border-primary">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6
            transition-colors duration-200 cursor-pointer
            ${dragActive 
              ? "border-primary bg-primary/10" 
              : "border-muted-foreground/30 hover:border-primary hover:bg-muted/50"
            }
            ${isUploading ? "pointer-events-none opacity-60" : ""}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center gap-3 text-center">
            {isUploading ? (
              <>
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-sm text-muted-foreground">Fazendo upload...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm">
                    Arraste uma imagem ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WebP ou GIF • Máximo 20MB
                  </p>
                </div>
                <Button type="button" variant="outline" size="sm" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Selecionar arquivo
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
