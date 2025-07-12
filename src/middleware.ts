import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
// import arcjet, { shield, detectBot } from "@arcjet/next";
// import { isSpoofedBot } from "@arcjet/inspect";

// ✅ Early allow for public files like sitemap and robots.txt
// const PUBLIC_PATHS_ALLOWLIST = ["/sitemap.xml", "/robots.txt"];
// const shouldBypassBotDetection = (pathname: string) =>
//   PUBLIC_PATHS_ALLOWLIST.includes(pathname);

// const isDev = process.env.NODE_ENV === "development";

// const aj = arcjet({
//   key: process.env.ARCJET_KEY || "",
//   rules: [
//     shield({
//       mode: isDev ? "DRY_RUN" : "LIVE",
//     }),
//     detectBot({
//       mode: isDev ? "DRY_RUN" : "LIVE",
//       allow: ["CATEGORY:SEARCH_ENGINE", "CATEGORY:MONITOR", "CATEGORY:PREVIEW"],
//     }),
//   ],
// });

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ✅ Bypass Arcjet + auth for sitemap and robots
  //   if (shouldBypassBotDetection(pathname)) {
  //     return NextResponse.next();
  //   }

  //   // 🔐 Arcjet bot protection
  //   const decision = await aj.protect(request);

  //   if (decision.isDenied() || decision.results.some(isSpoofedBot)) {
  //     return new Response("Forbidden", { status: 403 });
  //   }

  // 🔐 Auth-protected routes
  const isProtectedRoute = [
    "/dashboard",
    "/history",
    "/profile",
    "/plans",
  ].some((path) => pathname.startsWith(path));

  if (isProtectedRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      return NextResponse.redirect(new URL("/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
