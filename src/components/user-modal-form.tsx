"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";

import { FormField } from "@/components/form-field";
import { userFormSchema, UserType } from "@/schemas/users-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiIdCardLine,
  RiLockLine,
  RiMailLine,
  RiUserLine,
  RiUserSettingsLine,
} from "@remixicon/react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export function UserFormModal({
  open,
  onOpenChange,
  editingUser,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: UserType | null;
  onSubmit: (values: UserType) => void;
}) {
  const form = useForm<UserType>({
    resolver: zodResolver(userFormSchema),
    defaultValues: editingUser || {
      username: "",
      nome: "",
      email: "",
      password: "",
      role: "",
      ativo: true,
    },
  });

  const handleSubmit = (values: UserType) => {
    onSubmit(values);
  };

  useEffect(() => {
    if (editingUser !== null) {
      form.reset(editingUser);
    } else {
      form.reset({
        username: "",
        nome: "",
        email: "",
        password: "",
        role: "",
        ativo: true,
      });
    }
  }, [editingUser]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RiUserSettingsLine className="h-5 w-5" />
            {editingUser ? "Editar Usuário" : "Cadastrar Novo Usuário"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            <div className="grid gap-6">
              <FormField
                control={form.control}
                name="nome"
                label="Nome"
                icon={<RiUserLine className="h-4 w-4" />}
                placeholder="Nome completo"
                type="text"
              />

              <FormField
                control={form.control}
                name="username"
                label="Usuário"
                icon={<RiIdCardLine className="h-4 w-4" />}
                placeholder="Usuário para login"
              />

              <FormField
                control={form.control}
                name="email"
                label="E-mail"
                icon={<RiMailLine className="h-4 w-4" />}
                placeholder="seu@email.com"
              />

              <FormField
                control={form.control}
                name="password"
                label="Senha"
                icon={<RiLockLine className="h-4 w-4" />}
                placeholder="••••••"
                type="password"
              />

              {/* confirm password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                label="Confirmar Senha"
                icon={<RiLockLine className="h-4 w-4" />}
                placeholder="••••••"
                type="password"
              />

              <FormField
                control={form.control}
                name="role"
                label="Cargo"
                placeholder="Selecione um cargo"
                type="select"
                options={[
                  { value: "OWNER", label: "Administrador" },
                  { value: "MANAGER", label: "Gerente" },
                  { value: "USER", label: "Usuário" },
                  { value: "WAITER", label: "Garçom" },
                ]}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1">
                {editingUser ? "Atualizar Usuário" : "Cadastrar Usuário"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
