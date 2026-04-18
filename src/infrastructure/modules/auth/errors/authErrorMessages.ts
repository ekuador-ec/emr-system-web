export const AUTH_DEFAULT_ERROR_MESSAGE_ES =
  "No se pudo iniciar sesión. Intenta nuevamente.";

export const AUTH_ERROR_MESSAGES_ES = {
  bad_json: "Datos inválidos. Intenta de nuevo.",
  invalid_credentials: "Credenciales incorrectas.",
  email_not_confirmed: "Correo no confirmado.",
  phone_not_confirmed: "Teléfono no confirmado.",
  user_banned: "Tu cuenta está bloqueada.",
  email_provider_disabled: "Login por correo no disponible.",
  phone_provider_disabled: "Login por teléfono no disponible.",
  provider_disabled: "Método de acceso no disponible.",
  validation_failed: "Datos de acceso inválidos.",
  over_request_rate_limit: "Demasiados intentos. Intenta más tarde.",
  captcha_failed: "No se pudo validar la seguridad.",
  request_timeout: "La solicitud tardó demasiado.",
  unexpected_failure: "Ocurrió un error interno.",
};

function cleanErrorCode(code?: string | null): string {
  if (!code) {
    return "";
  }
  return code.trim().toLowerCase();
}

export function translateAuthErrorCode(code?: string | null): string {
  const normalizedCode = cleanErrorCode(code);
  if (!normalizedCode) {
    return AUTH_DEFAULT_ERROR_MESSAGE_ES;
  }

  return (
    AUTH_ERROR_MESSAGES_ES[normalizedCode as keyof typeof AUTH_ERROR_MESSAGES_ES] ??
    AUTH_DEFAULT_ERROR_MESSAGE_ES
  );
}
