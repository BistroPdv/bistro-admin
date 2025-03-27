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
    return !!localStorage.getItem("token");
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
};
