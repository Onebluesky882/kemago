import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, emailOTP } from "better-auth/plugins";
import { createResend, sendEmail } from "@kemago/email";
import { createDb, schema } from "./db/client";

// This service replaces backend/api-go's custom OTP+JWT stack for the
// mobile app's login. Better Auth's emailOTP plugin owns the whole
// create/verify/session lifecycle (CRUD) — the only thing our own code
// does anywhere near auth data is read it back (GET /get-session, or the
// mobile client reading additionalFields on the user). No custom
// database/session code lives in this service on purpose.
//
// Drizzle (not Prisma, not Better Auth's built-in Kysely adapter) per
// packages/auth's existing pattern — see src/db/schema.ts for why this
// needs its own Postgres schema rather than reusing packages/db's (that
// one is D1/SQLite-only, which can't run outside Cloudflare Workers).
const databaseUrl = process.env.DATABASE_URL;
const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;
const betterAuthSecret = process.env.BETTER_AUTH_SECRET;

if (!databaseUrl) throw new Error("DATABASE_URL is required");
if (!resendApiKey) throw new Error("RESEND_API_KEY is required");
if (!emailFrom) throw new Error("EMAIL_FROM is required");
if (!betterAuthSecret) throw new Error("BETTER_AUTH_SECRET is required");

const db = createDb(databaseUrl);

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: { user: schema.user, session: schema.session, account: schema.account, verification: schema.verification },
  }),
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3002",
  secret: betterAuthSecret,
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? "").split(",").filter(Boolean),

  // CSRF protection guards cookie-based sessions from cross-site riding —
  // this service is Bearer-only, no cookies, ever (mobile can't rely on
  // cookies across origins). React Native's fetch sends a literal
  // "Origin: null" header, which Better Auth's origin-check middleware
  // treats as MISSING_OR_NULL_ORIGIN and rejects with 403 on any endpoint
  // it force-validates (e.g. update-user) — there's no real CSRF surface
  // to protect here, so this is disabled rather than worked around.
  advanced: {
    disableCSRFCheck: true,
  },

  // Second sign-in method alongside emailOTP below — Better Auth's own
  // core feature (not a plugin), stores the hash on the existing `account`
  // row (providerId "credential", the `password` column already in
  // src/db/schema.ts). Adds POST /api/auth/sign-up/email and
  // POST /api/auth/sign-in/email; both return the same { token, user }
  // shape emailOTP's sign-in already does, so the mobile client (or any
  // caller) can treat them interchangeably.
  emailAndPassword: {
    enabled: true,
  },

  // Bearer-only per SECURITY_RULES.md — mobile can't rely on cookies
  // across origins, same reasoning as backend/api-go's Bearer/JWT design.
  plugins: [
    bearer(),
    emailOTP({
      otpLength: 6,
      expiresIn: 5 * 60,
      // There's no separate signup screen — verifying the first OTP for a
      // new email creates the account (Better Auth's default for
      // type: "sign-in"), matching the flow backend/api-go used to own.
      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "sign-in") return;
        const resend = createResend(resendApiKey);
        await sendEmail(resend, {
          to: email,
          from: emailFrom,
          subject: "Your Kemago verification code",
          html: `<p>Your Kemago verification code is <strong>${otp}</strong>.</p><p>It's valid for 5 minutes. If you didn't request this, you can ignore this email.</p>`,
        });
      },
    }),
  ],

  // 30-day rolling session: updateAge reissues the expiry whenever the
  // session is used within that window, so continuous use never hits the
  // TTL — the same behavior backend/api-go hand-rolled as POST
  // /api/auth/refresh, now built into the session plugin itself.
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
  },

  // Post-login "complete your profile" flag — no avatar field per product
  // rules (initials stand in for a photo). The mobile client sets this
  // directly via Better Auth's own update-user endpoint; nothing in this
  // service writes to it.
  user: {
    additionalFields: {
      profileComplete: { type: "boolean", required: false, defaultValue: false, input: true },
    },
  },
});
