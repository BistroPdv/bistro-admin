"use client";

import Logo from "@/assets/logo/logo.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Esquema de validação com Zod
const loginSchema = z.object({
  username: z.string().min(1, "O login é obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, "O CNPJ deve conter exatamente 14 dígitos"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      const response = await authService.login(data);

      router.push("/dashboard");
    } catch (error: any) {
      if (error.response) {
        setLoginError(error.response.data?.message || "Credenciais inválidas");
      } else {
        setLoginError("Erro ao conectar ao servidor. Tente novamente.");
      }
      console.error("Erro de login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen ">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="w-full flex justify-center">
            <Image className="w-28" src={Logo} alt="Logo" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="login">Login</Label>
              <Input
                id="login"
                type="text"
                placeholder="Digite seu login"
                {...register("username")}
              />
              {errors.username && (
                <p className="text-red-500 text-sm">
                  {errors.username.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Digite sua senha"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                type="text"
                placeholder="Digite seu CNPJ"
                {...register("cnpj")}
              />
              {errors.cnpj && (
                <p className="text-red-500 text-sm">{errors.cnpj.message}</p>
              )}
            </div>
            {loginError && (
              <div className="p-3 text-sm text-white bg-red-500 rounded-md">
                {loginError}
              </div>
            )}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
