import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // Borramos la cookie
  res.cookies.set({
    name: "admin_session",
    value: "",
    path: "/",
    maxAge: 0,
  });

  return res;
}
