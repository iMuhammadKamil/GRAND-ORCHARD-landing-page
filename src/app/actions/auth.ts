"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { createSession, clearSession, verifyPassword } from "@/lib/auth";

export async function loginAction(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.isActive) {
    return { error: "Invalid credentials or account is inactive." };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { error: "Invalid credentials. Please check your password." };
  }

  await createSession(user.id);
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function devQuickLoginAction(role: string) {
  const user = await prisma.user.findFirst({
    where: { role, isActive: true },
  });

  if (!user) {
    return { success: false, message: `No active user found for role: ${role}. Run database seed first.` };
  }

  await createSession(user.id);
  revalidatePath("/", "layout");
  return { success: true, role: user.role };
}

export async function logoutAction() {
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/login");
}
