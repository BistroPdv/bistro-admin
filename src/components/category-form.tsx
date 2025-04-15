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
import { Plus, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import * as z from "zod";

const adicionalSchema = z.object({
  titulo: z.string().min(1, "O título do adicional é obrigatório"),
  qtdMinima: z.number().min(0, "A quantidade mínima não pode ser negativa"),
  qtdMaxima: z.number().min(1, "A quantidade máxima deve ser pelo menos 1"),
  opcoes: z.array(
    z.object({
      codIntegra: z.string().optional(),
      nome: z.string().min(1, "O nome da opção é obrigatório"),
      preco: z.string().optional(),
    })
  ),
});

const categoryFormSchema = z.object({
  nome: z.string().min(1, "O nome da categoria é obrigatório"),
  cor: z.string().min(1, "A cor da categoria é obrigatória"),
  adicionais: z.array(adicionalSchema).optional(),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  onSubmit: (data: CategoryFormValues) => void;
  category?: Category;
}

interface Adicional {
  titulo: string;
  qtdMinima: number;
  qtdMaxima: number;
  opcoes: { codIntegra?: string; nome: string; preco?: string }[];
}

export function CategoryForm({ onSubmit, category }: CategoryFormProps) {
  // Converter os dados antigos para o novo formato, se necessário
  const adicionaisIniciais: Adicional[] = [];

  if (
    category?.tipoAdicional === "adicional_fixo" &&
    category?.tituloAdicionalFixo
  ) {
    adicionaisIniciais.push({
      titulo: category.tituloAdicionalFixo,
      qtdMinima: 0,
      qtdMaxima: 1,
      opcoes: category.opcoesAdicionais || [],
    });
  }

  const [adicionais, setAdicionais] = useState<Adicional[]>(adicionaisIniciais);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      nome: category?.nome || "",
      cor: category?.cor || "#000000",
      adicionais: adicionaisIniciais,
    },
  });

  const handleAddAdicional = () => {
    setAdicionais([
      ...adicionais,
      { titulo: "", qtdMinima: 0, qtdMaxima: 1, opcoes: [] },
    ]);
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
      newAdicionais[index][field] = value;
    }
    setAdicionais(newAdicionais);
    form.setValue("adicionais", newAdicionais);
  };

  const handleAddOpcao = (adicionalIndex: number) => {
    const newAdicionais = [...adicionais];
    newAdicionais[adicionalIndex].opcoes.push({
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
    field: "codIntegra" | "nome" | "preco",
    value: string
  ) => {
    const newAdicionais = [...adicionais];
    newAdicionais[adicionalIndex].opcoes[opcaoIndex][field] = value;
    setAdicionais(newAdicionais);
    form.setValue("adicionais", newAdicionais);
  };

  const handleSubmit = (data: CategoryFormValues) => {
    // Garantir que adicionais esteja definido no objeto data
    data.adicionais = adicionais;
    console.log(data);
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-4">
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

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel>Adicionais</FormLabel>
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
                    Adicional {adicionalIndex + 1}
                  </h4>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveAdicional(adicionalIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-3 md:col-span-1">
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input
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
                            type="number"
                            min="0"
                            value={adicional.qtdMinima}
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
                            type="number"
                            min="1"
                            value={adicional.qtdMaxima}
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
                                value={opcao.preco}
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
                              variant="destructive"
                              size="icon"
                              onClick={() =>
                                handleRemoveOpcao(adicionalIndex, opcaoIndex)
                              }
                            >
                              <Trash2 className="h-4 w-4" />
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
