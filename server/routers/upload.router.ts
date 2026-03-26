import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { generatePresignedUrl, getPublicUrl, isR2Configured } from "../lib/r2";

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const uploadRouter = router({
  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1).max(200),
        contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
        fileSize: z.number().int().positive().max(MAX_SIZE_BYTES, "Arquivo deve ter no máximo 5MB"),
        type: z.enum(["avatar", "cover"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!isR2Configured()) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Upload não configurado. Defina as variáveis R2_* no servidor.",
        });
      }

      if (!ALLOWED_CONTENT_TYPES.includes(input.contentType)) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Formato não permitido." });
      }

      // Sanitise fileName — keep only safe chars + extension
      const ext = input.contentType.split("/")[1].replace("jpeg", "jpg");
      const safeName = input.fileName
        .replace(/[^a-z0-9._-]/gi, "-")
        .toLowerCase()
        .slice(0, 80);

      const key = `${input.type}/${ctx.user.id}/${Date.now()}-${safeName}.${ext}`;
      const presignedUrl = await generatePresignedUrl(key, input.contentType);
      const publicUrl = getPublicUrl(key);

      return { presignedUrl, publicUrl, key };
    }),
});
