import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  // Use the current origin so the Vercel proxy forwards /api/auth/* to Railway
  baseURL: typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
});
