import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
const schema = z.object({
  of: z.coerce.number().min(1, "Deve ser maior que 0"),
  to: z.coerce.number().min(1, "Deve ser maior que 0"),
});

interface ModalAddCommandsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ModalAddCommands(props: ModalAddCommandsProps) {
  const { open, onOpenChange, onSuccess } = props;
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      of: 1,
      to: 1,
    },
  });
  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const resp = await api.post("/commanded/range", data);
      if (resp.status === 201) {
        toast.success("Comandas adicionadas com sucesso");
        form.reset();
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      toast.error("Erro ao adicionar comandas");
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Comandas</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="of"
              label="De"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>De</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Digite o número da comanda de inicio.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="to"
              label="Até"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Até</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="01" {...field} />
                  </FormControl>
                  <FormDescription>
                    Digite o número da comanda de fim.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Adicionar Comandas</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
