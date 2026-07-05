import assert from "node:assert/strict";
import test from "node:test";

import { authCredentialsSchema, authTokenPayloadSchema } from "./auth.schemas";

void test("authCredentialsSchema normalizes user email", (): void => {
  const result = authCredentialsSchema.safeParse({
    email: "  User@Example.COM ",
    password: "password123"
  });

  if (!result.success) {
    assert.fail("Expected credentials to be valid");
  }

  assert.equal(result.data.email, "user@example.com");
});

void test("authCredentialsSchema rejects short passwords", (): void => {
  const result = authCredentialsSchema.safeParse({
    email: "user@example.com",
    password: "short"
  });

  assert.equal(result.success, false);
});

void test("authTokenPayloadSchema requires a subject", (): void => {
  const result = authTokenPayloadSchema.safeParse({
    email: "user@example.com"
  });

  assert.equal(result.success, false);
});
