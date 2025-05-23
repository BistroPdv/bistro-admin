import * as z from "zod";

export const productFormSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "O nome do produto é obrigatório"),
  descricao: z.string().optional(),
  preco: z
    .string()
    .min(1, "O preço é obrigatório")
    .refine((val) => !isNaN(Number(val.replace(",", "."))), {
      message: "O preço deve ser um número válido",
    }),
  categoriaId: z.string().min(1, "A categoria é obrigatória"),
  imagem: z.any().optional(),
  ativo: z.boolean().default(true),
  updateFrom: z.string().optional(),
  externoId: z.string().optional(),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export interface Product {
  id?: string;
  nome: string;
  descricao?: string;
  imagem: string;
  preco: number;
  categoriaId?: string;
  categoria?: { id: string };
  externoId?: string;
  codigo?: any;
  restaurantCnpj?: string;
  delete?: boolean;
  createAt?: string;
  updateAt?: any;
  updateFrom?: string;
  ativo?: boolean;
  ordem?: number;
}
