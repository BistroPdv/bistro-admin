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
  Product,
  ProductFormValues,
  productFormSchema,
} from "@/schemas/product-schema";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { FileUpload } from "./ui/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

interface ProductFormProps {
  categories: Category[];
  onSubmit: (data: ProductFormValues) => void;
  product?: Product;
}

export function ProductForm({
  categories,
  onSubmit,
  product,
}: ProductFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nome: product?.nome || "",
      descricao: product?.descricao || "",
      preco: product?.preco ? product.preco.toString() : "",
      categoriaId: product?.categoriaId || "",
      imagem: undefined,
    },
  });

  const handleSubmit = (data: ProductFormValues) => {
    // Adiciona o arquivo de imagem aos dados do formulário
    data.imagem = imageFile;
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: X-Burger" {...field} />
                  </FormControl>
                  <FormDescription>
                    Digite o nome do produto que será exibido no cardápio.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ex: Hambúrguer com queijo, alface e tomate"
                      className="min-h-24 resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descreva os ingredientes ou características do produto.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <Input placeholder="25,90" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Digite o preço do produto (use vírgula como separador
                    decimal).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoriaId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="text-destructive mr-1">*</span>
                    Categoria
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center gap-2">
                            {category.cor && (
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: category.cor }}
                              />
                            )}
                            {category.nome}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Selecione a categoria do produto.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div>
            <FormItem>
              <FormLabel>Imagem do Produto</FormLabel>
              <div className="border border-dashed rounded-lg p-4 bg-muted/30">
                <FileUpload
                  onChange={setImageFile}
                  previewUrl={product?.imagem}
                  label="Selecionar imagem do produto"
                />
                <FormDescription className="mt-2">
                  Faça upload de uma imagem para o produto. Formatos aceitos:
                  JPG, PNG.
                </FormDescription>
              </div>
            </FormItem>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="submit" className="gap-2">
            <PlusCircle className="h-4 w-4" />
            {product ? "Salvar Alterações" : "Adicionar Produto"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
