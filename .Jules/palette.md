## 2025-02-18 - [Accessibility for Custom List Items]
**Learning:** In minimalist designs where list items are used as primary navigation/selection elements, they often lack keyboard accessibility. Using `role="button"` and `tabIndex={0}` is essential, but it must be paired with an `onKeyDown` handler for both 'Enter' and ' ' (Space) keys to meet user expectations.
**Action:** Always check if clickable `div`s have corresponding keyboard handlers and ARIA roles.

## 2025-02-18 - [Visual Focus for Keyboard Users]
**Learning:** Default browser focus outlines can be inconsistent or clash with minimalist black/white designs. Using `:focus-visible` with a high-contrast `outline` and `outline-offset` provides a clear indicator for keyboard users while remaining invisible for mouse users.
**Action:** Implement custom `:focus-visible` styles for all interactive elements to ensure a polished keyboard navigation experience.
