# Coding Standards & Best Practices (Deno + Hono + HTMX)

## General Principles
- **TypeScript:** Strict typing is mandatory. Avoid `any` at all costs.
- **Minimalism:** Don't install a package for a feature that can be implemented in < 50 lines of code. Prefer Deno standard library and JSR over npm.
- **Security:** Never log secrets. Use environment variables via `Deno.env`. Use `argon2` (via `@felix/argon2`) for password hashing and Hono's JWT middleware for session management.
- **Immutable Ledger:** Transactions are append-only. Never implement update or delete logic for financial records. Errors must be corrected with offsetting entries.

## Fullstack (Deno / Hono / Drizzle)
- **Architecture:** Module-based (e.g., `src/modules/ledger`). Router -> Service -> Repository (Drizzle).
- **SSR & HTMX:** Favor server-side rendering with Hono JSX. Use HTMX for interactivity. Avoid custom client-side JS.
- **Persistence:** Use `bigint` for all financial amounts, representing the smallest unit of the currency (e.g., cents for USD).
- **Multi-Currency:** Every financial record must include a `currency` code (ISO 4217) and a `decimals` field.
- **Database:** Use Drizzle ORM. Schema definitions go in `src/core/schema.ts`.
- **Migrations:** Always use `drizzle-kit` for schema changes.
- **Permissions:** Run Deno with strict flags (e.g., `--allow-net`, `--allow-env`, `--allow-read`). NEVER use `-A`.
- **Validation:** Use `zod` or Hono's built-in validators for form and JSON data.
- **Formatting:** Use `deno fmt` for consistent styling.

## UI (Earthbound Matte)
- **Styling:** Tailwind CSS (configured in `BaseLayout.tsx`). 
- **Design System:** Use the "Earthbound Matte" tokens:
    - **Borders:** 3px charcoal outlines (`#1b1c1a`).
    - **Radius:** 24px for cards and containers.
    - **Shadows:** Hard-offset 4px or 8px shadows (`box-shadow: 4px 4px 0px 0px #1b1c1a`).
    - **Colors:** Earthy matte tones (sage, terracotta, sand, paper).
- **HTMX:** Serve `htmx.min.js` from `static/vendor/`.

## Testing
- **Approach:** Use Deno's built-in test runner (`deno test`).
- **Logic:** Unit tests for currency math and business services.
- **Integration:** Test Hono routes and Drizzle queries against a test database.
