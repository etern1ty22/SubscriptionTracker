"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { z } from "zod";

import styles from "../app/auth.module.css";
import { getApiErrorMessage, getPublicApiUrl } from "../lib/auth-api";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

const authFormSchema = z.object({
  email: z.string().trim().max(254).refine((value) => emailRegex.test(value), "Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long")
});

type AuthFormFields = z.infer<typeof authFormSchema>;
type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const modeCopy = {
  login: {
    endpoint: "login",
    pendingLabel: "Logging in...",
    submitLabel: "Log in"
  },
  register: {
    endpoint: "register",
    pendingLabel: "Creating account...",
    submitLabel: "Create account"
  }
} satisfies Record<AuthMode, { endpoint: string; pendingLabel: string; submitLabel: string }>;

export function AuthForm({ mode }: AuthFormProps): ReactElement {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isNavigating, startTransition] = useTransition();
  const copy = modeCopy[mode];
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register
  } = useForm<AuthFormFields>({
    defaultValues: {
      email: "",
      password: ""
    },
    resolver: zodResolver(authFormSchema)
  });

  const onSubmit: SubmitHandler<AuthFormFields> = async (values): Promise<void> => {
    setServerError(null);

    const response = await fetch(`${getPublicApiUrl()}/auth/${copy.endpoint}`, {
      body: JSON.stringify(values),
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      method: "POST"
    });

    if (!response.ok) {
      setServerError(await getApiErrorMessage(response));
      return;
    }

    startTransition(() => {
      router.replace("/dashboard");
      router.refresh();
    });
  };
  const submitForm = handleSubmit(onSubmit);
  const isBusy = isSubmitting || isNavigating;

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        void submitForm(event);
      }}
    >
      <label className={styles.field}>
        <span>Email</span>
        <input
          aria-invalid={errors.email === undefined ? "false" : "true"}
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          type="email"
          {...register("email")}
        />
        {errors.email?.message === undefined ? null : <p className={styles.fieldError}>{errors.email.message}</p>}
      </label>

      <label className={styles.field}>
        <span>Password</span>
        <input
          aria-invalid={errors.password === undefined ? "false" : "true"}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder="At least 8 characters"
          type="password"
          {...register("password")}
        />
        {errors.password?.message === undefined ? null : (
          <p className={styles.fieldError}>{errors.password.message}</p>
        )}
      </label>

      {serverError === null ? null : <p className={styles.serverError}>{serverError}</p>}

      <button className={styles.submitButton} disabled={isBusy} type="submit">
        {isBusy ? copy.pendingLabel : copy.submitLabel}
      </button>
    </form>
  );
}
