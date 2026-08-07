export default {
  providers: [
    {
      // Prefer CLERK_JWT_ISSUER_DOMAIN; keep VITE_ alias for older env files
      domain:
        process.env.CLERK_JWT_ISSUER_DOMAIN ??
        process.env.VITE_CLERK_FRONTEND_API_URL,
      applicationID: "convex",
    },
  ],
};
