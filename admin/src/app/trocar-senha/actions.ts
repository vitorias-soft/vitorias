"use server";

import { APIError } from "better-auth/api";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { FormState } from "@/components/admin/resource-form";
import { db } from "@/db";
import { user } from "@/db/schema";
import { auth } from "@/lib/auth";
import { requireSession } from "@/lib/session";

export async function changePassword(_state: FormState, formData: FormData): Promise<FormState> {
  const session = await requireSession();

  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (newPassword.length < 8) {
    return { errors: { newPassword: "A nova senha precisa ter ao menos 8 caracteres." } };
  }
  if (newPassword === currentPassword) {
    return { errors: { newPassword: "A nova senha precisa ser diferente da atual." } };
  }
  if (newPassword !== confirmation) {
    return { errors: { confirmation: "As senhas não coincidem." } };
  }

  try {
    await auth.api.changePassword({
      body: { currentPassword, newPassword, revokeOtherSessions: true },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      return { errors: { currentPassword: "Senha atual incorreta." } };
    }
    throw error;
  }

  await db.update(user).set({ mustChangePassword: false }).where(eq(user.id, session.user.id));
  redirect("/leis");
}
