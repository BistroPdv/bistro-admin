"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/api";
import { UserType } from "@/schemas/users-schema";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";
import {
  RiAddLine,
  RiDeleteBinLine,
  RiEditLine,
  RiToggleLine,
  RiUserFollowLine,
} from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError, AxiosResponse } from "axios";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { UserFormModal } from "./user-modal-form";

const roleColors = {
  OWNER: "bg-purple-500/10 text-purple-500",
  MANAGER: "bg-blue-500/10 text-blue-500",
  USER: "bg-green-500/10 text-green-500",
  WAITER: "bg-yellow-500/10 text-yellow-500",
};

const roleLabels = {
  OWNER: "Administrador",
  MANAGER: "Gerente",
  USER: "Usuário",
  WAITER: "Garçom",
};

export function UserList() {
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery<
    AxiosResponse,
    Error,
    UserType[]
  >({
    queryKey: ["users"],
    queryFn: () => api.get("/users"),
    select: (data) => data.data.data,
  });

  const createUserMutation = useMutation({
    mutationFn: (newUser: UserType) => api.post("/users", newUser),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário cadastrado com sucesso!");
    },
    onError: (error: AxiosError<{ statusCode: number; message: string }>) => {
      toast.error(error.response?.data.message);
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: (user: UserType) => api.put(`/users/${user.id}`, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário atualizado com sucesso!");
    },
    onError: (error: AxiosError<{ statusCode: number; message: string }>) => {
      toast.error(error.response?.data.message);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário removido com sucesso!");
    },
    onError: (error: AxiosError<{ statusCode: number; message: string }>) => {
      toast.error(error.response?.data.message);
    },
  });

  const toggleUserStatusMutation = useMutation({
    mutationFn: (user: UserType) => api.patch(`/users/${user.id}/active`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Status do usuário alterado com sucesso!");
    },
    onError: (error: AxiosError<{ statusCode: number; message: string }>) => {
      toast.error(error.response?.data.message);
    },
  });

  function handleSubmit(values: UserType) {
    if (editingUser) {
      updateUserMutation.mutate(values);
    } else {
      createUserMutation.mutate(values);
    }
  }

  function handleEdit(user: UserType) {
    setEditingUser(user);
    setIsModalOpen(true);
  }

  function handleDelete(id: string) {
    deleteUserMutation.mutate(id);
  }

  function handleToggleStatus(user: UserType) {
    toggleUserStatusMutation.mutate(user);
  }

  function getInitials(username: string) {
    if (!username) return "";
    return username
      .split(" ")
      .filter((_, i) => i === 0 || i === username.split(" ").length - 1)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold flex gap-2 items-center">
          <RiUserFollowLine /> Usuários
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <RiAddLine className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <UserFormModal
            open={isModalOpen}
            onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) {
                setEditingUser(null);
              }
            }}
            editingUser={editingUser}
            onSubmit={handleSubmit}
          />
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4">
            {isLoading ? (
              <div className="text-center py-4">Carregando usuários...</div>
            ) : users.length === 0 ? (
              <div className="text-center py-4">Nenhum usuário encontrado</div>
            ) : (
              users?.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(user?.nome || user?.username)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {user.nome || user.username}
                      </p>
                      <Badge
                        variant="secondary"
                        className={
                          roleColors[user.role as keyof typeof roleColors]
                        }
                      >
                        {roleLabels[user.role as keyof typeof roleLabels]}
                      </Badge>
                      {user.ativo === false && (
                        <Badge
                          variant="outline"
                          className="bg-red-500/10 text-red-500"
                        >
                          Inativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleStatus(user)}
                      className="h-8 w-8"
                      title={
                        user.ativo ? "Desativar usuário" : "Ativar usuário"
                      }
                    >
                      {user.ativo ? (
                        <RiToggleLine className="text-green-500 rotate-180" />
                      ) : (
                        <RiToggleLine className="text-red-500" />
                      )}
                    </Button>
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
