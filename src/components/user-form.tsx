"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiLockLine,
  RiMailLine,
  RiUserLine,
  RiUserSettingsLine,
} from "@remixicon/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, insira um e-mail válido.",
  }),
  password: z
    .string()
    .min(6, {
      message: "Senha deve ter pelo menos 6 caracteres.",
    })
    .optional(),
  role: z.string({
    required_error: "Por favor, selecione um cargo.",
  }),
});

type User = z.infer<typeof formSchema>;

// Dados mockados para exemplo
const mockUsers: User[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@exemplo.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@exemplo.com",
    role: "manager",
  },
];

const roleColors = {
  admin: "bg-purple-500/10 text-purple-500",
  manager: "bg-blue-500/10 text-blue-500",
  waiter: "bg-green-500/10 text-green-500",
  chef: "bg-orange-500/10 text-orange-500",
};

const roleLabels = {
  admin: "Administrador",
  manager: "Gerente",
  waiter: "Garçom",
  chef: "Cozinheiro",
};

function UserFormModal({
  open,
  onOpenChange,
  editingUser,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  onSubmit: (values: User) => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit(values);
    onOpenChange(false);
    form.reset();
  };

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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <RiUserLine className="h-4 w-4" />
                      Nome
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <RiMailLine className="h-4 w-4" />
                      E-mail
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="seu@email.com"
                        type="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <RiLockLine className="h-4 w-4" />
                      Senha
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••"
                        type="password"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="manager">Gerente</SelectItem>
                        <SelectItem value="waiter">Garçom</SelectItem>
                        <SelectItem value="chef">Cozinheiro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
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

export function UserList() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function handleSubmit(values: User) {
    if (editingUser) {
      setUsers(
        users.map((user) =>
          user.id === editingUser.id ? { ...values, id: user.id } : user
        )
      );
      toast.success("Usuário atualizado com sucesso!");
    } else {
      const newUser = { ...values, id: String(users.length + 1) };
      setUsers([...users, newUser]);
      toast.success("Usuário cadastrado com sucesso!");
    }

    setEditingUser(null);
  }

  function handleEdit(user: User) {
    setEditingUser(user);
    setIsModalOpen(true);
  }

  function handleDelete(id: string) {
    setUsers(users.filter((user) => user.id !== id));
    toast.success("Usuário removido com sucesso!");
  }

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Usuários</h2>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <RiAddLine className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <UserFormModal
            open={isModalOpen}
            onOpenChange={setIsModalOpen}
            editingUser={editingUser}
            onSubmit={handleSubmit}
          />
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium truncate">{user.name}</p>
                    <Badge
                      variant="secondary"
                      className={
                        roleColors[user.role as keyof typeof roleColors]
                      }
                    >
                      {roleLabels[user.role as keyof typeof roleLabels]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(user)}
                    className="h-8 w-8"
                  >
                    <RiEditLine className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(user.id!)}
                    className="h-8 w-8"
                  >
                    <RiDeleteBinLine className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
