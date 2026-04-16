import ky, { type KyInstance, type Options } from "ky";
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
  removeRefreshToken,
} from "../utils/cookie.utils";

const BASE_URL = getApiBaseUrl();

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = ky
    .post(`${BASE_URL}/auth/refresh`, { credentials: "include" })
    .json<{ accessToken: string }>()
    .then((data) => {
      setAccessToken(data.accessToken);
      return data.accessToken;
    })
    .finally(() => {
      isRefreshing = false;
      refreshPromise = null;
    });

  return refreshPromise;
}

const instance: KyInstance = ky.create({
  prefix: BASE_URL,
  credentials: "include",
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = getAccessToken();
        if (token) {
          request.headers.set("Authorization", `Bearer ${token}`);
        }
      },
    ],
    afterResponse: [
      async ({ request, response }) => {
        if (response.status !== 401) return response;

        try {
          const newToken = await refreshAccessToken();
          request.headers.set("Authorization", `Bearer ${newToken}`);
          return ky(request);
        } catch {
          removeAccessToken();
          removeRefreshToken();
          window.location.href = "/login";
          return response;
        }
      },
    ],
  },
});

export const apiClient = {
  get: <T>(url: string, options?: Options) =>
    instance.get(url, options).json<T>(),

  post: <T>(url: string, json?: unknown, options?: Options) =>
    instance.post(url, { ...options, json }).json<T>(),

  patch: <T>(url: string, json?: unknown, options?: Options) =>
    instance.patch(url, { ...options, json }).json<T>(),

  delete: <T>(url: string, options?: Options) =>
    instance.delete(url, options).json<T>(),
};

function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  } else {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL environment variable is not defined",
    );
  }
}
