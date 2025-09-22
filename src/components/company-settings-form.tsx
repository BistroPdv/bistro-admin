"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { RiAddLine, RiCloseLine, RiUpload2Line } from "@remixicon/react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { v4 as uuid } from "uuid";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { Printer } from "@/schemas/printer-schema";
import { useQuery } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { withMask } from "use-mask-input";
import { SettingsFormSkeleton } from "./company-settings-form-skeleton";

export interface PropsSetting {
  cnpj: string;
  name: string;
  logo: any;
  email: string;
  phone: string;
  Banner: Banner[];
  pdvIntegrations: string;
  integrationOmie: { omie_key: string; omie_secret: string } | null;
  printerNotification: string;
  printerBill: string;
  adminPassword: string; // Added field for admin password
  typeService: "TABLE" | "TABLE_COMMANDED" | "COMMANDED"; // Added field for type service
}

interface Banner {
  id: string;
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
  pdvIntegrations: z.string(),
  omieAppKey: z.string().optional(),
  omieSecretKey: z.string().optional(),
  printerNotification: z.string().optional(),
  printerBill: z.string().optional(),
  typeService: z.enum(["TABLE", "TABLE_COMMANDED", "COMMANDED"], {
    required_error: "Por favor, selecione o tipo de serviço",
  }),
  adminPassword: z
    .string()
    .min(1, { message: "Senha Administrativa é obrigatória" }), // Added validation for admin password
});

type FormValues = z.infer<typeof formSchema>;

