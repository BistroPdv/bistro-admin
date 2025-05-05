import { z } from "zod";

const baseSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  nome: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um e-mail válido.",
  }),
  password: z.string().min(6, {
    message: "Senha deve ter pelo menos 6 caracteres.",
  }),
  confirmPassword: z.string().min(6, {
    message: "Senha deve ter pelo menos 6 caracteres.",
  }),
  role: z.string({
    required_error: "Por favor, selecione um acesso.",
  }),
  ativo: z.boolean().default(true),
});

export const userFormSchema = baseSchema.refine(
  (data) => data.confirmPassword === data.password,
  {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  }
);

export type UserType = z.infer<typeof userFormSchema>;
