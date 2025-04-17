"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Category } from "@/@types/products";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { Printer } from "@/schemas/printer-schema";
import { Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";

const adicionalSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(1, "O título do adicional é obrigatório"),
  qtdMinima: z.number().min(0, "A quantidade mínima não pode ser negativa"),
  qtdMaxima: z.number().min(1, "A quantidade máxima deve ser pelo menos 1"),
  obrigatorio: z.boolean().default(false),
  opcoes: z.array(
    z.object({
      id: z.string().optional(),
      codIntegra: z.string().optional(),
      nome: z.string().min(1, "O nome da opção é obrigatório"),
      preco: z.string().optional(),
    })
  ),
});

const categoryFormSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome da categoria é obrigatório"),
  cor: z.string().min(1, "A cor da categoria é obrigatória"),
  impressoraId: z.string().optional(),
  adicionais: z.array(adicionalSchema).optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  onRefresh: () => void;
  category?: Category;
}

interface Adicional {
  id?: string;
  titulo: string;
  qtdMinima: number;
  qtdMaxima: number;
  obrigatorio: boolean;
  opcoes: { id?: string; codIntegra?: string; nome: string; preco?: string }[];
}

export function CategoryForm({ category, onRefresh }: CategoryFormProps) {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const adicionaisIniciais: Adicional[] = [];

  if (category?.adicionais && category.adicionais.length > 0) {
    category.adicionais.forEach((adicional) => {
      adicionaisIniciais.push({
        id: adicional.id,
        titulo: adicional.titulo,
        qtdMinima: adicional.qtdMinima,
        qtdMaxima: adicional.qtdMaxima,
        obrigatorio: adicional.obrigatorio,
        opcoes:
          adicional.opcoes?.map((opcao) => ({
            id: opcao.id, // Preservando o ID da opção
            ...opcao,
            preco: opcao.preco?.toString() || "",
          })) || [],
      });
    });
  } else if (
    category?.tipoAdicional === "adicional_fixo" &&
    category?.tituloAdicionalFixo
  ) {
    adicionaisIniciais.push({
      id: category.id,
      titulo: category.tituloAdicionalFixo,
      qtdMinima: 0,
      qtdMaxima: 1,
      obrigatorio: false,
      opcoes: (category.opcoesAdicionais || []).map((opcao) => ({
        id: opcao.id, // Preservando o ID da opção se existir
        ...opcao,
        preco: String(opcao.preco) || "",
      })),
    });
  }

  const [adicionais, setAdicionais] = useState<Adicional[]>(adicionaisIniciais);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      id: category?.id,
      nome: category?.nome || "",
      cor: category?.cor || "#000000",
      impressoraId: category?.Impressora?.id || "",
      adicionais: adicionaisIniciais,
    },
  });

  useEffect(() => {
    const fetchPrinters = async () => {
      try {
        // Obter o CNPJ do restaurante do localStorage ou de onde estiver armazenado
        const cnpjData = JSON.parse(localStorage.getItem("user") || "{}");
        const response = await api.get(
          `/restaurantCnpj/${cnpjData.restaurantCnpj}/printers`
        );
        if (response.data) {
          setPrinters(response.data?.data);
        }
      } catch (error) {
        console.error("Erro ao carregar impressoras:", error);
      }
    };

    fetchPrinters();
  }, []);

  const handleAddAdicional = () => {
    const novoAdicional = {
      titulo: "",
      qtdMinima: 0,
      qtdMaxima: 1,
      obrigatorio: false,
      opcoes: [],
    };
    const novosAdicionais = [...adicionais, novoAdicional];
    setAdicionais(novosAdicionais);
    form.setValue("adicionais", novosAdicionais);
  };

  const handleRemoveAdicional = (index: number) => {
    const newAdicionais = [...adicionais];
    newAdicionais.splice(index, 1);
    setAdicionais(newAdicionais);
    form.setValue("adicionais", newAdicionais);
  };

  const handleAdicionalChange = (
    index: number,
    field: keyof Adicional,
    value: any
  ) => {
    const newAdicionais = [...adicionais];
    if (field === "opcoes") {
      newAdicionais[index][field] = value;
    } else if (field === "qtdMinima" || field === "qtdMaxima") {
      newAdicionais[index][field] = Number(value);
    } else {
      //@ts-ignore
      newAdicionais[index][field] = value;
    }
    setAdicionais(newAdicionais);
    form.setValue("adicionais", newAdicionais);
  };

  const handleAddOpcao = (adicionalIndex: number) => {
    const newAdicionais = [...adicionais];
    newAdicionais[adicionalIndex].opcoes.push({
      id: undefined, // Adicionando campo id para novas opções
      nome: "",
      preco: "",
      codIntegra: "",
    });
    setAdicionais(newAdicionais);
    form.setValue("adicionais", newAdicionais);
  };

  const handleRemoveOpcao = (adicionalIndex: number, opcaoIndex: number) => {
    const newAdicionais = [...adicionais];
    newAdicionais[adicionalIndex].opcoes.splice(opcaoIndex, 1);
    setAdicionais(newAdicionais);
    form.setValue("adicionais", newAdicionais);
  };

  const handleOpcaoChange = (
    adicionalIndex: number,
    opcaoIndex: number,
    field: "codIntegra" | "nome" | "preco" | "id",
    value: string
  ) => {
    const newAdicionais = [...adicionais];
    newAdicionais[adicionalIndex].opcoes[opcaoIndex][field] = value;
    setAdicionais(newAdicionais);
    form.setValue("adicionais", newAdicionais);
  };

  const handleSubmit = async (data: CategoryFormValues) => {
    try {
      // Incluir o ID da categoria se estiver editando
      if (category?.id) {
        data.id = category.id;
      }

      // Converter "none" para string vazia ou null para o backend
      if (data.impressoraId === "none") {
        data.impressoraId = "";
      }

      if (!data.id) {
        const resp = await api.post("/categorias", { ...data });
        if (resp.status === 201 || resp.status === 200) {
          toast.success("Categoria criada com sucesso!");
          onRefresh?.();
        }
      } else {
        const resp = await api.put(`/categorias/${data.id}`, { ...data });
        if (resp.status === 200) {
          toast.success("Categoria atualizada com sucesso!");
          onRefresh?.();
        }
      }
    } catch (error) {
      console.error("Erro ao processar categoria:", error);
      toast.error("Erro ao salvar categoria. Tente novamente.");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
          {/* Campo oculto para o ID */}
          {category?.id && (
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => <input type="hidden" {...field} />}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Lanches" {...field} />
                  </FormControl>
                  <FormDescription>
                    Digite o nome da categoria que será exibida no cardápio.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="impressoraId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Impressora</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma impressora" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhuma</SelectItem>
                      {printers?.map((printer) => (
                        <SelectItem key={printer.id} value={printer.id || ""}>
                          {printer.nome}
                        </SelectItem>
                      )) || []}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione a impressora para esta categoria
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Grupo de adicionais</FormLabel>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={handleAddAdicional}
              >
                <Plus className="h-4 w-4" />
                Adicionar Grupo
              </Button>
            </div>

            {adicionais.length === 0 && (
              <div className="text-center p-4 border rounded-md bg-muted/20">
                <p className="text-muted-foreground">
                  Nenhum adicional configurado
                </p>
              </div>
            )}

            {adicionais.map((adicional, adicionalIndex) => (
              <div
                key={adicionalIndex}
                className="space-y-4 p-4 border rounded-md bg-muted/20"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">
                    {form.getValues(`adicionais.${adicionalIndex}.titulo`)}
                  </h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveAdicional(adicionalIndex)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir grupo</span>
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4 w-full">
                    <div className="w-full">
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input
                            className="flex-1"
                            value={adicional.titulo}
                            onChange={(e) =>
                              handleAdicionalChange(
                                adicionalIndex,
                                "titulo",
                                e.target.value
                              )
                            }
                            placeholder="Ex: Ponto da Carne"
                          />
                        </FormControl>
                        <FormDescription>
                          Título do grupo de adicionais
                        </FormDescription>
                      </FormItem>
                    </div>
                    <div>
                      <FormItem>
                        <FormLabel>Qtd. Mínima</FormLabel>
                        <FormControl>
                          <Input
                            className="w-32"
                            type="number"
                            min="0"
                            value={String(adicional.qtdMinima)}
                            onChange={(e) =>
                              handleAdicionalChange(
                                adicionalIndex,
                                "qtdMinima",
                                e.target.value
                              )
                            }
                            placeholder="0"
                          />
                        </FormControl>
                        <FormDescription>Mínimo de opções</FormDescription>
                      </FormItem>
                    </div>
                    <div>
                      <FormItem>
                        <FormLabel>Qtd. Máxima</FormLabel>
                        <FormControl>
                          <Input
                            className="w-32"
                            type="number"
                            min="1"
                            value={String(adicional.qtdMaxima)}
                            onChange={(e) =>
                              handleAdicionalChange(
                                adicionalIndex,
                                "qtdMaxima",
                                e.target.value
                              )
                            }
                            placeholder="1"
                          />
                        </FormControl>
                        <FormDescription>Máximo de opções</FormDescription>
                      </FormItem>
                    </div>
                    <div>
                      <FormItem className="w-32">
                        <FormLabel>Obrigatório</FormLabel>
                        <Select
                          value={adicional.obrigatorio ? "sim" : "nao"}
                          onValueChange={(value) =>
                            handleAdicionalChange(
                              adicionalIndex,
                              "obrigatorio",
                              value === "sim"
                            )
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sim">Sim</SelectItem>
                            <SelectItem value="nao">Não</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>É obrigatório?</FormDescription>
                      </FormItem>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel>Opções do Adicional</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={() => handleAddOpcao(adicionalIndex)}
                      >
                        <Plus className="h-4 w-4" />
                        Adicionar Opção
                      </Button>
                    </div>

                    {adicional.opcoes.length === 0 && (
                      <div className="text-center p-2 border rounded-md bg-background/50">
                        <p className="text-sm text-muted-foreground">
                          Nenhuma opção adicionada
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {adicional.opcoes.map((opcao, opcaoIndex) => (
                        <div
                          key={opcaoIndex}
                          className="flex flex-col sm:flex-row items-start sm:items-center gap-2"
                        >
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
                            <Input
                              value={opcao.codIntegra}
                              onChange={(e) =>
                                handleOpcaoChange(
                                  adicionalIndex,
                                  opcaoIndex,
                                  "codIntegra",
                                  e.target.value
                                )
                              }
                              placeholder="Codigo"
                              className="w-full"
                            />
                            <Input
                              value={opcao.nome}
                              onChange={(e) =>
                                handleOpcaoChange(
                                  adicionalIndex,
                                  opcaoIndex,
                                  "nome",
                                  e.target.value
                                )
                              }
                              placeholder="Ex: Bem passada"
                              className="w-full sm:col-span-2"
                            />
                          </div>
                          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <div className="relative flex-1 sm:w-32">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                R$
                              </span>
                              <Input
                                value={String(opcao.preco)}
                                onChange={(e) =>
                                  handleOpcaoChange(
                                    adicionalIndex,
                                    opcaoIndex,
                                    "preco",
                                    e.target.value
                                  )
                                }
                                placeholder="0,00"
                                className="pl-10"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="border-red-200 hover:bg-red-100 hover:text-red-600"
                              onClick={() =>
                                handleRemoveOpcao(adicionalIndex, opcaoIndex)
                              }
                              title="Excluir opção"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <FormDescription>
                      Adicione as opções disponíveis para este adicional.
                    </FormDescription>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" className="gap-2">
            <Save className="h-4 w-4" />
            {category ? "Salvar Alterações" : "Adicionar Categoria"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
