"use client";

import { cn } from "@/lib/utils";
import { RiUpload2Line } from "@remixicon/react";
import { ChangeEvent, useState } from "react";
import { Button } from "./button";
import { Input } from "./input";

interface FileUploadProps {
  onChange: (file: File | null) => void;
  value?: string;
  className?: string;
  accept?: string;
  maxSize?: number; // em bytes
  label?: string;
  previewUrl?: string;
}

export function FileUpload({
  onChange,
  value,
  className,
  accept = "image/*",
  maxSize = 5 * 1024 * 1024, // 5MB por padrão
  label = "Selecionar arquivo",
  previewUrl,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setError(null);

    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    // Verificar tamanho do arquivo
    if (file.size > maxSize) {
      setError(
        `O arquivo excede o tamanho máximo de ${maxSize / (1024 * 1024)}MB`
      );
      return;
    }

    // Criar URL para preview
    const fileUrl = URL.createObjectURL(file);
    setPreview(fileUrl);
    onChange(file);

    // Limpar URL do objeto quando o componente for desmontado
    return () => {
      URL.revokeObjectURL(fileUrl);
    };
  };

  const clearFile = () => {
    setPreview(null);
    setError(null);
    onChange(null);
  };

  return (
    <div className={cn("flex flex-col space-y-2", className)}>
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-md"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={clearFile}
          >
            Remover
          </Button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <RiUpload2Line className="w-8 h-8 mb-3 text-gray-400" />
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">{label}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG ou JPEG (máx. {maxSize / (1024 * 1024)}MB)
            </p>
          </div>
          <Input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
