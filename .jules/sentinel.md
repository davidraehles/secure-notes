# Sentinel's Journal - Secure Notes Web App

## 2025-05-15 - [Critical] Hardcoded JWT Secret and Open CORS
**Vulnerability:** The application had a hardcoded fallback for `JWT_SECRET` in `backend/src/middleware/auth.ts`, which would be used if the environment variable was missing. Additionally, CORS was configured to allow all origins in `backend/src/server.ts`.
**Learning:** Hardcoded secrets in code are a major risk as they often end up in version control and can be easily discovered by attackers. Overly permissive CORS allows any website to make requests to the API, increasing the risk of CSRF and other cross-origin attacks.
**Prevention:** Always require secrets to be provided via environment variables, especially in production. Fail fast if they are missing. Use restrictive CORS configurations that only allow trusted origins.
