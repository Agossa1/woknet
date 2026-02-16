/**
 * api.client.ts
 * Classe API Client utilisant le pattern Singleton et l'Encapsulation
 */

// On garde l'erreur comme une classe exportée (c'est déjà de la POO)
export class ApiError extends Error {
  status: number;
  data: any;
  errorId?: string;
  userMessage: string;

  constructor(status: number, message: string, data?: any, errorId?: string) {
    super(message);
    this.status = status;
    this.data = data;
    this.errorId = errorId;
    this.userMessage = message;
    this.name = "ApiError";
    // Fix pour l'héritage d'Error en TS compilé vers ES5
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Types
export type RequestOptions = RequestInit & {
  headers?: Record<string, string>;
};

export class ApiClient {
  private baseUrl: string;

  // Patterns sensibles encapsulés dans la classe (static car constants)
  private static SENSITIVE_CLIENT_PATTERNS: RegExp[] = [
    /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi,
    /\bBearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
    /\b[A-Za-z]:[\\/][^\s"]+/g,
    /\/[A-Za-z0-9_\-./]+(?:\.[A-Za-z0-9]+)?/g,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
  ];

  /**
   * Le constructeur permet de configurer l'URL de base.
   * Par défaut, il prend celle de l'environnement Vite.
   */
  constructor(baseUrl: string = "http://localhost:4000/api") {
    this.baseUrl = baseUrl;
  }

  // --- MÉTHODES PUBLIQUES (L'interface de ta classe) ---

  public get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  public post<T>(endpoint: string, body: any, options?: RequestOptions & { onUploadProgress?: (ev: ProgressEvent) => void }): Promise<T> {
    if (options?.onUploadProgress) {
      return this.xhrRequest<T>(endpoint, "POST", body, options);
    }
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  private xhrRequest<T>(endpoint: string, method: string, body: any, options: RequestOptions & { onUploadProgress?: (ev: ProgressEvent) => void }): Promise<T> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `${this.baseUrl}${endpoint}`;

      xhr.open(method, url, true);
      xhr.withCredentials = true;

      if (options.onUploadProgress) {
        xhr.upload.onprogress = options.onUploadProgress;
      }

      const headers: Record<string, string> = {
        Accept: "application/json",
        ...(options.headers as Record<string, string>)
      };

      let processedBody = body;
      const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

      if (!isFormData && body !== undefined && body !== null) {
        headers["Content-Type"] = "application/json";
        processedBody = JSON.stringify(body);
      }

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value as string);
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve({} as T);
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            this.handleError(xhr.status, data);
          } catch (e) {
            if (e instanceof ApiError) reject(e);
            else reject(new ApiError(xhr.status, "Erreur serveur"));
          }
        }
      };

