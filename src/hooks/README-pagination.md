# Hook de Paginação Genérico

Este diretório contém um sistema de paginação genérico e reutilizável para o projeto.

## Componentes Principais

### 1. `usePagination` - Hook Genérico

Hook principal que pode ser usado para qualquer endpoint que retorne dados paginados.

```typescript
import { usePagination } from "@/hooks/use-pagination";

const {
  data, // Array de dados da página atual
  currentPage, // Página atual
  totalPages, // Total de páginas
  totalItems, // Total de itens
  pageSize, // Itens por página
  isLoading, // Estado de carregamento
  error, // Erro se houver
  hasNextPage, // Se tem próxima página
  hasPreviousPage, // Se tem página anterior
  goToPage, // Função para ir para uma página específica
  nextPage, // Função para próxima página
  previousPage, // Função para página anterior
  goToFirstPage, // Função para primeira página
  goToLastPage, // Função para última página
  changePageSize, // Função para alterar tamanho da página
  refetch, // Função para recarregar dados
} = usePagination({
  endpoint: "/api/items",
  pageSize: 12,
  queryKey: ["items"],
  additionalParams: { status: "active" },
});
```

### 2. `SimplePagination` - Componente Simples

Componente de paginação simples com sistema de elipse automático.

```tsx
import { SimplePagination } from "@/components/simple-pagination";

<SimplePagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={goToPage}
  onPrevious={previousPage}
  onNext={nextPage}
  hasNextPage={hasNextPage}
  hasPreviousPage={hasPreviousPage}
  totalItems={totalItems}
  pageSize={pageSize}
/>;
```

### 3. `AdvancedPagination` - Componente Avançado

Componente de paginação avançado com botões primeira/última página e elipse.

```tsx
import { AdvancedPagination } from "@/components/advanced-pagination";

<AdvancedPagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={goToPage}
  onPrevious={previousPage}
  onNext={nextPage}
  onFirst={goToFirstPage}
  onLast={goToLastPage}
  hasNextPage={hasNextPage}
  hasPreviousPage={hasPreviousPage}
  totalItems={totalItems}
  pageSize={pageSize}
  showFirstLast={true} // Mostrar botões primeira/última
  maxVisiblePages={5} // Máximo de páginas visíveis
/>;
```

### 4. Sistema de Elipse

Ambos os componentes incluem sistema automático de elipse (reticências) quando há mais de 5 páginas:

- **Página 1**: `1 2 3 4 5 ... 15`
- **Página 8**: `1 ... 6 7 8 9 10 ... 15`
- **Página 15**: `1 ... 11 12 13 14 15`

### 5. `GenericPageSizeSelector` - Seletor de Tamanho

Componente para selecionar quantos itens mostrar por página.

```tsx
import { GenericPageSizeSelector } from "@/components/generic-page-size-selector";

<GenericPageSizeSelector
  pageSize={pageSize}
  onPageSizeChange={changePageSize}
  totalItems={totalItems}
  options={[
    { value: 6, label: "6 por página" },
    { value: 12, label: "12 por página" },
    { value: 24, label: "24 por página" },
  ]}
  label="Mostrar:"
/>;
```

## Hooks Específicos

### Comandas

```typescript
import { useCommandedPagination } from "@/hooks/use-commanded-pagination-generic";

const {
  data: commandedData,
  // ... outras propriedades
} = useCommandedPagination({ pageSize: 12 });
```

### Produtos

```typescript
import { useProductsPagination } from "@/hooks/use-products-pagination";

const {
  data: productsData,
  // ... outras propriedades
} = useProductsPagination({ pageSize: 24 });
```

### Pedidos

```typescript
import { useOrdersPagination } from "@/hooks/use-orders-pagination";

const {
  data: ordersData,
  // ... outras propriedades
} = useOrdersPagination({
  pageSize: 10,
  status: "pending",
  date: "2024-01-01",
});
```

## Exemplo Completo de Uso

```tsx
"use client";
import { GenericPagination } from "@/components/generic-pagination";
import { GenericPageSizeSelector } from "@/components/generic-page-size-selector";
import { usePagination } from "@/hooks/use-pagination";

export default function MyPage() {
  const {
    data,
    currentPage,
    totalPages,
    totalItems,
    pageSize,
    isLoading,
    error,
    hasNextPage,
    hasPreviousPage,
    goToPage,
    nextPage,
    previousPage,
    goToFirstPage,
    goToLastPage,
    changePageSize,
    refetch,
  } = usePagination({
    endpoint: "/api/my-data",
    pageSize: 12,
    queryKey: ["my-data"],
  });

  if (error) {
    return <div>Erro ao carregar dados</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header com seletor de tamanho */}
      <div className="flex items-center justify-between">
        <h1>Meus Dados</h1>
        <GenericPageSizeSelector
          pageSize={pageSize}
          onPageSizeChange={changePageSize}
          totalItems={totalItems}
        />
      </div>

      {/* Lista de dados */}
      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <div>
          {data.map((item) => (
            <div key={item.id}>{item.name}</div>
          ))}
        </div>
      )}

      {/* Paginação */}
      <GenericPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={goToPage}
        onPrevious={previousPage}
        onNext={nextPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        totalItems={totalItems}
        pageSize={pageSize}
      />
    </div>
  );
}
```

## Requisitos da API

A API deve retornar dados no seguinte formato:

```json
{
  "data": [...], // Array de dados
  "total": 100,        // Total de itens
  "totalPage": 9,      // Total de páginas
  "page": 1,           // Página atual
  "limit": 12          // Itens por página
}
```

O hook também suporta outras estruturas:

- `meta.total`, `meta.lastPage` (formato com meta)
- `totalPages` (formato alternativo)

## Parâmetros de Query

O hook automaticamente adiciona os seguintes parâmetros à requisição:

- `page`: Número da página atual
- `limit`: Número de itens por página
- Parâmetros adicionais passados em `additionalParams`
