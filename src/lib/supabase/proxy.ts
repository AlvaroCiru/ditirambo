import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];
const AUTH_TIMEOUT_MS = 8000;

/** Cookies de sesión Supabase SSR (`sb-…-auth-token`, chunks, etc.). */
function hasSupabaseAuthCookie(request: NextRequest): boolean {
  return request.cookies
    .getAll()
    .some(
      (c) =>
        c.name.startsWith("sb-") &&
        (c.name.includes("auth-token") || c.name.includes("auth-token.")),
    );
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

async function getUserOrTimeout(
  getUser: () => Promise<{
    data: { user: { id: string } | null };
  }>,
): Promise<{ id: string } | null | "timeout"> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      getUser().then((r) => r.data.user),
      new Promise<"timeout">((resolve) => {
        timer = setTimeout(() => resolve("timeout"), AUTH_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  const hasSessionCookie = hasSupabaseAuthCookie(request);

  // Sin cookie: no llamar a Auth.
  if (!hasSessionCookie) {
    if (isPublicPath) {
      return NextResponse.next({ request });
    }
    return redirectToLogin(request);
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const user = await getUserOrTimeout(() => supabase.auth.getUser());

  // Auth lento: NO expulsar. Había cookie de sesión; la página validará.
  // (El timeout→login provocaba el bucle login ↔ inicio.)
  if (user === "timeout") {
    return response;
  }

  if (!user) {
    if (isPublicPath) return response;
    return redirectToLogin(request);
  }

  if (isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/resenas";
    return NextResponse.redirect(url);
  }

  return response;
}
