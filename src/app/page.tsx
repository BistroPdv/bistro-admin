"use client";

import Logo from "@/assets/logo/logo.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiBuilding4Line,
  RiLockPasswordLine,
  RiLoginBoxLine,
  RiUser3Line,
} from "@remixicon/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const cnpjValue = watch("cnpj");

  // Função para aplicar a máscara de CNPJ
  useEffect(() => {
    if (cnpjValue) {
      // Remove todos os caracteres não numéricos
      const numericValue = cnpjValue.replace(/\D/g, "");

      // Limita a 14 dígitos
      const truncated = numericValue.slice(0, 14);

      // Formata o CNPJ: XX.XXX.XXX/XXXX-XX
      let formattedValue = truncated;
      if (truncated.length > 2)
        formattedValue = truncated.replace(/^(\d{2})/, "$1.");
      if (truncated.length > 5)
        formattedValue = formattedValue.replace(/^(\d{2})\.(\d{3})/, "$1.$2.");
      if (truncated.length > 8)
        formattedValue = formattedValue.replace(
          /^(\d{2})\.(\d{3})\.(\d{3})/,
          "$1.$2.$3/"
        );
      if (truncated.length > 12)
        formattedValue = formattedValue.replace(
          /^(\d{2})\.(\d{3})\.(\d{3})\/(\d{4})/,
          "$1.$2.$3/$4-"
        );

      // Atualiza o valor visível no input com a máscara
      const inputElement = document.getElementById("cnpj") as HTMLInputElement;
      if (inputElement) {
        inputElement.value = formattedValue;
      }

      // Mantém o valor sem máscara para validação e envio
      setValue("cnpj", truncated, { shouldValidate: true });
    }
  }, [cnpjValue, setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null);

    try {
      // data.cnpj já contém apenas os dígitos numéricos graças ao useEffect acima
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
    <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <Card className="w-full max-w-md shadow-2xl border-muted/20 backdrop-blur-sm bg-card/95 relative z-10">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 opacity-10" />

        <CardHeader className="pb-6 relative z-10">
          <CardTitle className="w-full flex justify-center mb-4">
            <Image className="w-36" src={Logo} alt="Logo" priority />
          </CardTitle>
          <p className="text-center text-muted-foreground text-sm">
            Acesse sua conta para continuar
          </p>
        </CardHeader>

        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="login">Login</Label>
              <div className="relative">
                <Input
                  id="login"
                  type="text"
                  placeholder="Digite seu login"
                  className="pl-10 h-12 bg-background/50"
                  {...register("username")}
                />
                <RiUser3Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
              </div>
              {errors.username && (
                <p className="text-destructive text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  placeholder="Digite sua senha"
                  className="pl-10 h-12 bg-background/50"
                  {...register("password")}
                />
                <RiLockPasswordLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <div className="relative">
                <Input
                  id="cnpj"
                  type="text"
                  {...register("cnpj")}
                  // ref={withMask("99.999.999/9999-99", {
                  //   showMaskOnHover: false,
                  //   outputFormat: "99999999999999",
                  // })}
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  className="pl-10 h-12 bg-background/50"
                />
                <RiBuilding4Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary" />
              </div>
              {errors.cnpj && (
                <p className="text-destructive text-sm mt-1">
                  {errors.cnpj.message}
                </p>
              )}
            </div>

            {loginError && (
              <div className="p-4 text-sm text-white bg-destructive/90 rounded-md shadow-md">
                {loginError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 mt-4 flex items-center justify-center gap-2 text-base font-medium shadow-md transition-all hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <RiLoginBoxLine className="text-lg" />
                  <span>Entrar</span>
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
