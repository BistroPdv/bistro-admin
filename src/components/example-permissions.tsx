import { usePermissions } from "@/hooks/use-permissions";
import { PermissionGuard } from "./permission-guard";
import { Button } from "./ui/button";

export function ExamplePermissions() {
  const { isOwner, isManager, currentRole } = usePermissions();

  return (
    <div className="space-y-4">
      {/* Botão visível apenas para OWNER */}
      <PermissionGuard roles={["OWNER"]}>
        <Button>Configurações Avançadas</Button>
      </PermissionGuard>

      {/* Botão visível para OWNER e MANAGER */}
      <PermissionGuard roles={["OWNER", "MANAGER"]}>
        <Button>Gerenciar Usuários</Button>
      </PermissionGuard>

      {/* Botão visível para todos */}
      <PermissionGuard roles={["OWNER", "MANAGER", "USER"]}>
        <Button>Ver Relatórios</Button>
      </PermissionGuard>

      {/* Exemplo de uso direto do hook */}
      {isOwner() && <Button>Recursos Exclusivos do Admin</Button>}
      {isManager() && <Button>Recursos do Gerente</Button>}

      {/* Exemplo de desabilitar botão baseado em permissão */}
      <Button disabled={!isOwner()}>Ação Restrita</Button>

      {/* Mostrar role atual */}
      <p>Seu nível de acesso: {currentRole}</p>
    </div>
  );
}
