import type { CategoriesListResponse, Category, CategoryResponse } from "@subscription-tracker/shared";

import { getApiErrorMessage, getServerApiUrl } from "./auth-api";

export async function fetchCategories(cookieHeader: string): Promise<Category[]> {
  const response = await fetch(`${getServerApiUrl()}/categories`, {
    cache: "no-store",
    headers: getCookieHeaders(cookieHeader)
  });

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return parseCategoriesListResponse(await response.json()).categories;
}

export async function fetchCategory(cookieHeader: string, id: string): Promise<Category | null> {
  const response = await fetch(`${getServerApiUrl()}/categories/${encodeURIComponent(id)}`, {
    cache: "no-store",
    headers: getCookieHeaders(cookieHeader)
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await getApiErrorMessage(response));
  }

  return parseCategoryResponse(await response.json()).category;
}

function getCookieHeaders(cookieHeader: string): HeadersInit {
  return cookieHeader.trim().length > 0 ? { cookie: cookieHeader } : {};
}

function parseCategoriesListResponse(payload: unknown): CategoriesListResponse {
  if (!isRecord(payload) || !Array.isArray(payload.categories) || !payload.categories.every(isCategory)) {
    throw new Error("Unexpected categories response");
  }

  return {
    categories: payload.categories
  };
}

function parseCategoryResponse(payload: unknown): CategoryResponse {
  if (!isRecord(payload) || !isCategory(payload.category)) {
    throw new Error("Unexpected category response");
  }

  return {
    category: payload.category
  };
}

function isCategory(value: unknown): value is Category {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.color === "string" &&
    typeof value.subscriptionCount === "number" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
