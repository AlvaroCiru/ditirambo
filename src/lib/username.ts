const FAKE_EMAIL_DOMAIN = "ditirambo.local";

const COMBINING_MARKS = /[̀-ͯ]/g;

/**
 * Supabase Auth solo admite email+contraseña. Para poder iniciar sesión con
 * un simple nombre de usuario, lo convertimos de forma determinista en un
 * email falso que nunca necesita existir ni recibir correo real: las cuentas
 * en Supabase deben crearse usando exactamente este mismo email.
 */
export function usernameToEmail(username: string): string {
  const slug = username
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(COMBINING_MARKS, "")
    .replace(/[^a-z0-9]/g, "");

  return `${slug}@${FAKE_EMAIL_DOMAIN}`;
}

const FAKE_EMAIL_SUFFIX = `@${FAKE_EMAIL_DOMAIN}`;

/** Inversa de {@link usernameToEmail}, para prellenar el nombre de usuario actual. */
export function emailToUsername(email: string): string {
  return email.endsWith(FAKE_EMAIL_SUFFIX)
    ? email.slice(0, -FAKE_EMAIL_SUFFIX.length)
    : email;
}
