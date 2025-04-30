import * as z from "zod";

export const productFormSchema = z.object({
  nome: z.string().min(1, "O nome do produto é obrigatório"),
  descricao: z.string().min(1, "A descrição do produto é obrigatória"),
  preco: z
    .string()
    .min(1, "O preço é obrigatório")
    .refine((val) => !isNaN(Number(val.replace(",", "."))), {
      message: "O preço deve ser um número válido",
    }),
  categoriaId: z.string().min(1, "A categoria é obrigatória"),
  imagem: z.any().optional(),
  ativo: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

export interface Product {
  id: string;
  nome: string;
  descricao: string;
  imagem: string;
  preco: number;
  categoriaId: string;
  externoId: any;
  codigo: any;
  restaurantCnpj: string;
  delete: boolean;
  createAt: string;
  updateAt: any;
  ativo: boolean;
  ordem?: number;
}
