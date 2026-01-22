/**
 * Validate required auth environment variables.
 * Call this at app startup to fail fast if misconfigured.
 */
export function validateAuthEnv() {
  const required = ["AUTH_SECRET"]
  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Missing required auth environment variables: ${missing.join(", ")}\n` +
        "Generate AUTH_SECRET with: openssl rand -base64 32"
    )
  }
}

// Warn about placeholder OAuth credentials in development
export function warnPlaceholderCredentials() {
  if (process.env.NODE_ENV === "development") {
    if (
      process.env.GOOGLE_CLIENT_ID === "placeholder" ||
      !process.env.GOOGLE_CLIENT_ID
    ) {
      console.warn(
        "[Auth] Google OAuth not configured. OAuth login will fail."
      )
    }
  }
}
