## Prisma Client Singleton

Implementing the Prisma Client as a singleton is critical for backend performance in Node.js applications. Each `new PrismaClient()` instantiation creates a new connection pool. In serverless environments or standard Express apps with multiple route files, this can quickly lead to database connection exhaustion and increased memory overhead.

Centralizing the client in a shared module (e.g., `src/lib/prisma.ts`) ensures that the same connection pool is reused across the entire application lifecycle.

## Express 5 Type Casting

When upgrading to or using Express 5, `req.params` values are typed more broadly (`string | string[]`). When these are passed directly to Prisma, it can cause TypeScript compilation errors. Explicitly casting these parameters to `string` (if they are expected to be single values) ensures compatibility with Prisma's strict typing for primary keys and filters.
