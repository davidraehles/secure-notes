# Performance Learnings - Bolt Agent

## native bcrypt vs bcryptjs
Native `bcrypt` is significantly faster than `bcryptjs` (pure JS implementation).
Benchmark results (10 iterations):
- Hashing: `bcryptjs` (~1252ms) vs `bcrypt` (~768ms) -> ~38% faster.
- Comparison: `bcryptjs` (~1048ms) vs `bcrypt` (~767ms) -> ~27% faster.

Switching to native `bcrypt` offloads cryptographic work to the Node.js thread pool, preventing blocking the main event loop.
Note: Native `bcrypt` requires compilation of C++ bindings, which may need `pnpm approve-builds` or appropriate build tools in the environment.

## Prisma Client Singleton

Implementing the Prisma Client as a singleton is critical for backend performance in Node.js applications. Each `new PrismaClient()` instantiation creates a new connection pool. In serverless environments or standard Express apps with multiple route files, this can quickly lead to database connection exhaustion and increased memory overhead.

Centralizing the client in a shared module (e.g., `src/lib/prisma.ts`) ensures that the same connection pool is reused across the entire application lifecycle.

## Express 5 Type Casting

When upgrading to or using Express 5, `req.params` values are typed more broadly (`string | string[]`). When these are passed directly to Prisma, it can cause TypeScript compilation errors. Explicitly casting these parameters to `string` (if they are expected to be single values) ensures compatibility with Prisma's strict typing for primary keys and filters.

## IndexedDB Bulk Save

Found a performance anti-pattern in IndexedDB usage where multiple notes are saved individually, creating N separate transactions instead of one. Also noticed that PBKDF2 is used per note with unique salts, which is secure but expensive during initial load. Implemented a bulk save function for IndexedDB to use a single transaction when loading multiple notes from the server.
