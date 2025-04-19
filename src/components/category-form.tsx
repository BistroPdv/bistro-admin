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
import { SwitchWithText } from "@/components/ui/switch-with-text";
import api from "@/lib/api";
import { Printer } from "@/schemas/printer-schema";
import { ChevronDown, Plus, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as z from "zod";
import { ImportOptionsModal } from "./import-options-modal";

const adicionalSchema = z.object({
  id: z.string().optional(),
  titulo: z.string().min(1, "O título do adicional é obrigatório"),
  qtdMinima: z.number().min(0, "A quantidade mínima não pode ser negativa"),
  qtdMaxima: z.number().min(1, "A quantidade máxima deve ser pelo menos 1"),
  obrigatorio: z.boolean().default(false),
  ativo: z.boolean().default(true),
  opcoes: z.array(
    z.object({
      id: z.string().optional(),
      codIntegra: z.string().optional(),
      nome: z.string().min(1, "O nome da opção é obrigatório"),
      preco: z.string().optional(),
      ativo: z.boolean().default(true),
      isImported: z.boolean().optional(),
    })
  ),
});

const categoryFormSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome da categoria é obrigatório"),
  cor: z.string().min(1, "A cor da categoria é obrigatória"),
  impressoraId: z.string().optional(),
  ativo: z.boolean().default(true),
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
  ativo: boolean;
  opcoes: {
    id?: string;
    codIntegra?: string;
    nome: string;
    preco?: string;
    ativo: boolean;
    isImported?: boolean;
  }[];
}

type AdicionalFields =
  | "titulo"
  | "qtdMinima"
  | "qtdMaxima"
  | "obrigatorio"
  | "ativo"
  | "opcoes";
type OpcaoFields = "codIntegra" | "nome" | "preco" | "ativo";

