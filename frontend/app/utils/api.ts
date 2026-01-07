// API client configuration
// Base URL configurable via environment variable `NUXT_PUBLIC_API_BASE_URL`
// Use a getter function that is evaluated each time to ensure we have the latest config
function getApiBaseUrl(): string {
  // Try to get from window.__NUXT__ if on client and available
  if (typeof window !== 'undefined' && (window as any).__NUXT__?.config?.public?.apiBase) {
    return (window as any).__NUXT__.config.public.apiBase;
  }

  // For local development without Docker/Caddy, default to localhost:3000
  // For Docker/Caddy setup, use localhost (port 80)
  // Users should set NUXT_PUBLIC_API_BASE_URL in .env.local for local dev
  return "http://localhost";
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: any;
  status?: number;
}

class ApiClient {
  // Make baseURL a getter so it's evaluated dynamically
  private get baseURL(): string {
    return getApiBaseUrl();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {

    let normalizedEndpoint = endpoint;
    if (
      endpoint.startsWith("/api/") &&
      !endpoint.includes("?") &&
      !endpoint.endsWith("/")
    ) {
      const parts = endpoint.split("/");
      const lastPart = parts[parts.length - 1];
      if (!lastPart || lastPart === parts[2]) {
        normalizedEndpoint = endpoint + "/";
      }
    }

    const url = `${this.baseURL}${normalizedEndpoint}`;

    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Get token from localStorage if exists
    if (import.meta.client) {
      const token = localStorage.getItem("auth_token");
      if (token) {
        defaultHeaders["Authorization"] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data?.message || data?.error || "Une erreur est survenue",
          message: data?.message,
          errors: data?.errors || undefined,
          status: response.status,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data?.message,
        errors: data?.errors || undefined,
      };
    } catch (error) {
      console.error("API Error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erreur de connexion au serveur",
        errors: undefined,
      };
    }
  }

  async get<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(
    endpoint: string,
    options?: RequestInit,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

export const apiClient = new ApiClient();
export type { ApiResponse };
