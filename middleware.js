import { getIronSession } from "iron-session";
import { NextResponse } from "next/server";
import { sessionOptions } from "@/lib/session";

export async function middleware(request) {
  const session = await getIronSession(request.cookies, sessionOptions);

  if (!session.user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
