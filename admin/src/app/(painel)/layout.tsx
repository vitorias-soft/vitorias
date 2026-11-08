import { LogOut } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

import { PanelNav } from "@/components/admin/panel-nav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { signOut } from "./sign-out-action";

// Todas as páginas leem a sessão a cada requisição; o painel não precisa de
// navegação instantânea, e dados sensíveis de sessão não entram em cache.
export const instant = false;

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b bg-card">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3">
          <div className="flex items-center gap-3">
            <Image src="/brand/logo.png" alt="" width={40} height={40} className="rounded-full" />
            <span className="font-heading text-lg font-bold">Administração</span>
          </div>
          <PanelNav />
          <form action={signOut} className="ml-auto">
            <Button type="submit" variant="ghost" className="text-destructive">
              Sair
              <LogOut />
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>{children}</Suspense>
      </main>
    </div>
  );
}
