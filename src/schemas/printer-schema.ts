import * as z from "zod";

export const printerFormSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome da impressora é obrigatório"),
  ip: z
    .string()
    .min(1, "O endereço IP é obrigatório")
    .regex(
      /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      "Endereço IP inválido"
    ),
  porta: z
    .string()
    .min(1, "A porta é obrigatória")
    .regex(/^\d+$/, "A porta deve conter apenas números")
    .refine((val) => parseInt(val) >= 1 && parseInt(val) <= 65535, {
      message: "A porta deve estar entre 1 e 65535",
    }),
});

export type PrinterFormValues = z.infer<typeof printerFormSchema>;

export interface Printer {
  id?: string;
  nome: string;
  ip: string;
  porta: number;
  restaurantCnpj: string;
  createAt?: string;
  updateAt?: any;
}
