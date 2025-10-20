"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiAddLine,
  RiCloseLine,
  RiInformationLine,
  RiQrCodeFill,
  RiRefreshLine,
  RiSettingsLine,
  RiUpload2Line,
} from "@remixicon/react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  printerNotification: { id: string; nome: string; ip: string; porta: number };
  printerBill: { id: string; nome: string; ip: string; porta: number };
  adminPassword: string; // Added field for admin password
  typeService: "TABLE" | "TABLE_COMMANDED" | "COMMANDED"; // Added field for type service
  printerServerUrl: string;
  printerServerPort: string;
  printerServerToken: string;
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
  printerServerToken: z.string().optional(),
  printerServerUrl: z.string().optional(),
  printerServerPort: z.number().optional(),
  typeService: z.enum(["TABLE", "TABLE_COMMANDED", "COMMANDED"], {
    required_error: "Por favor, selecione o tipo de serviço",
  }),
  adminPassword: z
    .string()
    .min(1, { message: "Senha Administrativa é obrigatória" }), // Added validation for admin password
});

type FormValues = z.infer<typeof formSchema>;

export function CompanySettingsForm() {
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
      printerNotification: "none",
      printerBill: "none",
      typeService: "TABLE",
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
        printerNotification: apiData?.printerNotification?.id ?? "none",
        printerBill: apiData?.printerBill?.id ?? "none",
        omieAppKey: apiData.integrationOmie?.omie_key || "",
        omieSecretKey: apiData.integrationOmie?.omie_secret || "",
        adminPassword: apiData.adminPassword || "",
        typeService: apiData.typeService || "TABLE",
        printerServerUrl: apiData.printerServerUrl || "",
        printerServerPort: Number(apiData.printerServerPort) || 5572,
        printerServerToken: apiData.printerServerToken || "",
      };

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
    } catch (error) {
      console.log(error);
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
        currentValues.typeService !== (apiData.typeService || "TABLE") ||
        currentValues.printerServerUrl !== (apiData.printerServerUrl || "") ||
        currentValues.printerServerPort !==
          (apiData.printerServerPort || 5572) ||
        currentValues.printerServerToken !== (apiData.printerServerToken || "");

      if (needsUpdate) {
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
            onValueChange={(v) => selectField.onChange(v === "none" ? "" : v)}
            value={selectField.value || "none"} // se vazio, mostra o placeholder
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a impressora" />
              </SelectTrigger>
            </FormControl>

            <SelectContent>
              <SelectItem value="none">Nenhuma</SelectItem>

              {printers?.map((printer: Printer) => (
                <SelectItem key={printer.id} value={printer.id || ""}>
                  {printer.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <FormDescription>{description}</FormDescription>
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
                <Tabs defaultValue="dados-empresa" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger
                      value="dados-empresa"
                      className="flex items-center gap-2"
                    >
                      <RiInformationLine size={16} />
                      Dados da Empresa
                    </TabsTrigger>
                    <TabsTrigger
                      value="configuracoes-empresa"
                      className="flex items-center gap-2"
                    >
                      <RiSettingsLine size={16} />
                      Configurações
                    </TabsTrigger>
                    <TabsTrigger
                      value="qr-code"
                      className="flex items-center gap-2"
                    >
                      <RiQrCodeFill size={16} />
                      QR Code
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="dados-empresa" className="space-y-8">
                    <div className="overflow-y-auto h-[calc(100vh-23rem)] space-y-4">
                      {/* Seção de Informações Básicas */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <RiAddLine size={20} />
                            Informações Básicas
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                      //@ts-ignore
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
                                        <SelectItem value="TABLE">
                                          Mesa
                                        </SelectItem>
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
                          </div>
                        </CardContent>
                      </Card>

                      {/* Seção de Logo */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <RiUpload2Line size={20} />
                            Logo da Empresa
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center gap-4">
                            <Label
                              htmlFor="logo-upload"
                              className="cursor-pointer relative group"
                            >
                              <Avatar className="size-32 rounded-lg transition-all duration-200 group-hover:opacity-80 shadow-lg">
                                {logoPreview ? (
                                  <AvatarImage
                                    src={logoPreview}
                                    alt="Logo da empresa"
                                    className="object-cover"
                                  />
                                ) : (
                                  <AvatarFallback className="bg-muted text-muted-foreground text-xl">
                                    Logo
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <div className="bg-black/50 rounded-lg flex items-center justify-center w-full h-full">
                                  <RiUpload2Line
                                    className="text-white"
                                    size={32}
                                  />
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
                              Clique na imagem para carregar o logo da empresa
                              <br />
                              Formatos aceitos: JPG, PNG, SVG (recomendado:
                              200x200px)
                            </FormDescription>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Seção de Banners */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <RiAddLine size={20} />
                            Banners Promocionais
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Adicione até 5 imagens para exibir no app do cliente
                          </p>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {bannerPreviews.map((preview, index) => (
                              <div
                                key={index}
                                className="relative aspect-video rounded-lg overflow-hidden border bg-muted shadow-sm"
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
                                  className="absolute top-2 right-2 size-7 rounded-full shadow-lg"
                                  onClick={() =>
                                    removeBanner(index, preview.id)
                                  }
                                >
                                  <RiCloseLine size={16} />
                                </Button>
                              </div>
                            ))}

                            {bannerPreviews.length < 5 && (
                              <Label
                                htmlFor="banner-upload"
                                className="cursor-pointer flex flex-col items-center justify-center aspect-video rounded-lg border border-dashed bg-muted/50 hover:bg-muted transition-colors"
                              >
                                <RiAddLine
                                  size={32}
                                  className="mb-2 text-muted-foreground"
                                />
                                <span className="text-sm text-muted-foreground font-medium">
                                  Adicionar Banner
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {bannerPreviews.length}/5
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
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="configuracoes-empresa"
                    className="space-y-8"
                  >
                    {/* Seção de Segurança */}
                    <div className="overflow-y-auto h-[calc(100vh-23rem)] space-y-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <RiAddLine size={20} />
                            Segurança e Acesso
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
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
                                <FormDescription>
                                  Senha para acessar configurações
                                  administrativas do sistema
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      {/* Seção de Integração PDV */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <RiAddLine size={20} />
                            Integração com Sistema PDV
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Configure a integração com sistemas externos para
                            sincronização de dados
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                                    <SelectItem value="NONE">Vazio</SelectItem>
                                    <SelectItem value="OMIE">OMIE</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormDescription>
                                  Selecione o sistema que deseja integrar com
                                  sua aplicação
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          {integrationType === "OMIE" && (
                            <div className="border rounded-lg p-4 bg-muted/30">
                              <div className="flex items-center gap-3 mb-4">
                                <img
                                  src="https://www.omie.com.br/assets/images/logo-omie.png"
                                  alt="OMIE Logo"
                                  className="h-8"
                                />
                                <div>
                                  <h4 className="font-semibold">
                                    Integração OMIE
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    Sincronize dados financeiros e de estoque
                                  </p>
                                </div>
                              </div>
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
                          )}
                        </CardContent>
                      </Card>

                      {/* Seção print server */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <RiAddLine size={20} />
                            Configurações de Print Server
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Configure o print server para diferentes
                            funcionalidades do sistema
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          <FormField
                            control={form.control}
                            name="printerServerUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>IP do Print Server</FormLabel>
                                <FormControl>
                                  <Input
                                    type="text"
                                    placeholder="Digite a IP do Print Server"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="printerServerPort"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Porta do Print Server</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={Number(field.value)}
                                    onChange={(
                                      e: React.ChangeEvent<HTMLInputElement>
                                    ) => {
                                      const value = e.currentTarget.value;
                                      field.onChange(Number(value));
                                    }}
                                    type="number"
                                    placeholder="Digite a Porta do Print Server"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="printerServerToken"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Token do Print Server</FormLabel>
                                <div className="flex items-center gap-2">
                                  <FormControl>
                                    <Input
                                      onClick={(
                                        e: React.MouseEvent<HTMLInputElement>
                                      ) => {
                                        e.preventDefault();
                                        (e.target as HTMLInputElement).select();
                                        navigator.clipboard.writeText(
                                          e.currentTarget.value || ""
                                        );
                                      }}
                                      readOnly
                                      type="text"
                                      placeholder="Digite a Token do Print Server"
                                      {...field}
                                    />
                                  </FormControl>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    type="button"
                                    onClick={() => {
                                      field.onChange(uuid());
                                    }}
                                  >
                                    <RiRefreshLine size={16} />
                                  </Button>
                                </div>
                                <FormDescription>
                                  Alterar esse token pode parar o print server
                                </FormDescription>
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>

                      {/* Seção de Impressoras */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <RiAddLine size={20} />
                            Configurações de Impressora
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Configure as impressoras para diferentes
                            funcionalidades do sistema
                          </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
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
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                  <TabsContent value="qr-code" className="space-y-8">
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
                  </TabsContent>
                </Tabs>

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
    </div>
  );
}
