# Planning & Gaps TODO List

This planning document outlines the missing functionality in the current modules, lists the unimplemented modules supported by the database schema, and provides a structured TODO list for upcoming development.

---

## 1. Module Implementation Gaps

### A. Authentication Module (`app/src/modules/auth`)
*   **Missing Registration Handler (`POST /auth/register`):** The view is implemented, but there is no router post-endpoint to register new users.
*   **Missing Logout Handler:** No router endpoint exists to clear the JWT cookie (`token`) and redirect the user to the login screen.
*   **Unique Email Check:** No custom database exception handling or form feedback exists for email collisions.

### B. Dashboard Module (`app/src/modules/dashboard`)
*   **Mock Service Data:** `DashboardService` returns static, hardcoded JSON data for balance and transactions.
*   **Empty Repository:** `DashboardRepository` is an empty scaffolding class with no database queries.
*   **Missing Live Metrics:** Total balance, accounts, and transaction feeds are not dynamically compiled from the database using SQL aggregations.

### C. System Core & Layouts
*   **Empty Auth Utility:** `app/src/core/utils/auth.ts` is currently an empty file.
*   **Navigation Actions:** Sidebar navigation links (Exchanges, Allocations, Milestones, Preferences) are dead links (`href="#"`).
*   **"New Entry" Button:** The button in the sidebar layout does not wire up to any modal or action.

---

## 2. Completely Unimplemented Modules

The database schema defines tables for these features, but no corresponding router, controller, service, repository, or view files exist in the `modules/` directory.

### A. Transactions Module (Crucial Component)
The core database model includes `transactions`, but there is no mechanism to:
*   Insert a transaction (`POST /dashboard/transactions` or `/api/transactions`).
*   Prevent double entry via `idempotencyKey` checking.
*   Filter transactions by month, type, and category on the backend database level (currently the filters in `dashboard.views.tsx` are static HTML options).
*   Enforce immutability (transactions should never be updated or deleted).

### B. Categories Module
The schema defines global and user-owned `categories`, but there is:
*   No repository or service to fetch default global categories.
*   No view or API to let users create and manage custom category tags.
*   No select-menu population from categories in the database.

### C. Sharing & Connections Module
The schema defines `connections` and `transactionShares`, but there is:
*   No way to add contacts or approve pending contact invitations.
*   No interface to split transaction shares (e.g. splitting an expense by amounts/percentages).
*   No dashboard logic checking the `transaction_shares` table to let users see transactions shared with them.

### D. Budgets (Allocations) Module
The schema defines `budgets`, but there is:
*   No API or layout to set and review monthly budgets.
*   No backend service calculating budget usage (e.g., alert when category spending exceeds budget).

---

## 3. Project TODO Checklist

Below is the developer roadmap to move this application from scaffolding and mock data to a fully functional Financial Management System.

### Phase 1: Complete Core Auth & Live Dashboard
- [x] Implement `POST /auth/register` in `auth.router.tsx` and call `AuthRepository.createUser()` to store passwords securely with Argon2.
- [x] Fix error when user redirected from `/register` to `/login` the login button does not working anymore, due to a
    `Uncaught TypeError: Cannot read properties of null (reading 'classList')` error.
- [x] Implement `POST /auth/logout` to clear the cookie session.
- [x] Connect `DashboardRepository` to query database transactions for the authenticated `userId`.
- [x] Implement database-backed calculations for the dashboard Statement Balance (sum of income minus sum of expenses).
- [x] Update dashboard layout.
- [x] Implement seperate components for transactions list filtering on dashboard.

### Phase 2: Transactions and Categories Management
- [ ] Create a modal or dedicated page for **New Entry** (Transactions).
- [ ] Create `TransactionsRepository` and `TransactionsService` supporting `createTransaction` and `getTransactionsByUserId` queries.
- [ ] Implement checks for `idempotencyKey` in the transaction creation service to block duplicate submissions.
- [ ] Create a Category management tool allowing retrieval of global categories and customization of user-owned categories.
- [ ] Populate the Transaction form category selector dynamically from the database.

### Phase 3: Dynamic Filters & HTMX Navigation
- [ ] Implement dynamic routes for filtering (e.g. `GET /dashboard?month=YYYY-MM&type=EXPENSE&category=UUID`).
- [ ] Convert filter selectors in `dashboard.views.tsx` to use HTMX `hx-get` to replace the transaction list dynamically.
- [ ] Wire up dashboard sidebar navigation tabs (Exchanges, Allocations, Preferences) using routing or HTMX partial swaps.

### Phase 4: Collaborative Sharing & Splits
- [ ] Create a "Connections" tab/view to invite other users by email.
- [ ] Build invitation status management (Accept/Decline pending requests).
- [ ] Implement transaction splitting logic during Transaction Creation: select contact(s) and specify share amount.
- [ ] Update the Dashboard feed to display transactions shared with the logged-in user (fetching records from `transaction_shares`).

### Phase 5: Budgets & Allocations
- [ ] Create a Budgets configuration interface.
- [ ] Build a budget indicator bar in the UI (calculating actual spending for the current month against the set budget limit).
- [ ] Add warnings or alert states when categories approach/exceed their budget.
