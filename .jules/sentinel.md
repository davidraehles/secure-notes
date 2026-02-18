## Permissive CORS Policy Fix

Fixed a permissive CORS policy by restricting allowed origins to those specified in the `ALLOWED_ORIGINS` environment variable.

### Key Learnings
- Use the `cors` middleware with an `origin` whitelist instead of the default `*`.
- Robustly parse environment variables by splitting and trimming strings to avoid configuration errors.
- Default to a safe local development origin (e.g., `http://localhost:5173`) when the environment variable is not set.
- Avoid committing auto-generated lock files unless explicitly required, especially if they contain invalid or hallucinated dependency versions.
