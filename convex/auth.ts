import { betterAuth } from "better-auth";

/**
 * Better Auth configuration for Kredita.
 * Handles email/password, session management, and prepared OAuth providers (Google, etc.)
 */
export const auth = betterAuth({
  appName: "Kredita",
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    // Configured dynamically from environment variables
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      enabled: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});
