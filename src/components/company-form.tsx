import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { AxiosError } from "axios";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Card, CardContent, CardHeader } from "./ui/card";

interface CompanyFormProps {
  onCategoryUpdate?: () => void;
}

const companySchema = z.object({
  nome: z.string().min(2, "O nome da categoria é obrigatório"),
});

type CompanyFormValues = z.infer<typeof companySchema>;

export function CompanyForm(props: CompanyFormProps) {
  const { onCategoryUpdate } = props;
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      nome: "",
    },
  });

  const onSubmit = async (data: CompanyFormValues) => {
    try {
      const resp = await api.post("/categorias", { ...data });
      if (resp.status === 201) {
        toast.success("Categoria criada com sucesso");
        onCategoryUpdate?.();
      }
    } catch (error: any) {
      if (error instanceof AxiosError) {
        toast.error(error?.response?.data?.message);
        return;
      }
    }
  };

  return (
    <Card>
      <CardHeader>Cadastro de Categoria</CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 max-w-md"
          >
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Categoria</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o nome da categoria"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    O nome da sua categoria de produtos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button size="sm" type="submit">
              Salvar Categoria
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
