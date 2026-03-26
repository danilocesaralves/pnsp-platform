import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { auth } from "./auth";
import { fromNodeHeaders } from "better-auth/node";
import { getUserByEmail, upsertUser } from "../repositories/users.repo";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(opts.req.headers),
    });

    if (session?.user?.email) {
      const found = await getUserByEmail(session.user.email);
      if (found) {
        user = found;
      } else {
        // First login: create app user record from better-auth session
        await upsertUser({
          openId: session.user.id,
          name: session.user.name ?? null,
          email: session.user.email,
          loginMethod: "email",
          lastSignedIn: new Date(),
        });
        user = (await getUserByEmail(session.user.email)) ?? null;
      }
    }
  } catch {
    user = null;
  }

  return { req: opts.req, res: opts.res, user };
}
