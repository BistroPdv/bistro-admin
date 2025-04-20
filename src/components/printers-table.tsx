"use client";

import { Printer } from "@/schemas/printer-schema";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { StatusModal } from "./ui/status-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface PrintersTableProps {
  loading?: boolean;
  printers: Printer[];
  onEditPrinter?: (printer: Printer) => void;
  onDeletePrinter?: (printerId?: string) => void;
}

export default function PrintersTable(props: PrintersTableProps) {
  const { loading, printers, onEditPrinter, onDeletePrinter } = props;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printerToDelete, setPrinterToDelete] = useState<Printer | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-muted-foreground">Carregando impressoras...</p>
      </div>
    );
  }

  if (printers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 space-y-3">
        <p className="text-muted-foreground">Nenhuma impressora encontrada</p>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-muted/50">
        <CardTitle>Impressoras de Rede</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[30%]">Nome</TableHead>
              <TableHead className="w-[30%]">Endereço IP</TableHead>
              <TableHead className="w-[20%]">Porta</TableHead>
              <TableHead className="w-[20%]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {printers.map((printer) => (
              <TableRow key={printer.id}>
                <TableCell className="font-medium">{printer.nome}</TableCell>
                <TableCell>{printer.ip}</TableCell>
                <TableCell>{printer.porta}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditPrinter && onEditPrinter(printer)}
                    >
                      <Edit2Icon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setPrinterToDelete(printer);
                        setIsModalOpen(true);
                      }}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <StatusModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Excluir Impressora"
        content={`Tem certeza que deseja excluir a impressora ${printerToDelete?.nome}?`}
        status="confirm"
        onConfirm={() => {
          onDeletePrinter && onDeletePrinter(printerToDelete?.id);
          setIsModalOpen(false);
        }}
      />
    </Card>
  );
}
