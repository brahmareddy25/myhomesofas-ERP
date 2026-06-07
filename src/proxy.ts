import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  // Check if the user has an active session token
  const token = await getToken({ req });

  const isAuthPage = req.nextUrl.pathname === "/login" || req.nextUrl.pathname === "/";

  // If they are authenticated and trying to access the login page, 
  // immediately bounce them to the dashboard before the page even loads.
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match only the login and root paths to keep middleware fast
  matcher: ["/", "/login"],
};
