"use client";
import { Comanda } from "@/components/comanda";
import { EnhancedSimplePagination } from "@/components/enhanced-simple-pagination";
import { TitlePage } from "@/components/title-page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCommandedPagination } from "@/hooks/use-commanded-pagination-generic";
import api from "@/lib/api";
import {
  RiAddLine,
  RiFileExcel2Line,
  RiFilePdfLine,
  RiQrCodeFill,
} from "@remixicon/react";
import html2canvas from "html2canvas-pro";
import { json2csv } from "json-2-csv";
import jsPDF from "jspdf";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ModalAddCommands } from "./components/ModalAddCommands";

export default function Page() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [isExportPDFOpen, setIsExportPDFOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
    changePageSize,
  } = useCommandedPagination({ pageSize: perPage });

  const refExportPDF = useRef<HTMLDivElement>(null);
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

  const openExportPDF = () => {
    setIsExportPDFOpen(true);
  };

  const handleExportPDF = async () => {
    try {
      if (!refExportPDF.current) return;
      setLoading(true);
      toast.loading("Exportando PDF, isso pode levar alguns minutos...");
      const pdf = new jsPDF("p", "mm", "a4");
      const children = Array.from(refExportPDF.current.children);

      const comandaWidth = 70; // 7cm
      const comandaHeight = 100; // 10cm
      const marginX = 10;
      const marginY = 10;

      for (let i = 0; i < children.length; i++) {
        const child = children[i] as HTMLElement;

        const canvas = await html2canvas(child, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");

        const col = i % 2;
        const row = Math.floor((i % 4) / 2);
        if (i > 0 && i % 4 === 0) pdf.addPage();

        const posX = marginX + col * (comandaWidth + marginX);
        const posY = marginY + row * (comandaHeight + marginY);

        pdf.addImage(imgData, "PNG", posX, posY, comandaWidth, comandaHeight);
      }

      pdf.save("comandas.pdf");
      setIsExportPDFOpen(false);
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
    } finally {
      toast.dismiss();
      setLoading(false);
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
          <Button variant="outline" onClick={openExportPDF}>
            <RiFilePdfLine />
            Exportar PDF
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
            onPageSizeChange={(size) => {
              changePageSize(size);
              setPerPage(size);
            }}
          />
        </>
      )}

      <Dialog
        open={isExportPDFOpen}
        onOpenChange={(open) => {
          if (!loading) {
            setIsExportPDFOpen(open);
          }
        }}
      >
        <DialogContent className="min-w-[21cm] overflow-auto max-h-[90vh] gap-4">
          <DialogHeader>
            <DialogTitle>Comandas</DialogTitle>
          </DialogHeader>
          <div
            ref={refExportPDF}
            className="flex flex-wrap gap-4 overflow-auto items-center justify-center max-h-[calc(90vh-10rem)]"
          >
            {commandedData?.map((commanded) => (
              <Comanda
                key={commanded.id}
                id={commanded.id}
                qrValue={commanded.qrValue || commanded.id}
                numero={commanded.numero}
              />
            ))}
          </div>
          <DialogFooter>
            <Button disabled={loading} onClick={handleExportPDF}>
              Exportar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ModalAddCommands
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={handleAddCommandsSuccess}
      />
    </div>
  );
}
