# Financial Management System (FMS)

A minimalist, mobile-friendly web application designed for personal budgeting, expense/income tracking, and collaborative financial management. It features a unique **"Earthbound Matte"** digital stationery aesthetic (tactile physical ledger elements combined with Neo-Brutalism) and implements a strict **Immutable Ledger** for financial accuracy and auditability.

---

## 📖 Documentation Index

For detailed specifications, refer to the following documents inside the [docs/](file:///home/mark/workspace/lab/financial_management/docs/) directory:

*   **Product Requirements:** [prd_v1.md](file:///home/mark/workspace/lab/financial_management/docs/PRDs/prd_v1.md) — Product scope, target audience, goals, and success metrics.
*   **System Architecture & Directory Structure:** [structure.md](file:///home/mark/workspace/lab/financial_management/docs/system/structure.md) — Source of truth for the consolidated Deno stack structure.
*   **Initial Conceptual Spec:** [system_design.md](file:///home/mark/workspace/lab/financial_management/docs/system_design.md) — The draft system specification (conceptual architecture).
*   **Coding Standards:** [CODING_STANDARDS.md](file:///home/mark/workspace/lab/financial_management/docs/CODING_STANDARDS.md) — Guidelines for TypeScript, database math, safety, and styling.
*   **Sharing User Stories:** [user_stories_sharing.md](file:///home/mark/workspace/lab/financial_management/docs/user_stories_sharing.md) — Feature requirements for transaction privacy and collaborative expense sharing.
*   **Development Planning & TODOs:** [planning.md](file:///home/mark/workspace/lab/financial_management/docs/system/planning.md) — Implementation gaps, checklists, and upcoming phases.

---

## 🛠️ Technical Stack

The consolidated system is built as a lightweight, modern fullstack Deno application:
*   **Runtime:** [Deno](https://deno.land/) (v2.x) for secure-by-default execution.
*   **Web Framework:** [Hono](https://hono.dev/) for high-performance JSX server-side rendering and routing.
*   **Database ORM:** [Drizzle ORM](https://orm.drizzle.team/) with the `postgres.js` driver.
*   **UI & Interactivity:** [Tailwind CSS](https://tailwindcss.com/) combined with [HTMX](https://htmx.org/) for seamless AJAX-driven page updates.
*   **Security:** [Argon2](https://jsr.io/@felix/argon2) for password hashing and custom JWTs for cookie-based session management.

---

## 🚀 Environment Setup

### Prerequisites
*   [Deno v2.x](https://deno.com/) installed locally.
*   [Docker](https://www.docker.com/) and Compose plugin installed.

### Step 1: Copy Environment Variables
Duplicate `.env.example` at the root and inside the `app/` directory:
```bash
cp .env.example .env
cp .env.example app/.env
```
Ensure you update the `JWT_SECRET` and database credentials in [app/.env](file:///home/mark/workspace/lab/financial_management/app/.env) if necessary.

### Step 2: Spin Up the Database
Start the PostgreSQL container:
```bash
docker compose up -d
```
This runs PostgreSQL 17 on port `5432` with the data persisted to a Docker volume.

### Step 3: Run Database Migrations & Seeds
Initialize database schemas and seeds using the tasks defined in [app/deno.json](file:///home/mark/workspace/lab/financial_management/app/deno.json):
```bash
# Run Drizzle migrations
deno task --cwd app db:migrate

# Seed default mock data
deno task --cwd app db:seed
```

### Step 4: Run the Application
Start the development server with automatic file watching:
```bash
deno task --cwd app dev
```
The server will start on [http://localhost:3000](http://localhost:3000).

---

## 🔄 Development Workflow

### 1. Code Structure
Code is modularized under [app/src/modules/](file:///home/mark/workspace/lab/financial_management/app/src/modules/) using a strict layout:
*   **Router:** Handles incoming HTTP routes and defines endpoints.
*   **Service:** House business logic and coordinate repositories.
*   **Repository:** Run queries against PostgreSQL via Drizzle ORM.
*   **Views:** Server-side JSX templates rendering the markup.

### 2. Modifying the Schema
To change database tables or add fields:
1.  Modify definitions in [schema.ts](file:///home/mark/workspace/lab/financial_management/app/src/core/schema.ts).
2.  Generate a Drizzle migration script:
    ```bash
    deno task --cwd app db:generate
    ```
3.  Apply the migration:
    ```bash
    deno task --cwd app db:migrate
    ```

---

## 📏 Coding Standards

Our development guidelines are detailed in [CODING_STANDARDS.md](file:///home/mark/workspace/lab/financial_management/docs/CODING_STANDARDS.md):

*   **TypeScript:** Strict typing is mandatory. Do not use `any`.
*   **Immutable Ledger:** Transactions are append-only. There are no `UPDATE` or `DELETE` functions for financial transactions. Error corrections must be done using counter-transactions.
*   **Financial Precision:** Store all financial amounts as `bigint` (e.g. cents/smallest unit) to prevent floating-point calculation errors. Every transaction record requires an ISO 4217 currency code and decimals fields.
*   **Security:** Avoid logging secrets. Always check inputs using `zod` and Hono validators.
*   **Deno Permissions:** Run scripts with strict permission flags. Never use Deno's `-A` (all permissions) option.
*   **Formatting:** Run `deno fmt` before committing code changes.
