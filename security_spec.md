# Security Specification - Travel Cloud Expenses

## Data Invariants
1. A **Trip** must have a valid `ownerId` matching the creator's UID.
2. An **Expense** must belong to a valid `tripId` and the creator must be a participant or owner of that trip.
3. User Profiles can only be written by the owner of that UID.
4. Timestamps (`createdAt`, `updatedAt`) must be server-generated.

## The "Dirty Dozen" Payloads (Denial Targets)
1. **Identity Spoofing**: Attempt to create a trip with an `ownerId` that is not mine.
2. **Orphaned Expense**: Create an expense for a `tripId` that doesn't exist.
3. **Shadow Field Injection**: Add `isAdmin: true` to a user profile update.
4. **Budget Poisoning**: Set a negative budget or a non-numeric string.
5. **PII Leak**: Attempt to list all user profiles without filtering.
6. **Cross-Trip Write**: Attempt to add an expense to a trip I'm not part of.
7. **Terminal State Bypass**: (N/A for now, but planned for "Completed" trips).
8. **Resource Exhaustion**: Use a 1MB string as a Trip Name.
9. **Timestamp Manipulation**: Provide a future/past `createdAt` date from the client.
10. **ID Poisoning**: Use a 2KB string of non-alphanumeric characters as a Document ID.
11. **Malicious Array Growth**: Attempt to push 10,000 uids into `participants`.
12. **Unauthorized Deletion**: Try to delete someone else's trip.

## Conflict Report
- Identity Spoofing: Protected via `request.auth.uid` binding.
- Resource Poisoning: Protected via `.size()` checks on strings.
- State Shortcutting: Protected via `affectedKeys().hasOnly()`.
