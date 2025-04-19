import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RiSearch2Line } from "@remixicon/react";
import { OrderStatus } from "../types";

interface OrderFiltersProps {
  statusFilter: OrderStatus | "all";
  dateFilter: string;
  tableFilter: string;
  onStatusFilterChange: (value: OrderStatus | "all") => void;
  onDateFilterChange: (value: string) => void;
  onTableFilterChange: (value: string) => void;
}

export function OrderFilters({
  statusFilter,
  dateFilter,
  tableFilter,
  onStatusFilterChange,
  onDateFilterChange,
  onTableFilterChange,
}: OrderFiltersProps) {
  return (
    <Card className="w-full mb-4 border rounded-lg overflow-hidden">
      <CardContent className="p-3 flex-1">
        <div className="flex flex-col md:flex-row gap-3 flex-1">
          <div className="w-full md:w-1/3">
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Select value={statusFilter} onValueChange={onStatusFilterChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value={OrderStatus.ABERTO}>Pendente</SelectItem>
                <SelectItem value={OrderStatus.FINALIZADO}>
                  Finalizado
                </SelectItem>
                <SelectItem value={OrderStatus.CANCELADO}>Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/3">
            <label className="text-sm font-medium mb-1 block">Data</label>
            <div className="relative">
              <Input
                type="date"
                placeholder="Filtrar por data"
                value={dateFilter}
                onChange={(e) => onDateFilterChange(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="w-full md:w-1/3">
            <label className="text-sm font-medium mb-1 block">Mesa</label>
            <div className="relative">
              <RiSearch2Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por mesa"
                value={tableFilter}
                onChange={(e) => onTableFilterChange(e.target.value)}
                className="w-full pl-9"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
