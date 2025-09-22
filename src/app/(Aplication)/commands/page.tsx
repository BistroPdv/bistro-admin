"use client";
import { Comanda } from "@/components/comanda";
import { EnhancedSimplePagination } from "@/components/enhanced-simple-pagination";
import { TitlePage } from "@/components/title-page";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommandedPagination } from "@/hooks/use-commanded-pagination-generic";
import api from "@/lib/api";
import { RiAddLine, RiFileExcel2Line, RiQrCodeFill } from "@remixicon/react";
import { json2csv } from "json-2-csv";
import { useState } from "react";
import { ModalAddCommands } from "./components/ModalAddCommands";

export default function Page() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    data: commandedData,
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
    refetch,
  } = useCommandedPagination({ pageSize: 10 });

  const handleAddCommandsSuccess = () => {
    refetch();
  };

  const handleExportCSV = async () => {
    try {
      const res = await api.get("/commanded");
      const jsonData = res.data.data;
      const csv = await json2csv(jsonData);

      // Cria um blob com o CSV
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      // Cria um link temporário para download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "comandas.csv");
      document.body.appendChild(link);
      link.click();

      // Limpa o link e o objeto URL
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar CSV:", error);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <TitlePage
          title="Comandas"
          description="Gerencie as comandas do seu estabelecimento"
          icon={<RiQrCodeFill />}
        >
          <Button onClick={() => setIsDialogOpen(true)}>
            <RiAddLine />
            Adicionar comandas
          </Button>
          <Button onClick={handleExportCSV}>Exportar CSV</Button>
        </TitlePage>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Erro ao carregar comandas. Tente novamente.
            </p>
            <Button onClick={() => refetch()}>Tentar novamente</Button>
          </div>
        </div>
        <ModalAddCommands
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={handleAddCommandsSuccess}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TitlePage
        title="Comandas"
        description="Gerencie as comandas do seu estabelecimento"
        icon={<RiQrCodeFill />}
      >
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleExportCSV}>
            <RiFileExcel2Line />
            Exportar CSV
          </Button>
          <Button onClick={() => setIsDialogOpen(true)}>
            <RiAddLine />
            Adicionar comandas
          </Button>
        </div>
      </TitlePage>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex gap-4 flex-wrap">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="h-32 w-32 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          {/* Grid de comandas */}
          <div className="flex gap-4 flex-wrap overflow-x-auto h-full max-h-[calc(100vh-18rem)]">
            {commandedData?.map((commanded) => (
              <Comanda
                key={commanded.id}
                id={commanded.id}
                qrValue={commanded.qrValue || commanded.id}
                numero={commanded.numero}
              />
            ))}
          </div>
          {/* Paginação */}
          <EnhancedSimplePagination
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
            showFirstLast={true}
          />
        </>
      )}

      <ModalAddCommands
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleAddCommandsSuccess}
      />
    </div>
  );
}