      xhr.onerror = () => reject(new ApiError(0, "Erreur réseau"));
      xhr.send(processedBody);
    });
  }

  public put<T>(endpoint: string, body: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  public patch<T>(endpoint: string, body: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  public delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }

  // --- CŒUR DU SYSTÈME (Encapsulé) ---

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(options.headers as Record<string, string>),
    };

    let body = options.body;
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    const isBlob = typeof Blob !== "undefined" && body instanceof Blob;

    if (body !== undefined && body !== null && !isFormData && !isBlob && typeof body !== "string") {
      headers["Content-Type"] = headers["Content-Type"] ?? "application/json";
      body = JSON.stringify(body);
    }

    const config: RequestInit = {
      ...options,
      headers,
      body,
      credentials: options.credentials ?? "include",
    };

    // Gestion CSRF interne
    const method = (config.method ?? "GET").toUpperCase();
    if (this.requiresCsrf(method) && this.isSameOrigin(url)) {
      const csrf = this.getCsrfToken();
      if (csrf && !headers["X-CSRF-Token"]) {
        headers["X-CSRF-Token"] = csrf;
      }
    }

    try {
      let response = await fetch(url, config);
      console.debug(`[ApiClient] Requesting ${endpoint}, status: ${response.status}`);

      // Gestion automatique du Refresh Token si 401 (Session Access expirée)
      if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
        try {
          const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Accept': 'application/json' }
          });

          if (refreshResponse.ok) {
            console.debug(`[ApiClient] Refresh successful for ${endpoint}, retrying...`);
            // Le cookie access_token a été mis à jour par le backend, on re-tente
            response = await fetch(url, config);
          } else {
            console.warn(`[ApiClient] Refresh failed for ${endpoint}: ${refreshResponse.status}`);
          }
        } catch (e) {
          // Échec du refresh (par exemple Refresh Token lui-même expiré)
          // On laisse la réponse 401 originale être traitée
        }
      }

      if (response.status === 204) {
        return {} as T;
      }

      const contentType = response.headers.get("content-type") || "";
      let data: any;
      if (contentType.includes("application/json")) {
        data = await response.json().catch(() => ({}));
      } else {
        data = await response.text().catch(() => "");
      }

      if (!response.ok) {
        this.handleError(response.status, data); // Appel d'une sous-méthode privée pour la propreté
      }

      return data as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      const fallbackMessage = "Impossible de contacter le serveur. Vérifiez votre connexion.";
      const networkError = error instanceof Error ? error : new Error(String(error));
      const safeMessage = this.sanitizeClientMessage(networkError.message || fallbackMessage);

      const apiError = new ApiError(500, fallbackMessage, { originalMessage: safeMessage });
      apiError.userMessage = fallbackMessage;
      throw apiError;
    }
  }

  // --- UTILITAIRES INTERNES (Private Helpers) ---

  private handleError(status: number, data: any): never {
    // 1. Recherche exhaustive d'un message d'erreur dans la réponse
    const backendMessage =
      data?.message ||
      data?.error ||
      (Array.isArray(data?.errors) ? data.errors[0] : (typeof data?.errors === 'string' ? data.errors : null)) ||
      (typeof data === 'string' ? data : null);

    const errorId = data?.errorId;
    const friendlyFallback = this.buildFriendlyMessage(status);

    // Priorité absolue au message spécifique du backend
    const finalMessage = backendMessage || friendlyFallback || "Une erreur est survenue";

    // Trace pour le debug en développement (sauf pour 401 qui est un état normal pour les invités)
    if (status !== 401) {
      console.warn(`[ApiClient] Error ${status}:`, { backendMessage, data });
    }

    const apiError = new ApiError(status, finalMessage, data, errorId);
    apiError.userMessage = finalMessage;

    // Gestion spécifique: Redirection vérification boutique
    if (status === 403 && data?.error === 'SHOP_NOT_VERIFIED' && data?.redirectUrl) {
      window.location.href = data.redirectUrl;
    }

    throw apiError;
  }

  private requiresCsrf(method: string): boolean {
    return ["POST", "PUT", "PATCH", "DELETE"].includes(method);
  }

  private isSameOrigin(url: string): boolean {
    try {
      const target = new URL(url, window.location.origin);
      return target.origin === window.location.origin;
    } catch {
      return false;
    }
  }

  private getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null; // SSR safety
    const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
    if (meta?.content) return meta.content;
    const match = document.cookie.match(/(^|; )csrftoken=([^;]+)/);
    return match ? decodeURIComponent(match[2]) : null;
  }

  private sanitizeClientMessage(message: string): string {
    let sanitized = message;
    ApiClient.SENSITIVE_CLIENT_PATTERNS.forEach((pattern) => {
      sanitized = sanitized.replace(pattern, "***");
    });
    return sanitized.length > 500 ? sanitized.slice(0, 497) + "..." : sanitized;
  }

  private buildFriendlyMessage(status: number): string {
    const messages: Record<number, string> = {
      400: "Données invalides.",
      401: "Session expirée.",
      403: "Accès refusé.",
      404: "Ressource introuvable.",
    };
    if (messages[status]) return messages[status];
    if (status >= 400 && status < 500) return "Erreur lors du traitement.";
    return "Erreur interne serveur.";
  }
}

// ==========================================================
// EXPORTATION (Singleton pour usage direct)
// ==========================================================

// Tu exportes une instance par défaut, exactement comme ton objet `api` précédent
export const api = new ApiClient();

// Tu peux aussi exporter la classe si tu veux créer des instances spécifiques ailleurs
// ex: const adminApi = new ApiClient('https://admin.api.com');