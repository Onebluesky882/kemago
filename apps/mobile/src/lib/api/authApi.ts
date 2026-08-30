import { AUTH_BASE_URL } from "./config";

export class AuthApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthApiError";
  }
}

async function parseError(res: Response): Promise<never> {
  try {
    const body = (await res.json()) as { message?: string };
    throw new AuthApiError(body.message ?? `Request failed (${res.status})`);
  } catch (e) {
    if (e instanceof AuthApiError) throw e;
    throw new AuthApiError(`Request failed (${res.status})`);
  }
}

export type Profile = {
  email: string;
  name: string;
  profileComplete: boolean;
  profilePublic: boolean;
};

type BetterAuthUser = {
  email: string;
  name: string;
  profileComplete: boolean;
  profilePublic: boolean;
};

function toProfile(user: BetterAuthUser): Profile {
  return {
    email: user.email,
    name: user.name,
    profileComplete: user.profileComplete,
    profilePublic: user.profilePublic,
  };
}

// Talks directly to backend/better-auth's REST API (Better Auth's
// emailOTP plugin owns this whole flow) — there's no custom backend of
// our own in the request path anymore, see backend/better-auth/src/auth.ts.
export async function requestOtp(email: string): Promise<void> {
  const res = await fetch(`${AUTH_BASE_URL}/api/auth/email-otp/send-verification-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, type: "sign-in" }),
  });
  if (!res.ok) await parseError(res);
}

// type: "sign-in" auto-creates the account on first verify — there's no
// separate signup screen, matching the flow backend/api-go used to own.
export async function verifyOtp(email: string, code: string): Promise<{ token: string; profile: Profile }> {
  const res = await fetch(`${AUTH_BASE_URL}/api/auth/sign-in/email-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp: code }),
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { token: string; user: BetterAuthUser };
  return { token: body.token, profile: toProfile(body.user) };
}

// Reads the current session. This is also what slides the 30-day rolling
// session forward — Better Auth's `session.updateAge` (see auth.ts)
// extends the expiry as a side effect of the session being read, so there
// is no separate refresh endpoint to call. A signed-out/expired token
// responds 200 with a null body rather than an error status.
export async function getSession(token: string): Promise<Profile | null> {
  const res = await fetch(`${AUTH_BASE_URL}/api/auth/get-session`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
  const body = (await res.json()) as { user: BetterAuthUser } | null;
  return body ? toProfile(body.user) : null;
}

// update-user only responds {status: true} — read the session back
// afterward so callers get the real, persisted profile shape rather than
// an assumed one.
export async function updateProfile(token: string, input: { name: string }): Promise<Profile> {
  const res = await fetch(`${AUTH_BASE_URL}/api/auth/update-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name: input.name, profileComplete: true }),
  });
  if (!res.ok) await parseError(res);

  const session = await getSession(token);
  if (!session) throw new AuthApiError("Session lost after updating profile");
  return session;
}

// Same "write, then re-read" shape as updateProfile above — update-user
// only responds {status: true}, so read the real persisted value back
// rather than assuming the input was accepted as-is.
export async function updatePrivacy(token: string, profilePublic: boolean): Promise<Profile> {
  const res = await fetch(`${AUTH_BASE_URL}/api/auth/update-user`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ profilePublic }),
  });
  if (!res.ok) await parseError(res);

  const session = await getSession(token);
  if (!session) throw new AuthApiError("Session lost after updating privacy setting");
  return session;
}

// Invalidates the session row server-side (see useAuthStore.signOut for the
// on-device half — that one always runs regardless of whether this
// succeeds, since a network failure shouldn't trap the user in a signed-in
// UI they're trying to leave).
export async function signOutRequest(token: string): Promise<void> {
  const res = await fetch(`${AUTH_BASE_URL}/api/auth/sign-out`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) await parseError(res);
}
