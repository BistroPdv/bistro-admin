"use client";

import { Category } from "@/@types/products";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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
import _ from "lodash";
import { Loader2, Plus, PlusCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { CompanyForm } from "./company-form";
import { ImportEventTypes, ImportOptionsModal } from "./import-options-modal";
import { Button } from "./ui/button";
import { DialogFooter, DialogHeader } from "./ui/dialog";
import { FileUpload } from "./ui/file-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

interface ProductFormProps {
  isDialogOpen?: boolean;
  setIsDialogOpen: (isDialogOpen: boolean) => void;
  categories: Category[];
  onCategoryUpdate?: () => void;
  onSubmit: (data: ProductFormValues) => void;
  product?: Product;
  loading?: boolean;
  handleImportProducts: (data: ImportEventTypes) => void;
}

export function ProductForm({
  isDialogOpen = false,
  setIsDialogOpen,
  categories,
  onCategoryUpdate,
  onSubmit,
  product,
  loading = false,
  handleImportProducts,
}: ProductFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const user = authService.getUser();
  const settings = authService.getSettings();
  const formRef = useRef<HTMLFormElement>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
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
      form.setValue("id", product.id || "");
      form.setValue("nome", product.nome || "");
      form.setValue("descricao", product.descricao || "");
      form.setValue("preco", product.preco?.toString() || "");
      form.setValue("imagem", product.imagem || "");
      form.setValue("externoId", product.externoId || "");
      form.setValue("categoriaId", product.categoria?.id || "");
    }
  }, [product]);

  useEffect(() => {
    if (!isDialogOpen) {
      form.reset({
        nome: "",
        descricao: "",
        preco: "",
        imagem: undefined,
        externoId: "",
        categoriaId: "",
      });
    }
  }, [isDialogOpen]);

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="md:min-w-2xl max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-none">
          <DialogTitle className="flex items-center gap-2">
            {product?.id ? "Editar Produto" : "Adicionar Novo Produto"}
            {settings?.pdvIntegrations?.length > 0 && (
              <ImportOptionsModal
                title="Importar Produtos"
                onImport={handleImportProducts}
              />
            )}
          </DialogTitle>
          <DialogDescription>
            {product?.id
              ? "Edite os detalhes do produto selecionado."
              : "Preencha os detalhes para adicionar um novo produto."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 relative">
          <Form {...form}>
            <form
              id="product-form"
              ref={formRef}
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6 relative"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
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
                          <span className="text-destructive mr-1">*</span>Nome
                          do Produto
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
                          Descreva os ingredientes ou características do
                          produto.
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
                            <Input
                              placeholder="25,90"
                              className="pl-10"
                              {...field}
                            />
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
                        <div className="flex items-center gap-2">
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
                              {_.orderBy(categories, "nome", "asc").map(
                                (category) => (
                                  <SelectItem
                                    key={category.id}
                                    value={category.id}
                                  >
                                    {category.nome}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                type="button"
                                onClick={() => setCategoryOpen(!categoryOpen)}
                              >
                                <Plus
                                  data-category-open={categoryOpen}
                                  className="h-4 w-4 transition-all duration-500 data-[category-open=true]:rotate-45"
                                />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Adicionar nova categoria</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
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
                        Faça upload de uma imagem para o produto. Formatos
                        aceitos: JPG, PNG.
                      </FormDescription>
                    </div>
                  </FormItem>
                </div>
              </div>
            </form>
          </Form>
          <div
            data-category-open={categoryOpen}
            className={`
                      absolute
                      right-0
                      bottom-2
                      opacity-0 translate-y-4 pointer-events-none
                      data-[category-open=true]:opacity-100
                      data-[category-open=true]:translate-y-0
                      data-[category-open=true]:pointer-events-auto
                      transition-all duration-500
                    `}
          >
            <CompanyForm onCategoryUpdate={onCategoryUpdate} />
          </div>
        </div>

        <DialogFooter className="flex-none border-t pt-4 relative">
          <div className="flex justify-between gap-2">
            <Button
              disabled={loading}
              form="product-form"
              type="submit"
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              {product ? "Salvar Alterações" : "Adicionar Produto"}
            </Button>
          </div>
          {product?.id && (
            <div className="text-xs absolute left-0 text-muted-foreground">
              * ultima alteração{" "}
              {dayjs(product?.updateAt).format("DD/MM/YYYY HH:mm")}{" "}
              {product?.updateFrom}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
