import ky, { type KyInstance, type Options } from "ky";
import {
  getAccessToken,
  removeAccessToken,
  setAccessToken,
  removeRefreshToken,
} from "../utils/cookie.utils";

const BASE_URL = "/api/proxy";

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

  patch: <T = void>(url: string, json?: unknown, options?: Options) => {
    const response = instance.patch(url, { ...options, json });
    return response.then(async (r) => {
      if (r.status === 204) return undefined as T;
      return r.json() as Promise<T>;
    });
  },

  put: <T>(url: string, json?: unknown, options?: Options) =>
    instance.put(url, { ...options, json }).json<T>(),

  delete: <T = void>(url: string, options?: Options) => {
    const response = instance.delete(url, options);
    return response.then(async (r) => {
      if (r.status === 204) return undefined as T;
      return r.json() as Promise<T>;
    });
  },
};
