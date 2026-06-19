# System Design Document: Financial Management System

## 1. Architecture Overview
The system will follow a standard Client-Server architecture:
*   **Frontend (Client):** React/Vite application. Uses the **Earthbound Matte** design system—a "Digital Stationery" aesthetic blending tactile physical ledger elements with modern Neo-Brutalism. Styled with TailwindCSS 4 and customized shadcn/ui components.
*   **Backend (API Server):** Node.js using the NestJS framework. Implements a strict **Immutable Ledger** model where transaction records are permanent and append-only, ensuring data integrity and a clear audit trail. Chosen for its robust architecture and strong TypeScript support.
*   **Database:** PostgreSQL. The industry standard for financial applications due to strict ACID compliance, preventing data anomalies and ensuring relational integrity.

## 2. Core Data Models
To ensure accuracy, all currency amounts will be stored as integers (e.g., cents) in the database to prevent floating-point rounding errors.

### Users
*   `id` (UUID, Primary Key)
*   `email` (String, Unique)
*   `password_hash` (String)
*   `created_at` (Timestamp)

### Transactions
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key -> Users)
*   `type` (Enum: INCOME, EXPENSE)
*   `amount` (BigInt) - Stored as the smallest unit (e.g., cents for USD, units for JPY)
*   `currency` (String, ISO 4217, e.g., 'USD', 'VND', 'JPY')
*   `decimals` (Integer) - The number of decimal places for the currency
*   `category_id` (UUID, Foreign Key -> Categories)
*   `date` (Date)
*   `note` (String, Optional)
*   `created_at` (Timestamp)

### Connections
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key -> Users) - The user initiating the connection
*   `contact_id` (UUID, Foreign Key -> Users) - The trusted contact
*   `status` (Enum: PENDING, ACCEPTED)
*   `created_at` (Timestamp)
*(Note: Establishes a trusted relationship allowing users to select each other for transaction sharing)*

### Transaction Shares (Granular Sharing)
*   `transaction_id` (UUID, Foreign Key -> Transactions, Primary Key part 1)
*   `shared_with_user_id` (UUID, Foreign Key -> Users, Primary Key part 2)
*   `created_at` (Timestamp)
*(Note: Maps specific transactions to specific users they are shared with)*

### Budgets
*   `id` (UUID, Primary Key)
*   `user_id` (UUID, Foreign Key -> Users)
*   `category_id` (UUID, Foreign Key -> Categories, Optional - Null means overall budget)
*   `amount` (BigInt)
*   `currency` (String, ISO 4217)
*   `decimals` (Integer)
*   `month_year` (Date/String)

## 3. API Contracts (RESTful)
The backend will expose a RESTful API.

### Auth
*   `POST /api/auth/register`
*   `POST /api/auth/login` -> Returns JWT

### Transactions (Immutable Ledger)
*   `GET /api/transactions` -> Fetch user's transactions (and shared ones they have access to).
*   `POST /api/transactions` -> Create a new transaction. Note: Transactions are immutable; updates and deletions are not supported.

### Sharing
*   `GET /api/sharing/contacts` -> List users you are sharing with or who are sharing with you.
*   `POST /api/sharing/invite` -> Invite a user by email to view shared transactions.
*   `PUT /api/sharing/respond/:id` -> Accept/Reject an invitation.

### Analytics
*   `GET /api/analytics/summary` -> Monthly income/expense totals.
*   `GET /api/analytics/budget-status` -> Current budget vs. actual spending.

### Documentation
*   `GET /api/docs` -> OpenAPI Swagger documentation.

## 4. Security & Privacy
*   **Authentication:** Custom JWT (JSON Web Tokens) passed in the `Authorization` header as a Bearer token.
*   **Authorization (Data Privacy):** The NestJS backend will enforce strict ownership checks. A user can only fetch a transaction if `transaction.user_id == req.user.id` OR if there is a record in the `Transaction Shares` table linking the `transaction.id` to the `req.user.id`.
*   **Data Integrity:** NestJS DTOs (Data Transfer Objects) with `class-validator` on incoming requests and PostgreSQL constraints (Foreign Keys, Enums) on the database layer.

## 5. Implementation Phases
1.  **Backend Init:** Scaffold NestJS project, setup PostgreSQL connection, define migrations (using TypeORM).
2.  **Auth Layer:** Implement user registration, login, and JWT guards/strategies.
3.  **Transaction Core:** Implement Create and Read endpoints for the immutable ledger.
4.  **Frontend Integration:** Connect the React frontend to the Auth and Transaction APIs.
5.  **Sharing & Analytics:** Implement the complex sharing logic and analytical endpoints.
