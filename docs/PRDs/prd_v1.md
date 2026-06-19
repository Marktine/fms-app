# Product Requirements Document: Financial Management System (FMS)

## 1. Overview
The Financial Management System (FMS) is a minimalist, mobile-friendly web application designed for personal budgeting, expense/income tracking, and collaborative financial management. It empowers users to take control of their finances through simple entry, intelligent categorization, and the ability to share specific financial data with trusted contacts (e.g., family or roommates).

## 2. Target Audience
*   **Individuals:** Seeking a simple way to track daily spending and income.
*   **Households/Roommates:** Users who need to share specific expenses (rent, groceries) while maintaining privacy for individual spending.

## 3. Goals
*   **Simplicity:** Minimalist UI that prioritizes speed of entry and ease of use.
*   **Privacy-First sharing:** Enable "shared ledgers" or transaction-level sharing without exposing entire accounts.
*   **Financial Awareness:** Provide clear visual feedback on spending habits and budget status.

## 4. Functional Requirements

### 4.1 Transaction Management (Immutable Ledger)
*   **Manual Entry:** Users can create income and expense transactions.
*   **Immutable Entries:** Once recorded, transactions cannot be edited or deleted. This ensures a permanent, audit-ready financial record.
*   **Corrections via Counter-Entries:** If a mistake is made, users must create a "counter-transaction" (e.g., an equal and opposite entry) to balance the ledger.
*   **Fields:** Amount, Category, Date, Note, and Sharing Status.
*   **Type Selection:** Toggle between Income and Expense.

### 4.2 Categorization
*   **Predefined Categories:** Default categories (e.g., Rent, Groceries, Gym, Salary).
*   **Custom Categories:** (Phase 2) Users can add their own.

### 4.3 Budgeting & Alerts
*   **Monthly Budgets:** Set spending limits by category or for the overall month.
*   **Alerts:** Visual indicators when spending exceeds 80% and 100% of the budget.

### 4.4 Reporting & Analytics
*   **Dashboard:** High-level summary of monthly income vs. expenses.
*   **Charts:** Pie charts for expense distribution and line/bar charts for monthly trends.

### 4.5 Privacy & Collaborative Sharing
*   **Visibility Toggle:** Each transaction can be marked as "Private" (default) or "Shared".
*   **Shared Contacts:** Ability to share specific transaction data with another user by ID/Email.
*   **Shared View:** A dedicated view to see transactions shared *with* the user.

## 5. Non-Functional Requirements
*   **Mobile-First Design:** Optimized for small screens with touch-friendly elements.
*   **Performance:** Fast load times using Vite and efficient state management.
*   **Aesthetic - "Digital Stationery":** A unique "Soft-Hard" contrast using Neo-Brutalism with an Organic twist. Tactile matte earth tones paired with rigid 3px charcoal outlines to evoke the feeling of a premium physical ledger.

## 6. Tech Stack
*   **Frontend Framework:** ReactJS (Vite)
*   **Design System:** Earthbound Matte
*   **Styling:** TailwindCSS 4 (Custom Neo-Brutalism configuration)
*   **UI Components:** shadcn/ui (Customized for Earthbound Matte)
*   **State Management:** React Context API
*   **Icons:** Material Symbols Outlined (2px stroke)

## 7. User Interface (UI) Concepts
*   **Ledger (Home):** The primary view of all financial activity, styled like a paper receipt or journal.
*   **Exchanges (Transactions):** A detailed, searchable and filterable list of all entries.
*   **Allocations (Budgets):** Visual "envelopes" or containers for category-specific spending.
*   **Milestones (Vault/Goals):** Long-term financial targets with blocky progress bars.
*   **Digital Stationery Elements:** 24px radius cards, hard-offset shadows (4px/8px), and 3px borders.


## 8. Success Metrics
*   User completes a transaction entry in under 10 seconds.
*   Successful sharing of an expense with another user.
*   High engagement with budget alert features.
