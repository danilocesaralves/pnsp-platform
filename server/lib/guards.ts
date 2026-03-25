import { TRPCError } from "@trpc/server";
import { protectedProcedure } from "../_core/trpc";

/**
 * Admin guard — allows admin + owner roles
 */
export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "owner") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  }
  return next({ ctx });
});

/**
 * Owner guard — allows owner + admin roles
 */
export const ownerProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "owner" && ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito ao proprietário" });
  }
  return next({ ctx });
});
