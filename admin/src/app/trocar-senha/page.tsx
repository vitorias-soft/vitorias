import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ResourceForm } from "@/components/admin/resource-form";
import { Skeleton } from "@/components/ui/skeleton";
import { requireSession } from "@/lib/session";

import { changePassword } from "./actions";

export const instant = false;

async function ChangePasswordForm() {
  const session = await requireSession();
  if (!session.user.mustChangePassword) redirect("/leis");

  return (
    <ResourceForm
      action={changePassword}
      cancelHref="/login"
      submitLabel="Trocar senha"
      hideCancel
      fields={[
        { type: "password", name: "currentPassword", label: "Senha temporária", required: true },
        {
          type: "password",
          name: "newPassword",
          label: "Nova senha",
          required: true,
          hint: "Ao menos 8 caracteres, diferente da temporária.",
        },
        { type: "password", name: "confirmation", label: "Confirme a nova senha", required: true },
      ]}
    />
  );
}

export default function ChangePasswordPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-2xl font-bold">Troque sua senha</h1>
        <p className="text-sm text-muted-foreground">
          No primeiro acesso, é preciso definir uma senha própria antes de usar o painel.
        </p>
      </div>
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <ChangePasswordForm />
      </Suspense>
    </main>
  );
}
