## Bulk IndexedDB Writes
Optimizing sequential writes to IndexedDB by using a single transaction significantly reduces overhead.
In our benchmark, sequential writes for 50 items took ~580ms, while bulk writes in a single transaction took ~70ms (~8x faster).
