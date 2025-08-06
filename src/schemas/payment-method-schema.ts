import { z } from "zod";

export const paymentMethodFormSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  descricao: z.string().optional(),
  tipo: z.enum(
    [
      "DINHEIRO",
      "CARTAO_CREDITO",
      "CARTAO_DEBITO",
      "PIX",
      "TRANSFERENCIA",
      "OUTRO",
    ],
    {
      required_error: "Por favor, selecione um tipo de pagamento.",
    }
  ),
  ativo: z.boolean().default(true),
  aceitaTroco: z.boolean().default(false),
  percentualTaxa: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      {
        message: "Taxa deve ser um número entre 0 e 100.",
      }
    ),
  diasParaRecebimento: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val || val === "") return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0;
      },
      {
        message: "Dias deve ser um número maior ou igual a 0.",
      }
    ),
});

export type PaymentMethodType = z.infer<typeof paymentMethodFormSchema>;
