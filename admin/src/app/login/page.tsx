import Image from "next/image";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ResourceForm } from "@/components/admin/resource-form";
import { getSession } from "@/lib/session";

import { signIn } from "./actions";

export const instant = false;

async function RedirectIfSignedIn() {
  if (await getSession()) redirect("/leis");
  return null;
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6 px-6 py-12">
      <Suspense fallback={<Skeleton className="h-0" />}>
        <RedirectIfSignedIn />
      </Suspense>
      <div className="flex flex-col items-center gap-3 text-center">
        <Image src="/brand/logo.png" alt="" width={96} height={96} className="rounded-full" />
        <h1 className="font-heading text-2xl font-bold">Entrar como admin</h1>
      </div>
      <ResourceForm
        action={signIn}
        cancelHref="/login"
        submitLabel="Entrar"
        hideCancel
        fields={[
          { type: "text", name: "email", label: "E-mail", required: true },
          { type: "password", name: "password", label: "Senha", required: true },
        ]}
      />
    </main>
  );
}
