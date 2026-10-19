import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import { prisma } from "./prisma";
import { UserRole } from "./constants";

const SESSION_COOKIE_NAME = "hms_session_token";
const SESSION_EXPIRY_DAYS = 7;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, 10);
}

export async function verifyPassword(plainText: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plainText, hash);
}

export async function createSession(userId: string) {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_EXPIRY_DAYS);

  await prisma.session.create({
    data: {
      sessionToken,
      userId,
      expires,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires,
    path: "/",
  });

  return sessionToken;
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: {
      user: {
        include: {
          residentProfile: true,
          staffProfile: true,
        },
      },
    },
  });

  if (!session || session.expires < new Date()) {
    if (session) {
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    }
    return null;
  }

  return session.user;
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.session.deleteMany({
      where: { sessionToken: token },
    }).catch(() => {});
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role as UserRole)) {
    redirect("/dashboard");
  }
  return user;
}

