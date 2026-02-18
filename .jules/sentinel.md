# Sentinel Security Learnings

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
