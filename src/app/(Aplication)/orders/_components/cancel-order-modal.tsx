import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { RiLoaderLine } from "@remixicon/react";
import { useState } from "react";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderNumber: string;
  isLoading?: boolean;
}

export function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isLoading = false,
}: CancelOrderModalProps) {
  const [cancelReason, setCancelReason] = useState("");

  const handleConfirm = () => {
    onConfirm(cancelReason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar Cancelamento do Pedido</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja cancelar o pedido {orderNumber}? Esta ação
            não pode ser desfeita.
            <Textarea
              onFocus={() => setCancelReason("")}
              placeholder="Digite o motivo do cancelamento"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
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
              "Confirmar Cancelamento"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
