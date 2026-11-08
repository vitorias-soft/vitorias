import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

import { db } from "../db";
import * as schema from "../db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    // O Next escuta na rede local: sem isto, qualquer aparelho nela criaria conta.
    // O único administrador nasce no seed, que grava direto no banco.
    disableSignUp: true,
    minPasswordLength: 8,
  },
  user: {
    additionalFields: {
      mustChangePassword: {
        type: "boolean",
        required: true,
        defaultValue: true,
        // Impede que o cliente limpe a pendência por /api/auth/update-user.
        input: false,
      },
    },
  },
  plugins: [nextCookies()],
});
