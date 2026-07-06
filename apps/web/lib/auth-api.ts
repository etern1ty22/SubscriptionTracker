export type AuthUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

type AuthResponse = {
  user: AuthUser;
};

const DEFAULT_API_URL = "http://localhost:4000";

export function getPublicApiUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

export function getServerApiUrl(): string {
  return process.env.INTERNAL_API_URL ?? getPublicApiUrl();
}

export async function fetchCurrentUser(cookieHeader: string): Promise<AuthUser | null> {
  const headers: HeadersInit = cookieHeader.trim().length > 0 ? { cookie: cookieHeader } : {};
  const response = await fetch(`${getServerApiUrl()}/auth/me`, {
    cache: "no-store",
    headers
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return parseAuthResponse(await response.json()).user;
}

export async function getApiErrorMessage(response: Response): Promise<string> {
  const fallback = response.statusText.length > 0 ? response.statusText : "Request failed";

  try {
    const payload: unknown = await response.json();

    if (!isRecord(payload)) {
      return fallback;
    }

    const message = payload.message;

    if (typeof message === "string") {
      return message;
    }

    if (Array.isArray(message) && message.every((item): item is string => typeof item === "string")) {
      return message.join(", ");
    }

    const error = payload.error;

    if (typeof error === "string") {
      return error;
    }

    return fallback;
  } catch {
    return fallback;
  }
}

function parseAuthResponse(payload: unknown): AuthResponse {
  if (!isRecord(payload) || !isAuthUser(payload.user)) {
    throw new Error("Unexpected auth response");
  }

  return {
    user: payload.user
  };
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.email === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
