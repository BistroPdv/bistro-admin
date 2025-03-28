"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiAddLine, RiCloseLine, RiUpload2Line } from "@remixicon/react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

export interface PropsSetting {
  cnpj: string;
  name: string;
  logo: any;
  email: string;
  phone: string;
  Banner: Banner[];
}

interface Banner {
  url: string;
  nome: string;
}

const formSchema = z.object({
  name: z.string().min(1, { message: "Nome da empresa é obrigatório" }),
  email: z.string().email({ message: "E-mail inválido" }),
  phone: z.string().min(10, { message: "Telefone inválido" }),
  logo: z.instanceof(File).optional(),
  banners: z
    .array(z.instanceof(File))
    .max(5, { message: "Máximo de 5 imagens permitidas" })
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function CompanySettingsForm() {
  const local = JSON.parse(localStorage.getItem("user") || "");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreviews, setBannerPreviews] = useState<
    { url: string; nome: string }[]
  >([]);

  const configEnterprise = useQuery<AxiosResponse<PropsSetting>>({
    queryKey: ["enterprise"],
    queryFn: () => {
      const resp = api.get("/settings");
      return resp;
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      banners: [],
    },
  });

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      form.setValue("logo", file, { shouldValidate: true });

      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    },
    [form]
  );

  const handleBannerUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const currentBanners = form.getValues("banners") || [];
      const newFiles = Array.from(files);
      const totalFiles = [...currentBanners, ...newFiles];

      if (totalFiles.length > 5) {
        form.setError("banners", {
          type: "max",
          message: "Máximo de 5 imagens permitidas",
        });
        return;
      }

      form.setValue("banners", totalFiles, { shouldValidate: true });

      const newPreviews: string[] = [];
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = () => {
          setBannerPreviews((prev) => [
            ...prev,
            { url: reader.result as string, nome: file.name },
          ]);
        };
        reader.readAsDataURL(file);
      });
    },
    [form]
  );

  const removeBanner = useCallback(
    (index: number) => {
      const currentBanners = form.getValues("banners") || [];
      const updatedBanners = [...currentBanners];
      updatedBanners.splice(index, 1);
      form.setValue("banners", updatedBanners, { shouldValidate: true });

      const updatedPreviews = [...bannerPreviews];
      updatedPreviews.splice(index, 1);
      setBannerPreviews(updatedPreviews);
    },
    [form, bannerPreviews]
  );

  const onSubmit = async (data: FormValues) => {
    try {
      const banners = data.banners || [];
      delete data.banners;
      const resp = await api.putForm("/settings", data);

      if (resp.status === 200 && banners.length > 0) {
        for (let i = 0; i < banners.length; i++) {
          const banner = banners[i];
          await api.postForm(
            `/restaurantCnpj/${local.restaurantCnpj}/banners`,
            {
              banner,
            }
          );
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error);
    }
  };

  useEffect(() => {
    if (configEnterprise.isFetched && configEnterprise.data) {
      const { name, email, phone, logo, Banner } = configEnterprise.data.data;

      // Apenas atualiza se os valores forem diferentes
      if (
        form.getValues("name") !== name ||
        form.getValues("email") !== email ||
        form.getValues("phone") !== phone
      ) {
        form.setValue("name", name);
        form.setValue("email", email);
        form.setValue("phone", phone);
      }

      if (logoPreview !== logo) setLogoPreview(logo);

      if (Banner.length > 0) {
        setBannerPreviews(Banner);
      }
    }
  }, [configEnterprise.data, configEnterprise.isFetched]);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Configurações da Empresa</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-full md:w-1/3">
                <FormLabel className="text-base font-medium">
                  Logo da Empresa
                </FormLabel>
                <FormDescription>
                  Faça upload do logo da sua empresa. Recomendamos uma imagem
                  quadrada de pelo menos 200x200 pixels.
                </FormDescription>
              </div>
              <div className="w-full md:w-2/3 flex flex-col items-center md:items-start gap-4">
                <div className="flex flex-col items-center gap-4">
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer relative group"
                  >
                    <Avatar className="size-24 rounded-md transition-all duration-200 group-hover:opacity-80">
                      {logoPreview ? (
                        <AvatarImage src={logoPreview} alt="Logo da empresa" />
                      ) : (
                        <AvatarFallback className="bg-muted text-muted-foreground text-lg">
                          Logo
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-black/50 rounded-md flex items-center justify-center w-full h-full">
                        <RiUpload2Line className="text-white" size={24} />
                      </div>
                    </div>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                  </Label>
                  <FormDescription className="text-center">
                    Clique na imagem para carregar o logo
                    <br />
                    Formatos aceitos: JPG, PNG, SVG
                  </FormDescription>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Empresa</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Digite o nome da empresa"
                          {...field}
                        />
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
                          placeholder="contato@empresa.com"
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
                        <Input
                          type="tel"
                          placeholder="(00) 00000-0000"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-full md:w-1/3">
                  <FormLabel className="text-base font-medium">
                    Banner
                  </FormLabel>
                  <FormDescription>
                    Faça upload de até 5 imagens para o banner da sua empresa.
                    Estas imagens serão usadas em um carrossel do tablet.
                  </FormDescription>
                </div>
                <div className="w-full md:w-2/3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {bannerPreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-video rounded-md overflow-hidden border bg-muted"
                      >
                        <Image
                          src={preview.url}
                          alt={`Banner ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 size-6 rounded-full"
                          onClick={() => removeBanner(index)}
                        >
                          <RiCloseLine size={16} />
                        </Button>
                      </div>
                    ))}

                    {bannerPreviews.length < 5 && (
                      <Label
                        htmlFor="banner-upload"
                        className="cursor-pointer flex flex-col items-center justify-center aspect-video rounded-md border border-dashed bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <RiAddLine
                          size={24}
                          className="mb-2 text-muted-foreground"
                        />
                        <span className="text-sm text-muted-foreground">
                          Adicionar imagem
                        </span>
                        <Input
                          id="banner-upload"
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleBannerUpload}
                        />
                      </Label>
                    )}
                  </div>
                  <FormMessage className="mt-2" />
                </div>
              </div>
            </div>

            <CardFooter className="px-0 flex justify-end">
              <Button type="submit" size="lg">
                Salvar Alterações
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
