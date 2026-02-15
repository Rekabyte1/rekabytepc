// lib/admin.ts
import type { Session } from "next-auth";

export function adminEmails(): string[] {
  return String(process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminSession(session: Session | null): boolean {
  const email = session?.user?.email?.toLowerCase?.() ?? "";
  if (!email) return false;
  return adminEmails().includes(email);
}

export function normalizeEmpty(v: any) {
  const s = String(v ?? "").trim();
  if (!s) return "—";
  if (s.toUpperCase() === "EMPTY") return "—";
  return s;
}
