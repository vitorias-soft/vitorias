"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { FormState } from "@/components/admin/resource-form";
import { auth } from "@/lib/auth";

export async function signIn(_state: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { errors: { password: "Informe e-mail e senha." } };
  }

  try {
    await auth.api.signInEmail({ body: { email, password }, headers: await headers() });
  } catch (error) {
    if (error instanceof APIError) {
      return { errors: { password: "E-mail ou senha incorretos." } };
    }
    throw error;
  }

  // /leis leva a /trocar-senha enquanto a troca estiver pendente.
  redirect("/leis");
}
