import assert from "node:assert/strict";
import test from "node:test";

import { AUTH_COOKIE_NAME } from "./auth.config";
import { getCookieValue } from "./auth.cookies";

void test("getCookieValue returns a named cookie from a Cookie header", (): void => {
  const value = getCookieValue(`theme=light; ${AUTH_COOKIE_NAME}=abc123; locale=en`, AUTH_COOKIE_NAME);

  assert.equal(value, "abc123");
});

void test("getCookieValue decodes encoded cookie values", (): void => {
  const value = getCookieValue(`${AUTH_COOKIE_NAME}=token%20value`, AUTH_COOKIE_NAME);

  assert.equal(value, "token value");
});

void test("getCookieValue returns null when the cookie is absent", (): void => {
  const value = getCookieValue("theme=light", AUTH_COOKIE_NAME);

  assert.equal(value, null);
});
