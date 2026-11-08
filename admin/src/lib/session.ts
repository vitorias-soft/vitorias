import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { auth } from "./auth";

export const getSession = cache(async () =>
  auth.api.getSession({ headers: await headers() }),
);

/** Exige login, mas ainda permite a troca de senha pendente. */
export async function requireSession() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/**
 * Autorização de toda página e Server Action do painel. O Proxy não basta
 * para isso, então cada uma chama esta função: sem sessão vai ao login, com
 * troca pendente vai à troca de senha.
 */
export async function requireAdmin() {
  const session = await requireSession();
  if (session.user.mustChangePassword) redirect("/trocar-senha");
  return session;
}
