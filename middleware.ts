import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public paths that don't require authentication
  const publicPaths = ["/"]

  // Check if the path is public
  if (publicPaths.includes(pathname)) {
    return NextResponse.next()
  }

  // For protected paths, check if user has auth token
  const authToken = request.cookies.get("auth_token")?.value

  if (!authToken && !publicPaths.includes(pathname)) {
    // Redirect to login if no auth token
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|placeholder.svg).*)"],
}
