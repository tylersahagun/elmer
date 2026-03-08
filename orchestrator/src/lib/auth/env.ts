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

// Warn about placeholder legacy OAuth credentials in development
export function warnPlaceholderCredentials() {
  if (process.env.NODE_ENV === "development") {
    if (
      process.env.GITHUB_CLIENT_ID === "placeholder" ||
      !process.env.GITHUB_CLIENT_ID
    ) {
      console.warn(
        "[Auth] GitHub OAuth not configured. Repository connect flows will fail."
      )
    }
  }
}
