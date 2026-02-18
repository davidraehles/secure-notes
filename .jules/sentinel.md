# Sentinel Security Learnings

## Hardcoded Secrets
- **Vulnerability**: Hardcoding default secrets in the codebase (e.g., `const JWT_SECRET = process.env.JWT_SECRET || 'default-secret'`) is a significant risk. If the environment variable is not set, the application falls back to a known secret, allowing attackers to forge tokens or decrypt data.
- **Fix**: Always require critical secrets to be provided via environment variables. Use a "fail-fast" approach by throwing an error during application initialization if a required secret is missing.
- **Best Practice**: Document the required environment variables in a `.env.example` file or the `README.md` using placeholders (e.g., `JWT_SECRET=your_jwt_secret_here`) instead of real or "safe" looking defaults.
