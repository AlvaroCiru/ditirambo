import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];
/** Renovar con Auth solo si el access token caduca en menos de esto. */
const REFRESH_IF_EXPIRES_WITHIN_MS = 5 * 60 * 1000;
const AUTH_TIMEOUT_MS = 8000;

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

function needsRefresh(expiresAt: number | undefined): boolean {
  if (!expiresAt) return true;
  return expiresAt * 1000 - Date.now() < REFRESH_IF_EXPIRES_WITHIN_MS;
}

async function refreshUserWithTimeout(
  getUser: () => Promise<{ data: { user: { id: string } | null } }>,
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

  if (!hasSupabaseAuthCookie(request)) {
    if (isPublicPath) return NextResponse.next({ request });
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

  // Lectura local de la cookie (sin red). Evita 5–6 s por clic.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    if (isPublicPath) return response;
    return redirectToLogin(request);
  }

  // Solo entonces contactar Auth (renovar token).
  if (needsRefresh(session.expires_at)) {
    const refreshed = await refreshUserWithTimeout(() =>
      supabase.auth.getUser(),
    );
    if (refreshed === null) {
      if (isPublicPath) return response;
      return redirectToLogin(request);
    }
    // "timeout": dejar pasar con la sesión actual; no expulsar.
  }

  if (isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/resenas";
    return NextResponse.redirect(url);
  }

  return response;
}
