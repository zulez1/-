const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getTokens() {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem("sem_access_token"),
    refreshToken: localStorage.getItem("sem_refresh_token"),
  };
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem("sem_access_token", accessToken);
  localStorage.setItem("sem_refresh_token", refreshToken);
}

export function clearTokens() {
  localStorage.removeItem("sem_access_token");
  localStorage.removeItem("sem_refresh_token");
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function tryRefresh(): Promise<string | null> {
  const { refreshToken } = getTokens();
  if (!refreshToken) return null;

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) {
    clearTokens();
    return null;
  }
  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return data.accessToken as string;
}

interface ApiOptions extends RequestInit {
  auth?: boolean;
}

export async function api<T = unknown>(path: string, options: ApiOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const { accessToken } = getTokens();

  const doFetch = async (token: string | null) => {
    return fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  };

  let res = await doFetch(accessToken);

  if (res.status === 401 && auth) {
    const newToken = await tryRefresh();
    if (newToken) {
      res = await doFetch(newToken);
    }
  }

  if (!res.ok) {
    let message = `Ошибка запроса (${res.status})`;
    try {
      const body = await res.json();
      message = Array.isArray(body.message) ? body.message.join(", ") : body.message ?? message;
    } catch {
      // ignore json parse errors
    }
    throw new ApiError(message, res.status);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