export function CategoryForm({ category, onRefresh }: CategoryFormProps) {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [expandedAdicionais, setExpandedAdicionais] = useState<number[]>([]);
  const adicionaisIniciais: Adicional[] = [];

  if (category?.adicionais && category.adicionais.length > 0) {
    category.adicionais.forEach((adicional) => {
      adicionaisIniciais.push({
        id: adicional.id,
        titulo: adicional.titulo,
        qtdMinima: adicional.qtdMinima,
        qtdMaxima: adicional.qtdMaxima,
        obrigatorio: adicional.obrigatorio,
        ativo: adicional.ativo,
        opcoes:
          adicional.opcoes?.map((opcao) => ({
            id: opcao.id, // Preservando o ID da opção
            ...opcao,
            preco: opcao.preco?.toString() || "",
            ativo: opcao.ativo,
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
      ativo: true,
      opcoes: (category.opcoesAdicionais || []).map((opcao) => ({
        id: opcao.id, // Preservando o ID da opção se existir
        ...opcao,
        preco: String(opcao.preco) || "",
        ativo: true,
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
      impressoraId: category?.Impressora?.id || undefined,
      ativo: category?.ativo || true,
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
    const novoAdicional: Adicional = {
      titulo: "",
      qtdMinima: 0,
      qtdMaxima: 1,
      obrigatorio: false,
      ativo: true,
      opcoes: [],
    };
    const novosAdicionais = [...adicionais, novoAdicional];
    setAdicionais(novosAdicionais);
    form.setValue("adicionais", novosAdicionais);
    setExpandedAdicionais([...expandedAdicionais, novosAdicionais.length - 1]);
  };

  const toggleAdicional = (index: number) => {
    setExpandedAdicionais((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleRemoveAdicional = (index: number) => {
    const newAdicionais = [...adicionais];
    newAdicionais.splice(index, 1);
    setAdicionais(newAdicionais);
    form.setValue("adicionais", newAdicionais);
  };

  const handleAdicionalChange = (
    adicionalIndex: number,
    field: AdicionalFields,
    value: string | number | boolean | Adicional["opcoes"]
  ) => {
    const newAdicionais = [...adicionais];
    newAdicionais[adicionalIndex] = {
      ...newAdicionais[adicionalIndex],
      [field]: value,
    };
    setAdicionais(newAdicionais);
    form.setValue("adicionais", newAdicionais);
  };

  const handleAddOpcao = (adicionalIndex: number) => {
    const newAdicionais = [...adicionais];
    newAdicionais[adicionalIndex].opcoes.push({
      nome: "",
      preco: "",
      ativo: true,
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
    field: OpcaoFields,
    value: string | boolean
  ) => {
    const newAdicionais = [...adicionais];
    const opcao = newAdicionais[adicionalIndex].opcoes[opcaoIndex];
    newAdicionais[adicionalIndex].opcoes[opcaoIndex] = {
      ...opcao,
      [field]: value,
    };
    setAdicionais(newAdicionais);
    form.setValue("adicionais", newAdicionais);
  };

  const handleSubmit = async (data: CategoryFormValues) => {
    try {
      // console.log(data);
      // Incluir o ID da categoria se estiver editando
      if (category?.id) {
        data.id = category.id;
      }

      // Garantir que o campo ativo seja enviado
      data.ativo = data.ativo ?? true;

      // Remover o campo impressoraId se estiver vazio ou "none"
      if (!data.impressoraId || data.impressoraId === "none") {
        const { impressoraId, ...dataWithoutPrinter } = data;
        data = dataWithoutPrinter as CategoryFormValues;
      }

      // Garantir que os campos ativo dos adicionais estejam presentes
      if (data.adicionais) {
        data.adicionais = data.adicionais.map((adicional) => ({
          ...adicional,
          ativo: adicional.ativo ?? true,
          opcoes: adicional.opcoes.map((opcao) => ({
            ...opcao,
            ativo: opcao.ativo ?? true,
          })),
        }));
      }

      if (!data.id) {
        const resp = await api.post("/categorias", { ...data });
        if (resp.status === 201 || resp.status === 200) {
          toast.success("Categoria criada com sucesso!");
          onRefresh?.();
        }
      } else {
        console.log(data);
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
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="h-[calc(100vh-200px)] flex flex-col"
      >
        {/* Cabeçalho fixo */}
        <div className="flex-none space-y-4">
          {category?.id && (
            <FormField
              control={form.control}
              name="id"
              render={({ field }) => <input type="hidden" {...field} />}
            />
          )}

          <div className="flex flex-row gap-4">
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

            <FormField
              control={form.control}
              name="ativo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ativo?</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === "sim")}
                    value={field.value ? "sim" : "nao"}
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
                  <FormDescription>Categoria está ativa?</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <FormLabel className="text-lg">Grupo de adicionais</FormLabel>
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
        </div>

        {/* Área de rolagem dos adicionais */}
        <div className="flex-1 overflow-y-auto mt-4">
          <div className="space-y-4">
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
                className="border rounded-lg bg-muted/20 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="flex items-center justify-between p-4 cursor-pointer"
                  onClick={() => toggleAdicional(adicionalIndex)}
                >
                  <div className="flex items-center gap-2">
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedAdicionais.includes(adicionalIndex)
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                    <h4 className="font-medium text-lg">
                      {form.getValues(`adicionais.${adicionalIndex}.titulo`) ||
                        "Novo Grupo de Adicionais"}
                    </h4>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAdicional(adicionalIndex);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir grupo</span>
                  </Button>
                </div>

                {expandedAdicionais.includes(adicionalIndex) && (
                  <div className="p-4 border-t space-y-4">
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
                        <div>
                          <FormItem>
                            <FormLabel>Ativo?</FormLabel>
                            <Select
                              value={adicional.ativo ? "sim" : "nao"}
                              onValueChange={(value) =>
                                handleAdicionalChange(
                                  adicionalIndex,
                                  "ativo",
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
                          </FormItem>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FormLabel>Opções do Adicional</FormLabel>
                          <div className="flex gap-2">
                            <ImportOptionsModal
                              onImport={(selectedOptions) => {
                                const newOpcoes = [...adicional.opcoes];
                                newOpcoes.push({
                                  id: undefined,
                                  codIntegra:
                                    selectedOptions.codigo_produto.toString(),
                                  nome: selectedOptions.descricao,
                                  preco: selectedOptions.valor_unitario,
                                  ativo: true,
                                });
                                handleAdicionalChange(
                                  adicionalIndex,
                                  "opcoes",
                                  newOpcoes
                                );
                              }}
                            />
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
                              <div className="flex flex-row gap-2 items-center w-full">
                                <SwitchWithText
                                  checked={opcao.ativo}
                                  onCheckedChange={(checked) =>
                                    handleOpcaoChange(
                                      adicionalIndex,
                                      opcaoIndex,
                                      "ativo",
                                      checked
                                    )
                                  }
                                  uncheckText="Não"
                                  checkText="Sim"
                                />
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
                                  className="w-32 text-sm"
                                  disabled={opcao.isImported}
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
                                  className="w-full text-sm sm:col-span-2"
                                />
                                <div className="flex items-center gap-1">
                                  <div className="relative flex-1">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
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
                                      className="pl-6 text-sm"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8 border-red-200 hover:bg-red-100 hover:text-red-600"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveOpcao(
                                        adicionalIndex,
                                        opcaoIndex
                                      );
                                    }}
                                    title="Excluir opção"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
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
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé fixo */}
        <div className="flex-none border-t p-4 mt-4">
          <div className="flex justify-end gap-2">
            <Button type="submit" className="gap-2">
              <Save className="h-4 w-4" />
              {category ? "Salvar Alterações" : "Adicionar Categoria"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
