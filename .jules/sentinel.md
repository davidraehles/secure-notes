# Sentinel Security Learnings

## Hardcoded Secrets
- **Vulnerability**: Hardcoding default secrets in the codebase (e.g., `const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'`) is a significant risk. If the environment variable is not set, the application falls back to a known secret, allowing attackers to forge tokens or decrypt data.
- **Fix**: Always require critical secrets to be provided via environment variables. Use a "fail-fast" approach by throwing an error during application initialization if a required secret is missing.
- **Best Practice**: Document the required environment variables in a `.env.example` file or the `README.md` using placeholders (e.g., `JWT_SECRET=your_jwt_secret_here`) instead of real or "safe" looking defaults.

## Permissive CORS
- **Vulnerability**: CORS configured to allow all origins allows any website to make requests to the API, increasing the risk of CSRF and other cross-origin attacks.
- **Prevention**: Use restrictive CORS configurations that only allow trusted origins. Require ALLOWED_ORIGINS to be set in production.
- **Parsing**: Robustly parse environment variables by splitting and trimming strings, filtering empty values to avoid configuration errors.
- **Credentials**: Enable `credentials: true` when the application uses cookies or Authorization headers cross-origin.

## Insecure Token Storage
- Storing authentication tokens in `localStorage` or `sessionStorage` makes them vulnerable to theft via Cross-Site Scripting (XSS) attacks.
- Industry best practice for SPAs is to use `HttpOnly` cookies for session tokens.
- `HttpOnly` cookies are inaccessible to JavaScript, mitigating the risk of token theft even if an XSS vulnerability exists.

## Session Management with Cookies
- When moving to cookies, ensure `Secure` (for production) and `SameSite: Strict` or `Lax` attributes are set.
- A `/me` or `/status` endpoint is necessary for the frontend to recover the session on page refresh since JS cannot read the `HttpOnly` cookie.
- A proper `/logout` endpoint is required to clear the cookie on the client side.

## CORS and Cookies
- Cross-origin cookies require `credentials: 'include'` in frontend fetch requests.
- The backend CORS configuration must explicitly allow the origin (cannot be `*`) and set `credentials: true`.
- Using `cookie-parser` on the backend provides a robust way to handle cookie extraction.
