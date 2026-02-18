# Performance Learnings - Bolt Agent

## native bcrypt vs bcryptjs
Native `bcrypt` is significantly faster than `bcryptjs` (pure JS implementation).
Benchmark results (10 iterations):
- Hashing: `bcryptjs` (~1252ms) vs `bcrypt` (~768ms) -> ~38% faster.
- Comparison: `bcryptjs` (~1048ms) vs `bcrypt` (~767ms) -> ~27% faster.

Switching to native `bcrypt` offloads cryptographic work to the Node.js thread pool, preventing blocking the main event loop.
Note: Native `bcrypt` requires compilation of C++ bindings, which may need `pnpm approve-builds` or appropriate build tools in the environment.
