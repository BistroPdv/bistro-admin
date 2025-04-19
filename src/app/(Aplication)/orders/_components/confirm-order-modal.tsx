import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RiLoaderLine } from "@remixicon/react";

interface ConfirmOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderNumber: string;
  isLoading?: boolean;
}

export function ConfirmOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isLoading = false,
}: ConfirmOrderModalProps) {
  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Finalização do Pedido</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja finalizar o pedido {orderNumber}? Esta ação
            não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
          >
            {isLoading ? (
              <RiLoaderLine className="h-4 w-4 animate-spin" />
            ) : (
              "Confirmar Finalização"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