export function CompanySettingsForm() {
  const local = JSON.parse(localStorage.getItem("user") || "");

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [bannerPreviews, setBannerPreviews] = useState<
    { id: string; url: string; nome: string }[]
  >([]);
  const [integrationType, setIntegrationType] = useState<string>("OMIE");
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isLoadingPrinters, setIsLoadingPrinters] = useState(true);

  const configEnterprise = useQuery<
    AxiosResponse,
    Error,
    AxiosResponse<PropsSetting>
  >({
    queryKey: ["enterprise"],
    queryFn: () => {
      const resp = api.get("/settings");
      return resp;
    },
    select: (data) => data,
  });

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        setIsLoadingPrinters(true);
        const response = await api.get(`/printers`);
        if (response.data) {
          setPrinters(response.data?.data);
        }
      } catch (error) {
        console.error("Erro ao carregar impressoras:", error);
      } finally {
        setIsLoadingPrinters(false);
      }
    };

    fetchPrinters();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      banners: [],
      pdvIntegrations: "",
      omieAppKey: "",
      omieSecretKey: "",
      printerNotification: "",
      typeService: "TABLE",
      printerBill: "",
      adminPassword: "", // Default value for admin password
    },
  });

  // Estado para controlar se os dados iniciais já foram carregados
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

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
            { url: reader.result as string, nome: file.name, id: uuid() },
          ]);
        };
        reader.readAsDataURL(file);
      });
    },
    [form]
  );

  const removeBanner = useCallback(
    async (index: number, id: string) => {
      try {
        await api.delete(`/banners/${id}`);
        const currentBanners = form.getValues("banners") || [];
        const updatedBanners = [...currentBanners];
        updatedBanners.splice(index, 1);
        form.setValue("banners", updatedBanners, { shouldValidate: true });

        const updatedPreviews = [...bannerPreviews];
        updatedPreviews.splice(index, 1);
        setBannerPreviews(updatedPreviews);
      } catch (error) {
        toast.error("Erro ao remover banner");
      }
    },
    [form, bannerPreviews]
  );

  const onSubmit = async (data: FormValues) => {
    try {
      const banners = data.banners || [];
      delete data.banners;
      const resp = await api.putForm("/settings", {
        ...data,
        printerNotification: data.printerNotification || null,
        printerBill: data.printerBill || null,
        adminPassword: data.adminPassword, // Include admin password in the submission
      });

      if (resp.status === 200 && banners.length > 0) {
        for (let i = 0; i < banners.length; i++) {
          const banner = banners[i];
          await api.postForm(`/banners`, {
            banner,
          });
        }
      }

      toast.success("Configurações atualizadas com sucesso");
    } catch (error) {
      toast.error(`Erro ao atualizar configurações: ${error}`);
    }
  };

  // Função para carregar dados da API no formulário
  const loadFormData = useCallback(() => {
    if (!configEnterprise.data?.data || isInitialDataLoaded) {
      return;
    }

    const apiData = configEnterprise.data.data;

    try {
      // Atualizar tipo de integração
      const pdvIntegration = apiData.pdvIntegrations || "OMIE";
      setIntegrationType(pdvIntegration);

      // Resetar formulário com dados da API
      const formData = {
        name: apiData.name || "",
        email: apiData.email || "",
        phone: apiData.phone || "",
        pdvIntegrations: pdvIntegration,
        printerNotification: apiData.printerNotification || "",
        printerBill: apiData.printerBill || "",
        omieAppKey: apiData.integrationOmie?.omie_key || "",
        omieSecretKey: apiData.integrationOmie?.omie_secret || "",
        adminPassword: apiData.adminPassword || "",
        typeService: apiData.typeService || "TABLE",
      };

      console.log("📝 Dados do formulário:", formData);
      form.reset(formData);

      // Atualizar previews de imagem
      if (apiData.logo && logoPreview !== apiData.logo) {
        setLogoPreview(apiData.logo);
      }

      if (apiData.Banner && apiData.Banner.length > 0) {
        setBannerPreviews(apiData.Banner);
      }

      setIsInitialDataLoaded(true);
      setIsFormReady(true);
      console.log("✅ Formulário carregado com sucesso");
    } catch (error) {
      console.error("❌ Erro ao carregar dados do formulário:", error);
    }
  }, [configEnterprise.data, isInitialDataLoaded, form, logoPreview]);

  // Effect para carregar dados quando a API estiver pronta
  useEffect(() => {
    if (
      configEnterprise.isSuccess &&
      configEnterprise.data &&
      !isLoadingPrinters &&
      !isInitialDataLoaded
    ) {
      loadFormData();
    }
  }, [
    configEnterprise.isSuccess,
    configEnterprise.data,
    isLoadingPrinters,
    isInitialDataLoaded,
    loadFormData,
  ]);

  // Effect para resetar o formulário quando necessário
  useEffect(() => {
    if (isFormReady && configEnterprise.data?.data) {
      const apiData = configEnterprise.data.data;
      const currentValues = form.getValues();

      // Verificar se os dados mudaram e precisam ser atualizados
      const needsUpdate =
        currentValues.name !== (apiData.name || "") ||
        currentValues.email !== (apiData.email || "") ||
        currentValues.phone !== (apiData.phone || "") ||
        currentValues.pdvIntegrations !== (apiData.pdvIntegrations || "OMIE") ||
        currentValues.typeService !== (apiData.typeService || "TABLE");

      if (needsUpdate) {
        console.log("🔄 Atualizando formulário com novos dados");
        loadFormData();
      }
    }
  }, [configEnterprise.data, isFormReady, form, loadFormData]);

  // Renderização dos selects
  const renderPrinterSelect = (
    field: any,
    label: string,
    description: string
  ) => (
    <FormField
      control={form.control}
      name={field.name}
      render={({ field: selectField }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={selectField.onChange}
            value={selectField.value}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a impressora" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {printers?.map((printer: Printer) => (
                <SelectItem key={printer.id} value={printer.id || ""}>
                  {printer.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>{description}</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="space-y-8">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">Configurações da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          {configEnterprise.isLoading || !isFormReady ? (
            <SettingsFormSkeleton />
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                {/* Seção de Informações Básicas */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Informações Básicas</h3>
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
                              {...field}
                              ref={withMask("(99) 99999-9999", {
                                showMaskOnHover: false,
                              })}
                              placeholder="(XX) XXXXX-XXXX"
                              type="tel"
                              maxLength={15}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="typeService"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Serviço</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o tipo de serviço" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="TABLE">Mesa</SelectItem>
                                <SelectItem value="TABLE_COMMANDED">
                                  Mesa Comanda
                                </SelectItem>
                                <SelectItem value="COMMANDED">
                                  Comanda
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="adminPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha Administrativa</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Digite a senha administrativa"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Seção de Logo */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Logo da Empresa</h3>
                  <div className="flex flex-col items-center gap-4">
                    <Label
                      htmlFor="logo-upload"
                      className="cursor-pointer relative group"
                    >
                      <Avatar className="size-24 rounded-md transition-all duration-200 group-hover:opacity-80">
                        {logoPreview ? (
                          <AvatarImage
                            src={logoPreview}
                            alt="Logo da empresa"
                          />
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

                {/* Seção de Banners */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Banners</h3>
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
                          onClick={() => removeBanner(index, preview.id)}
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

                {/* Seção de Integração PDV */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Integração PDV</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="pdvIntegrations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de Integração</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              setIntegrationType(value);
                              field.onChange(value);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione o tipo de integração" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OMIE">OMIE</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Selecione o sistema que deseja integrar com sua
                            aplicação
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {integrationType == "OMIE" && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg">
                            <img src="https://www.omie.com.br/assets/images/logo-omie.png" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-6">
                            <div>
                              <p className="text-sm text-muted-foreground mb-4">
                                Integre sua conta OMIE para sincronização de
                                dados financeiros e estoque
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                  control={form.control}
                                  name="omieAppKey"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>App Key</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="Digite a App Key da OMIE"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="omieSecretKey"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Secret Key</FormLabel>
                                      <FormControl>
                                        <Input
                                          type="password"
                                          placeholder="Digite a Secret Key da OMIE"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Seção de Impressoras */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">
                    Configurações de Impressora
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    {renderPrinterSelect(
                      { name: "printerNotification" },
                      "Impressora de Notificação para Garçom",
                      "Selecione a impressora que será usada para notificações do garçom"
                    )}
                    {renderPrinterSelect(
                      { name: "printerBill" },
                      "Impressora de Solicitação de Conta",
                      "Selecione a impressora que será usada para solicitações de conta"
                    )}
                  </div>
                </div>

                <CardFooter className="px-0 flex justify-end">
                  <Button type="submit" size="lg">
                    Salvar Alterações
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>

      {/* Seção do QR Code para Download do App */}
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-2xl">
            Download do App Bistro Menu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-4">
            <div className="p-4 bg-white rounded-lg">
              <QRCodeSVG
                value="http://s3.bistro.app.br/filesapibistro/bistro-menu.apk"
                size={200}
                level="H"
              />
            </div>
            <p className="text-center text-muted-foreground">
              Escaneie o QR Code para baixar o app Bistro Menu
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
