import { ServiceError, ServiceErrorCode } from '../types/api';

export type QueryParamValue = string | number | boolean | undefined | null | Array<string | number>;

export interface ApiRequestOptions<TBody = unknown> {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  params?: Record<string, QueryParamValue>;
  body?: TBody;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export type AuthTokenProvider = () => Promise<string | null> | string | null;

/**
 * Reusable HTTP API client for future backend integration (e.g., REST API or Supabase Edge Functions).
 *
 * Security Note:
 * Only public configuration (such as VITE_API_BASE_URL) may be read from import.meta.env.
 * Never store service-role keys or private secrets in browser environment variables.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private tokenProvider: AuthTokenProvider | null = null;

  constructor(baseUrl?: string) {
    const envBaseUrl =
      typeof import.meta !== 'undefined' && import.meta.env
        ? (import.meta.env.VITE_API_BASE_URL as string | undefined)
        : undefined;
    this.baseUrl = (baseUrl ?? envBaseUrl ?? '').replace(/\/+$/, '');
  }

  /**
   * Returns true if a custom REST API base URL is configured.
   */
  public isConfigured(): boolean {
    return this.baseUrl.length > 0;
  }

  /**
   * Registers a callback that supplies the current bearer access token
   * when an authentication provider (such as Supabase Auth) is integrated.
   */
  public setAuthTokenProvider(provider: AuthTokenProvider | null): void {
    this.tokenProvider = provider;
  }

  private buildUrl(endpoint: string, params?: Record<string, QueryParamValue>): string {
    const normalizedPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const fullPath = this.baseUrl ? `${this.baseUrl}${normalizedPath}` : normalizedPath;

    if (!params) return fullPath;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.set(key, String(value));
      }
    });

    const queryString = searchParams.toString();
    return queryString ? `${fullPath}?${queryString}` : fullPath;
  }

  private mapStatusToErrorCode(status: number): ServiceErrorCode {
    if (status === 400 || status === 422) return 'VALIDATION_ERROR';
    if (status === 401) return 'UNAUTHORIZED';
    if (status === 403) return 'FORBIDDEN';
    if (status === 404) return 'NOT_FOUND';
    if (status === 409) return 'CONFLICT';
    return 'UNKNOWN_ERROR';
  }

  public async request<TResponse, TBody = unknown>(
    endpoint: string,
    options: ApiRequestOptions<TBody> = {}
  ): Promise<TResponse> {
    const { method = 'GET', params, body, headers = {}, signal } = options;
    const url = this.buildUrl(endpoint, params);

    const requestHeaders: Record<string, string> = {
      Accept: 'application/json',
      ...headers
    };

    if (body !== undefined && !(body instanceof FormData)) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    if (this.tokenProvider) {
      const token = await this.tokenProvider();
      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers: requestHeaders,
        body:
          body === undefined
            ? undefined
            : body instanceof FormData
            ? body
            : JSON.stringify(body),
        signal
      });
    } catch (networkErr) {
      throw new ServiceError(
        networkErr instanceof Error ? networkErr.message : 'Network request failed',
        'NETWORK_ERROR'
      );
    }

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const payload = isJson ? await response.json().catch(() => null) : await response.text().catch(() => '');

    if (!response.ok) {
      const message =
        (payload && typeof payload === 'object' && ('message' in payload || 'error' in payload)
          ? String((payload as Record<string, unknown>).message || (payload as Record<string, unknown>).error)
          : null) || `Request failed with HTTP status ${response.status}`;

      const details =
        payload && typeof payload === 'object' && 'details' in payload
          ? ((payload as Record<string, unknown>).details as Record<string, string>)
          : undefined;

      throw new ServiceError(
        message,
        this.mapStatusToErrorCode(response.status),
        response.status,
        details
      );
    }

    return payload as TResponse;
  }

  public get<TResponse>(
    endpoint: string,
    params?: Record<string, QueryParamValue>,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.request<TResponse>(endpoint, { method: 'GET', params, headers });
  }

  public post<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, { method: 'POST', body, headers });
  }

  public put<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, { method: 'PUT', body, headers });
  }

  public patch<TResponse, TBody = unknown>(
    endpoint: string,
    body?: TBody,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.request<TResponse, TBody>(endpoint, { method: 'PATCH', body, headers });
  }

  public delete<TResponse>(
    endpoint: string,
    params?: Record<string, QueryParamValue>,
    headers?: Record<string, string>
  ): Promise<TResponse> {
    return this.request<TResponse>(endpoint, { method: 'DELETE', params, headers });
  }
}

export const apiClient = new ApiClient();
