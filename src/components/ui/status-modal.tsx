import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react";
import { ReactNode } from "react";

type StatusType = "success" | "error" | "warning" | "info" | "confirm";

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  content: ReactNode;
  status: StatusType;
  confirmText?: string;
  cancelText?: string;
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    iconColor: "text-green-500",
    buttonVariant: "default" as const,
  },
  error: {
    icon: XCircle,
    iconColor: "text-red-500",
    buttonVariant: "destructive" as const,
  },
  warning: {
    icon: AlertCircle,
    iconColor: "text-yellow-500",
    buttonVariant: "destructive" as const,
  },
  info: {
    icon: Info,
    iconColor: "text-blue-500",
    buttonVariant: "default" as const,
  },
  confirm: {
    icon: AlertCircle,
    iconColor: "text-yellow-500",
    buttonVariant: "outline" as const,
  },
};

export function StatusModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  content,
  status,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
}: StatusModalProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Icon className={`size-6 ${config.iconColor}`} />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{content}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          {status === "confirm" ? (
            <>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive/80"
                onClick={onClose}
              >
                {cancelText}
              </Button>
              <Button variant={config.buttonVariant} onClick={onConfirm}>
                {confirmText}
              </Button>
            </>
          ) : (
            <Button variant={config.buttonVariant} onClick={onClose}>
              Fechar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
