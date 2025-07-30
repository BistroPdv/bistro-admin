"use client";
import { ConsultarProdutoResponse } from "@/@types/omie";
import { PaginatedResult } from "@/@types/pagination";
import { Category } from "@/@types/products";
import { CategoryForm } from "@/components/category-form";
import { CategoryOrderModal } from "@/components/category-order-modal";
import { ImportEventTypes } from "@/components/import-options-modal";
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
import {
  RiLayoutGridLine,
  RiListCheck2,
  RiPriceTag3Line,
  RiSearchLine,
} from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"card" | "list">("card");
  const formRef = useRef<HTMLFormElement>(null);
  const queryClient = useQueryClient();

  const local = localStorage.getItem("user");
  const cnpj = JSON.parse(local || "");
  const {
    data: categories,
    isLoading,
    error,
    refetch,
  } = useQuery<AxiosResponse, Error, PaginatedResult<Category>>({
    queryKey: ["products"],
    queryFn: () => {
      const response = api.get(`/categorias?status=true`);
      return response;
    },
    select: (resp) => resp.data,
  });

  const createProductMutation = useMutation({
    mutationFn: async (formData: ProductFormValues & { file?: File }) => {
      // Criar FormData para upload de imagem
      const productData = new FormData();
      productData.append("nome", formData.nome);
      productData.append("descricao", formData.descricao || "");
      productData.append("preco", formData.preco.replace(",", "."));
      productData.append("categoriaId", formData.categoriaId);
      productData.append("externoId", formData.externoId || "");
      productData.append("restaurantCnpj", cnpj.restaurantCnpj);
      productData.append("updateFrom", formData.updateFrom || "");

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
      const productData = new FormData();
      productData.append("nome", formData.nome);
      productData.append("descricao", formData.descricao || "");
      productData.append("preco", formData.preco.replace(",", "."));
      productData.append("externoId", formData.externoId || "");
      productData.append("imagem", formData.imagem || "");
      productData.append("categoriaId", formData.categoriaId);
      productData.append("restaurantCnpj", cnpj.restaurantCnpj);
      productData.append("updateFrom", formData.updateFrom || "");

      if (formData.imagem && formData.imagem instanceof File) {
        productData.append("file", formData.imagem);
      }
      if (formData.id) {
        // Endpoint para atualizar produto
        const endpoint = `/produtos/${formData.id}`;
        return api.put(endpoint, productData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        const endpoint = `/produtos`;
        return api.post(endpoint, productData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
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

  const reorderProductsMutation = useMutation({
    mutationFn: async ({
      categoryId,
      products,
    }: {
      categoryId: string;
      products: Product[];
    }) => {
      const updates = products.map((product, index) => ({
        id: product.id,
        ordem: index + 1,
        categoriaId: categoryId,
      }));

      const response = await api.put(`/produtos/ordem`, updates);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Ordem dos produtos atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao reordenar produtos:", error);
      toast.error("Erro ao reordenar produtos");
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
      updateProductMutation.mutate({
        ...data,
        id: editingProduct.id || "",
      });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setIsCategoryDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    refetch();
  };

  const handleReorderProducts = (categoryId: string, products: Product[]) => {
    reorderProductsMutation.mutate({ categoryId, products });
  };

  const handleImportProducts = async (data: ImportEventTypes) => {
    const resp: AxiosResponse<ConsultarProdutoResponse> = await api.get(
      `/integrations/omie/produto/${data.codigo_produto}`
    );
    const dados = {
      id: editingProduct?.id,
      nome: resp.data.descricao,
      descricao: resp.data.descr_detalhada,
      preco: resp.data.valor_unitario,
      imagem: resp.data.imagens[0].url_imagem,
    };

    setEditingProduct(dados);
  };

  const filteredCategories =
    categories?.data?.map((category) => ({
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
          <div className="flex gap-2">
            <Button
              title={
                viewMode === "card"
                  ? "Visualizar como Lista"
                  : "Visualizar como Cards"
              }
              variant="outline"
              onClick={() => setViewMode(viewMode === "card" ? "list" : "card")}
              className="flex items-center gap-1"
            >
              {viewMode === "card" ? (
                <RiListCheck2 className="h-8 w-8" />
              ) : (
                <RiLayoutGridLine className="h-8 w-8" />
              )}
            </Button>
            <Button variant="outline" onClick={() => setIsOrderModalOpen(true)}>
              Ordenar Categorias
            </Button>
            <Button onClick={handleAddNewProduct}>Adicionar Produto</Button>
          </div>
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
          onReorderProducts={handleReorderProducts}
          viewMode={viewMode}
        />
      </div>

      <ProductForm
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        handleImportProducts={handleImportProducts}
        loading={
          updateProductMutation.isPending || createProductMutation.isPending
        }
        categories={categories?.data || []}
        onSubmit={handleSubmit}
        product={editingProduct || undefined}
      />

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

      <CategoryOrderModal
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        categories={categories?.data || []}
      />
    </div>
  );
}
