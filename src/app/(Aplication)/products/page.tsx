"use client";
import { PaginatedResult } from "@/@types/pagination";
import { Category } from "@/@types/products";
import { CategoryForm, CategoryFormValues } from "@/components/category-form";
import { ProductForm } from "@/components/product-form";
import { ProductsGrid } from "@/components/products-grid";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { Product, ProductFormValues } from "@/schemas/product-schema";
import { RiPriceTag3Line, RiSearchLine } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useState } from "react";

export default function Page() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const local = localStorage.getItem("user");
  const cnpj = JSON.parse(local || "");
  const { data, isLoading, error, refetch } = useQuery<
    AxiosResponse,
    Error,
    PaginatedResult<Category>
  >({
    queryKey: ["products"],
    queryFn: () => {
      const response = api.get(
        `/restaurantCnpj/${cnpj.restaurantCnpj}/categorias`
      );
      return response;
    },
    select: (resp) => resp.data,
  });

  const createProductMutation = useMutation({
    mutationFn: async (formData: ProductFormValues & { file?: File }) => {
      // Criar FormData para upload de imagem
      const productData = new FormData();
      productData.append("nome", formData.nome);
      productData.append("descricao", formData.descricao);
      productData.append("preco", formData.preco.replace(",", "."));
      productData.append("categoriaId", formData.categoriaId);
      productData.append("restaurantCnpj", cnpj.restaurantCnpj);

      if (formData.imagem) {
        productData.append("file", formData.imagem);
      }

      // Endpoint para criar produto
      const endpoint = `/produtos`;
      return api.post(endpoint, productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDialogOpen(false);
    },
    onError: (error) => {
      console.error("Erro ao adicionar produto:", error);
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async (
      formData: ProductFormValues & { id: string; file?: File }
    ) => {
      // Criar FormData para upload de imagem
      const productData = new FormData();
      productData.append("nome", formData.nome);
      productData.append("descricao", formData.descricao);
      productData.append("preco", formData.preco.replace(",", "."));
      productData.append("categoriaId", formData.categoriaId);
      productData.append("restaurantCnpj", cnpj.restaurantCnpj);

      if (formData.imagem) {
        productData.append("file", formData.imagem);
      }

      // Endpoint para atualizar produto
      const endpoint = `/produtos/${formData.id}`;
      return api.put(endpoint, productData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
    },
    onError: (error) => {
      console.error("Erro ao atualizar produto:", error);
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async (formData: CategoryFormValues & { id: string }) => {
      // Endpoint para atualizar categoria
      const endpoint = `/categorias/${formData.id}`;
      return api.put(endpoint, {
        ...formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setIsCategoryDialogOpen(false);
      setEditingCategory(null);
    },
    onError: (error) => {
      console.error("Erro ao atualizar categoria:", error);
    },
  });

  const handleAddNewProduct = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: ProductFormValues) => {
    if (editingProduct) {
      updateProductMutation.mutate({ ...data, id: editingProduct.id });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {};

  const filteredCategories =
    data?.data?.map((category) => ({
      ...category,
      produtos: category.produtos?.filter((product) =>
        product.nome.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    })) || [];

  if (error) {
    return <div>Error loading products</div>;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-none space-y-6 pb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <RiPriceTag3Line className="mr-2" /> Produtos
          </h1>
          <Button onClick={handleAddNewProduct}>Adicionar Produto</Button>
        </div>

        <div className="relative">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <ProductsGrid
          loading={isLoading}
          items={filteredCategories}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onEditCategory={handleEditCategory}
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="md:min-w-2xl max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Editar Produto" : "Adicionar Novo Produto"}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? "Edite os detalhes do produto selecionado."
                : "Preencha os detalhes para adicionar um novo produto."}
            </DialogDescription>
          </DialogHeader>

          <ProductForm
            categories={data?.data || []}
            onSubmit={handleSubmit}
            product={editingProduct || undefined}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
        modal
      >
        <DialogContent className="overflow-hidden sm:max-w-[95%] md:max-w-[85%] lg:max-w-[75%] xl:max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
            <DialogDescription>
              Edite os detalhes da categoria selecionada.
            </DialogDescription>
          </DialogHeader>

          <CategoryForm
            onRefresh={() => refetch()}
            category={editingCategory || undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
