"use client";

import Logo from "@/assets/logo/logo.svg";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/lib/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiBuilding4Line,
  RiEyeCloseLine,
  RiEyeLine,
  RiLockPasswordLine,
  RiLoginBoxLine,
  RiUser3Line,
} from "@remixicon/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

// Esquema de validação com Zod
const loginSchema = z.object({
  username: z.string().min(1, "O login é obrigatório"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  cnpj: z
    .string()
    .regex(/^\d{11,14}$/, "O CPF/CNPJ deve conter de 11 a 14 dígitos"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [saveCredentials, setSaveCredentials] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

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

  // Carregar credenciais salvas do localStorage
  useEffect(() => {
    const savedCredentials = localStorage.getItem("savedCredentials");
    if (savedCredentials) {
      const { username, password, cnpj } = JSON.parse(savedCredentials);
      setValue("username", username);
      setValue("password", password);
      setValue("cnpj", cnpj);
      setSaveCredentials(true);
    }
  }, [setValue]);

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setLoginError(null); // Limpa erros anteriores

    try {
      // Salvar credenciais se o checkbox estiver marcado
      if (saveCredentials) {
        localStorage.setItem("savedCredentials", JSON.stringify(data));
      } else {
        localStorage.removeItem("savedCredentials");
      }

      const response = await authService.login(data);
      if (response.status === 201) {
        toast.success("Login realizado com sucesso!");
        response.data.user.role === "WAITER"
          ? router.push("/buffet")
          : router.push("/dashboard");
      }
    } catch (error: any) {
      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Credenciais inválidas";
        setLoginError(errorMessage);
        toast.error(errorMessage);
      } else {
        const errorMessage = "Erro ao conectar ao servidor. Tente novamente.";
        setLoginError(errorMessage);
        toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background px-3 py-6 sm:px-4 sm:py-8 md:px-6 lg:p-0">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
      <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-[26rem] xl:max-w-[28rem] shadow-2xl border-muted/20 backdrop-blur-sm bg-card/95 relative z-10">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 opacity-10" />

        <CardHeader className="pb-4 sm:pb-6 md:pb-8 relative z-10 space-y-2 sm:space-y-3">
          <CardTitle className="w-full flex justify-center mb-2 sm:mb-4">
            <Image
              className="w-24 sm:w-28 md:w-32 lg:w-36"
              src={Logo}
              alt="Logo"
              priority
            />
          </CardTitle>
          <p className="text-center text-muted-foreground text-base sm:text-lg">
            Acesse sua conta para continuar
          </p>
        </CardHeader>

        <CardContent className="relative z-10 px-4 sm:px-6 md:px-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 sm:space-y-5 md:space-y-6"
            noValidate
          >
            {loginError && (
              <Alert variant="destructive" className="py-3">
                <AlertDescription className="text-sm sm:text-base">
                  {loginError}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label
                htmlFor="login"
                className="text-sm sm:text-base font-medium"
              >
                Login
              </Label>
              <div className="relative">
                <Input
                  id="login"
                  type="text"
                  placeholder="Digite seu login"
                  className="pl-10 pr-4 h-11 sm:h-12 md:h-13 bg-background/50 text-sm sm:text-base"
                  {...register("username")}
                />
                <RiUser3Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-lg sm:text-xl" />
              </div>
              {errors.username && (
                <p className="text-destructive text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm sm:text-base font-medium"
              >
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua senha"
                  className="pl-10 pr-12 h-11 sm:h-12 md:h-13 bg-background/50 text-sm sm:text-base"
                  {...register("password")}
                />
                <RiLockPasswordLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-lg sm:text-xl" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-sm"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <RiEyeCloseLine className="text-lg sm:text-xl" />
                  ) : (
                    <RiEyeLine className="text-lg sm:text-xl" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-destructive text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="cnpj"
                className="text-sm sm:text-base font-medium"
              >
                CPF/CNPJ
              </Label>
              <div className="relative">
                <Input
                  id="cnpj"
                  type="text"
                  {...register("cnpj")}
                  placeholder="XX.XXX.XXX/XXXX-XX"
                  className="pl-10 pr-4 h-11 sm:h-12 md:h-13 bg-background/50 text-sm sm:text-base"
                />
                <RiBuilding4Line className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary text-lg sm:text-xl" />
              </div>
              {errors.cnpj && (
                <p className="text-destructive text-sm mt-1">
                  {errors.cnpj.message}
                </p>
              )}
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <Checkbox
                id="saveCredentials"
                checked={saveCredentials}
                onCheckedChange={(checked) =>
                  setSaveCredentials(checked as boolean)
                }
                className="h-4 w-4 sm:h-4 sm:w-4 md:h-5 md:w-5"
              />
              <label
                htmlFor="saveCredentials"
                className="text-xs sm:text-sm md:text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Salvar credenciais
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-11 sm:h-12 md:h-13 mt-4 sm:mt-6 flex items-center justify-center gap-2 text-sm sm:text-base md:text-lg font-medium shadow-md transition-all hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 sm:h-6 sm:w-6 border-2 border-current border-t-transparent rounded-full"></div>
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <RiLoginBoxLine className="text-lg sm:text-xl" />
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
