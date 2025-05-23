"use client";

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
import { authService } from "@/lib/auth";
import {
  Product,
  ProductFormValues,
  productFormSchema,
} from "@/schemas/product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { Loader2, PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  loading?: boolean;
}

export function ProductForm({
  categories,
  onSubmit,
  product,
  loading = false,
}: ProductFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const user = authService.getUser();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nome: product?.nome || "",
      descricao: product?.descricao || "",
      preco: product?.preco ? product.preco.toString() : "",
      categoriaId: product?.categoriaId || "",
      imagem: undefined,
      updateFrom: product?.updateFrom || "",
      externoId: product?.externoId || "",
    },
  });

  const previewImage = form.watch("imagem");

  const handleSubmit = (data: ProductFormValues) => {
    if (imageFile && imageFile instanceof File) {
      data.imagem = imageFile;
    }
    data.updateFrom = user.username;
    onSubmit(data);
  };

  useEffect(() => {
    if (product) {
      console.log("product-form", product);
      form.setValue("id", product.id || "");
      form.setValue("nome", product.nome || "");
      form.setValue("descricao", product.descricao || "");
      form.setValue("preco", product.preco?.toString() || "");
      form.setValue("imagem", product.imagem || "");
      form.setValue("externoId", product.externoId || "");
    }
  }, [product]);
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6 relative "
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            {/* USUARIO QUE ESTA ALTERANDO O PRODUTO */}
            <FormField
              control={form.control}
              name="updateFrom"
              render={({ field }) => (
                <FormItem hidden>
                  <FormLabel>Atualizado por</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* NOME DO PRODUTO */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <span className="text-destructive mr-1">*</span>Nome do
                    Produto
                  </FormLabel>
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
                  <FormLabel>
                    <span className="text-destructive mr-1">*</span>Preço
                  </FormLabel>
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
                    <span className="text-destructive mr-1">*</span>Categoria
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
                  previewUrl={previewImage || product?.imagem}
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
          <Button disabled={loading} type="submit" className="gap-2">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <PlusCircle className="h-4 w-4" />
            )}
            {product ? "Salvar Alterações" : "Adicionar Produto"}
          </Button>
        </div>
        {product?.id && (
          <div className="text-xs absolute text-muted-foreground">
            * ultima alteração{" "}
            {dayjs(product?.updateAt).format("DD/MM/YYYY HH:mm")}{" "}
            {product?.updateFrom}
          </div>
        )}
      </form>
    </Form>
  );
}
