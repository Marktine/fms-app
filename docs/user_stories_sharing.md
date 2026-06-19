# User Stories: Transaction Privacy & Collaborative Sharing

## Epic: Flexible Financial Collaboration
As a user, I want to manage the privacy of my transactions and selectively share them with trusted contacts, so that I can manage joint expenses (like household bills or trips) without exposing my entire personal financial ledger.

---

### Scenario 1: Default Transaction Privacy (Not Shared)
**Given** I am a logged-in user (Alice)
**When** I create a new transaction (e.g., buying a personal coffee)
**Then** the visibility defaults to "Private"
**And** only I (Alice) can see this transaction in my dashboard and transaction lists
**And** no other users on the platform can access or view this transaction data.

### Scenario 2: Establishing a Sharing Connection
**Given** I am a logged-in user (Alice)
**When** I navigate to the "Sharing Contacts" settings
**And** I send an invitation to another user (Bob) via their email
**Then** Bob receives a "Pending" invitation
**When** Bob logs in and accepts the invitation
**Then** Bob becomes an available contact for granular sharing.

### Scenario 3: Granular Sharing (Sharing specific transactions with specific people)
**Given** I (Alice) have an "Accepted" contact connection with Bob (my brother)
**When** I create a new transaction (e.g., "Monthly Internet Bill")
**And** I select Bob from my "Share with" list on that specific transaction
**Then** the transaction is saved and explicitly shared with Bob
**And** Bob can see this specific transaction in his "Shared Exchanges" view.

### Scenario 4: Keeping other transactions private from collaborators
**Given** Alice has explicitly shared the "Monthly Internet Bill" with Bob
**When** Alice creates another transaction (e.g., "Personal Gym Membership") and does NOT select Bob
**Then** Bob cannot see the Gym Membership transaction
**And** Bob only sees the Internet Bill.

### Scenario 5: Group Sharing (Sharing one transaction with multiple specific people)
**Given** Alice has "Accepted" contact connections with Bob (brother) and Charlie (roommate)
**When** Alice creates a transaction (e.g., "Groceries for the house")
**And** Alice selects BOTH Bob and Charlie from the "Share with" list
**Then** the transaction becomes visible to both Bob and Charlie in their respective shared views.

### Scenario 6: Revoking Access to a Specific Transaction
**Given** Alice previously shared the "Internet Bill" with Bob
**When** Alice edits that transaction and removes Bob from the "Share with" list
**Then** the transaction immediately disappears from Bob's view.

### Scenario 7: Revoking Collaborator Access Entirely
**Given** Alice and Bob have an "Accepted" sharing connection
**When** Alice navigates to "Sharing Contacts" and removes Bob as a contact
**Then** Bob is removed from all previously shared transactions
**And** Bob can no longer see *any* of Alice's data.