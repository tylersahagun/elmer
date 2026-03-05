// Convex uses this to validate Clerk JWTs.
// CLERK_JWT_ISSUER_DOMAIN must be set in your Convex dashboard environment variables.
// Format: https://<your-clerk-frontend-api> (e.g., https://knowing-gecko-12.clerk.accounts.dev)
//
// See: https://docs.convex.dev/auth/clerk

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
