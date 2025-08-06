import { z } from "zod";

export const paymentMethodFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  description: z.string().optional(),
  type: z.enum(["DINHEIRO", "CARTAO", "PIX", "TICKET", "VOUCHER", "OUTROS"], {
    required_error: "Por favor, selecione um tipo de pagamento.",
  }),
  status: z.boolean().default(true),
  change: z.boolean().default(false),
  taxa: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const num = Number(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      {
        message: "Taxa deve ser um número entre 0 e 100.",
      }
    ),
});

export type PaymentMethodType = z.infer<typeof paymentMethodFormSchema>;
