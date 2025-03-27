"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const settingsFormSchema = z.object({
  logo: z
    .custom<FileList>()
    .refine((files) => files?.length === 1, "Logo é obrigatório")
    .refine(
      (files) => files?.[0]?.size <= MAX_FILE_SIZE,
      "Tamanho máximo do arquivo é 5MB"
    )
    .refine(
      (files) => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Formato de arquivo inválido. Aceitos: .jpg, .jpeg, .png e .webp"
    ),
  companyName: z
    .string()
    .min(2, "Nome da empresa deve ter no mínimo 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  bannerImages: z
    .custom<FileList>()
    .refine((files) => files?.length <= 5, "Máximo de 5 imagens permitidas")
    .refine(
      (files) => Array.from(files).every((file) => file.size <= MAX_FILE_SIZE),
      "Tamanho máximo por arquivo é 5MB"
    )
    .refine(
      (files) =>
        Array.from(files).every((file) =>
          ACCEPTED_IMAGE_TYPES.includes(file.type)
        ),
      "Formato de arquivo inválido. Aceitos: .jpg, .jpeg, .png e .webp"
    ),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

type BannerImage = {
  id: string;
  url: string;
  file: File;
};

export default function CompanySettingsForm() {
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreviews, setBannerPreviews] = useState<BannerImage[]>([]);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
  });

  function onSubmit(data: SettingsFormValues) {
    console.log(data);
    // Aqui você implementaria a lógica para salvar os dados
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newPreviews = files.map((file) => ({
      id: crypto.randomUUID(),
      url: URL.createObjectURL(file),
      file,
    }));
    setBannerPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeBannerImage = (id: string) => {
    setBannerPreviews((prev) => {
      const filtered = prev.filter((image) => image.id !== id);
      const files = filtered.map((image) => image.file);
      const dataTransfer = new DataTransfer();
      files.forEach((file) => dataTransfer.items.add(file));
      form.setValue("bannerImages", dataTransfer.files);
      return filtered;
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Configurações da Empresa</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="logo"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Logo da Empresa</FormLabel>
                  <FormControl>
                    <div className="flex flex-col items-center gap-4">
                      {logoPreview && (
                        <Avatar className="w-32 h-32">
                          <AvatarImage src={logoPreview} alt="Logo preview" />
                          <AvatarFallback>LOGO</AvatarFallback>
                        </Avatar>
                      )}
                      <Input
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={(e) => {
                          handleLogoChange(e);
                          onChange(e.target.files);
                        }}
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Empresa</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome da empresa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="empresa@exemplo.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="(00) 00000-0000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bannerImages"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Banner (até 5 imagens)</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        multiple
                        max={5}
                        onChange={(e) => {
                          handleBannerChange(e);
                          onChange(e.target.files);
                        }}
                        {...field}
                      />
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {bannerPreviews.map((preview) => (
                          <div
                            key={preview.id}
                            className="relative aspect-video rounded-lg overflow-hidden group"
                          >
                            <Image
                              src={preview.url}
                              alt="Banner preview"
                              fill
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeBannerImage(preview.id)}
                              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-white"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Salvar Alterações
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
