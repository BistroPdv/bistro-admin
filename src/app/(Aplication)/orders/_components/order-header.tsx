import { Button } from "@/components/ui/button";
import {
  RiArrowLeftSLine,
  RiFilter3Line,
  RiShoppingBasketLine,
} from "@remixicon/react";

interface OrderHeaderProps {
  showFilters: boolean;
  showOrdersList: boolean;
  onToggleFilters: () => void;
  onBackToList: () => void;
}

export function OrderHeader({
  showFilters,
  showOrdersList,
  onToggleFilters,
  onBackToList,
}: OrderHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4 px-1">
      <h1 className="text-2xl font-bold flex gap-2 items-center">
        <RiShoppingBasketLine /> Pedidos
      </h1>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleFilters}
          className="flex items-center gap-1"
        >
          <RiFilter3Line className="h-4 w-4" />
          Filtros
        </Button>
        {!showOrdersList && (
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToList}
            className="md:hidden flex items-center gap-1"
          >
            <RiArrowLeftSLine className="h-4 w-4" />
            Voltar
          </Button>
        )}
      </div>
    </div>
  );
}
