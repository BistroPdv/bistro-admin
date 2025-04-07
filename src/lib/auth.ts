import api from "./api";

interface LoginCredentials {
  username: string;
  password: string;
  cnpj: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  /**
   * Realiza o login do usuário
   * @param credentials Credenciais de login (login, senha e CNPJ)
   * @returns Promise com os dados do usuário e token
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>("/auth/login", credentials);

      // Armazena o token no localStorage
      localStorage.setItem("token", response.data.token);

      // Armazena informações básicas do usuário
      localStorage.setItem("user", JSON.stringify(response.data.user));

      return response.data;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  },

  /**
   * Verifica se o usuário está autenticado
   * @returns boolean indicando se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");

    if (!token) {
      return false;
    }

    try {
      // Verificação básica do formato do token JWT
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("Token inválido: formato incorreto");
        this.logout();
        return false;
      }

      // Decodificar o payload do token para verificar a expiração
      try {
        const payload = JSON.parse(atob(tokenParts[1]));

        // Verificar se o token expirou
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.error("Token expirado");
          this.logout();
          return false;
        }
      } catch (e) {
        console.error("Erro ao decodificar token:", e);
        this.logout();
        return false;
      }

      // Iniciar uma verificação assíncrona com o backend
      // Esta verificação não bloqueia o retorno da função,
      // mas irá fazer logout se o token for inválido
      // this.validateTokenWithServer();

      return true;
    } catch (error) {
      console.error("Erro ao verificar autenticação:", error);
      this.logout();
      return false;
    }
  },

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redireciona para a página de login
    window.location.href = "/";
  },

  /**
   * Obtém o token de autenticação
   * @returns Token de autenticação ou null se não estiver autenticado
   */
  getToken(): string | null {
    return localStorage.getItem("token");
  },

  /**
   * Obtém os dados do usuário logado
   * @returns Dados do usuário ou null se não estiver autenticado
   */
  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  /**
   * Valida o token com o servidor
   * Esta função é assíncrona e não bloqueia a execução
   */
  validateTokenWithServer(): void {
    const token = this.getToken();

    if (!token) {
      return;
    }

    // Faz uma requisição para o endpoint de validação do token
    api.get("/auth/validate").catch((error) => {
      console.error("Erro ao validar token com o servidor:", error);

      // Se receber um erro 401 (Unauthorized), faz logout
      if (error.response && error.response.status === 401) {
        this.logout();
      }
    });
  },
};
