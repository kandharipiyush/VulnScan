const isServer = typeof window === "undefined";
const internalBindingUrl = process.env.BACKEND_URL;

// On server with Vercel service binding: use BACKEND_URL injected by Vercel
// On client in production: use relative /api (handled by Vercel rewrite to backend)
// Local fallback: use NEXT_PUBLIC_API_URL or http://127.0.0.1:8000/api
export const API_BASE = (() => {
  if (isServer && internalBindingUrl) {
    return internalBindingUrl.endsWith("/api") ? internalBindingUrl : `${internalBindingUrl}/api`;
  }
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.endsWith("/api")
      ? process.env.NEXT_PUBLIC_API_URL
      : `${process.env.NEXT_PUBLIC_API_URL}/api`;
  }
  // When running on Vercel client-side without explicit env var, use relative path
  if (!isServer && process.env.NODE_ENV === "production") {
    return "/api";
  }
  return "http://127.0.0.1:8000/api";
})();

export const BACKEND_URL = API_BASE.replace(/\/api\/?$/, "");

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = "API Request Failed";
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  return response.json();
}
