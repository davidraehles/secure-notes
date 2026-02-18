## 2025-05-15 - [Initial Bottleneck Hunting]
**Learning:** Found a performance anti-pattern in IndexedDB usage where multiple notes are saved individually, creating N separate transactions instead of one. Also noticed that PBKDF2 is used per note with unique salts, which is secure but expensive during initial load.
**Action:** Implement a bulk save function for IndexedDB to use a single transaction when loading multiple notes from the server.
