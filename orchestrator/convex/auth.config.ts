// Convex uses this to validate Clerk JWTs.
// Set the Convex env var: npx convex env set CLERK_JWT_ISSUER_DOMAIN <your-clerk-frontend-api>
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
