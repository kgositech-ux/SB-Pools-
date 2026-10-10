# Security Specification & Threat Model - SB Pools

## 1. Data Invariants

1. **Authentication & Identity Integrity**:
   - Only authenticated users with verified email (`request.auth != null && request.auth.token.email_verified == true`) may mutate pool records, bookings, and tasks.
   - A customer cannot forge `customerId` or `ownerId` upon creating pool profiles or booking appointments; `customerId == request.auth.uid`.
   - Technicians can only update tasks assigned to them (`resource.data.technicianId == request.auth.uid`) or if the user is an admin.
   - An administrator is authoritatively determined via `exists(/databases/$(database)/documents/admins/$(request.auth.uid))` or matching bootstrap email `servicewebsites6@gmail.com`.

2. **Schema & Boundary Protection**:
   - Path variables must be valid alphanumeric strings of length <= 128 characters (`isValidId`).
   - String sizes must be bounded (e.g. notes <= 1000 chars, names <= 128 chars, addresses <= 256 chars).
   - Numerical bounds must be enforced (e.g., pool volume > 0 and <= 5,000,000 gallons; price >= 0).

3. **Temporal & State Immutability**:
   - `id`, `customerId`, `bookingId`, and `createdAt` are immutable after creation.
   - Terminal state locking: Completed or cancelled bookings cannot be arbitrarily re-opened or deleted by non-admins.
   - System and audit integrity: Status transitions must be strictly permitted actions.

---

## 2. The "Dirty Dozen" Adversarial Payloads

1. **Payload 1 (Identity Spoofing - Customer Profile)**:
   Unauthenticated actor attempting to create user doc `/users/victim_123` with arbitrary admin role.
   `{ id: "victim_123", email: "hacker@test.com", role: "admin" }` -> EXPECT: PERMISSION_DENIED

2. **Payload 2 (Self-Assigned Admin Role Privilege Escalation)**:
   Authenticated customer `uid_abc` writing directly into `/admins/uid_abc`.
   `{ userId: "uid_abc", email: "customer@domain.com", role: "admin" }` -> EXPECT: PERMISSION_DENIED

3. **Payload 3 (Booking Impersonation)**:
   Authenticated user `uid_attacker` creating booking with `customerId: "uid_victim"`.
   `{ id: "b_1", customerId: "uid_victim", customerName: "Victim", address: "123 Main", serviceType: "weekly_cleaning", scheduledDate: "2026-10-15", status: "pending" }` -> EXPECT: PERMISSION_DENIED

4. **Payload 4 (Denial of Wallet / Resource Poisoning)**:
   Authenticated customer injecting 2MB text into `notes` field.
   `{ id: "b_2", customerId: "uid_attacker", notes: "A".repeat(2000000) }` -> EXPECT: PERMISSION_DENIED

5. **Payload 5 (Path Variable Poisoning / Injection)**:
   Document write targeting path `/bookings/../../../etc/passwd` or oversized junk ID.
   `doc("/bookings/` + "X".repeat(500) + `")` -> EXPECT: PERMISSION_DENIED

6. **Payload 6 (Shadow Field Injection / Extra Properties Attack)**:
   Booking creation containing hidden unauthorized fields like `isPaid: true, discount: 100`.
   `{ id: "b_3", customerId: "uid_attacker", customerName: "Attacker", isPaid: true, adminOverride: true }` -> EXPECT: PERMISSION_DENIED

7. **Payload 7 (Unauthorized Task Tampering by Customer)**:
   Customer trying to modify technician task `/tasks/t_1` to mark it completed without technician auth.
   `{ id: "t_1", status: "completed", notes: "Forged completion" }` -> EXPECT: PERMISSION_DENIED

8. **Payload 8 (Technician Cross-Tenant Task Hijacking)**:
   Technician `tech_A` attempting to edit task assigned to `tech_B`.
   `updateDoc(doc("/tasks/t_tech_B"), { status: "completed" })` -> EXPECT: PERMISSION_DENIED

9. **Payload 9 (Unbounded List / Array Exhaustion Attack)**:
   Injecting 50,000 array items into checklist or chemical reading log.
   `{ id: "t_2", checklist: Array(50000).fill("spam") }` -> EXPECT: PERMISSION_DENIED

10. **Payload 10 (Type Poisoning on Numeric Metrics)**:
    Sending a string or boolean for `volumeGallons` or `price`.
    `{ id: "p_1", customerId: "uid_user", volumeGallons: "twenty thousand gallons" }` -> EXPECT: PERMISSION_DENIED

11. **Payload 11 (Terminal State Bypass / Re-write)**:
    Non-admin user updating a booking whose current status in Firestore is `completed` or `cancelled`.
    `updateDoc("/bookings/b_done", { status: "pending" })` -> EXPECT: PERMISSION_DENIED

12. **Payload 12 (Immutable Field Mutation - Hijacking Customer ID)**:
    Updating existing pool profile to change `customerId` to another user.
    `updateDoc("/pools/p_1", { customerId: "new_hacked_owner" })` -> EXPECT: PERMISSION_DENIED
