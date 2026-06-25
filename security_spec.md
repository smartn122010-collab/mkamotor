# Security Specification for MKA Motors Firestore Database

## 1. Data Invariants
- **Products**: Can only be created, updated, or deleted by the Admin. Anyone (authenticated or guest) can read the products.
- **Offers**: Can only be created, updated, or deleted by the Admin. Anyone (authenticated or guest) can read the active offers.
- **Orders**: Can be created by any authenticated user. Users can only read their own orders (where `customerUid == request.auth.uid`). Admin can read and update all orders.
- **Stats**: Can be created or updated by the Admin. Anyone (authenticated or guest) can read the statistics for the dashboard.
- **AdminConfig**: Can only be read, created, or updated by the Admin. This stores the secure admin password PIN hash.

## 2. The "Dirty Dozen" Payloads (Denial Scenarios)
1. **Unauthenticated Product Creation**: Attempting to add a product without being signed in. (Denied)
2. **Standard User Product Deletion**: Attempting to delete a product as a standard customer. (Denied)
3. **Offer Expiry Spoofing**: Attempting to edit an offer to change its expiry date or discount as a non-admin. (Denied)
4. **Order Identity Spoofing**: Creating an order where `customerUid` is different from `request.auth.uid`. (Denied)
5. **PII Data Leak**: Attempting to read another user's order details. (Denied)
6. **Admin PIN Hijacking**: Attempting to read or update the admin PIN config without admin access. (Denied)
7. **Stats Poisoning**: Injecting negative values or giant payloads into stats (e.g. `todaySale = -99999` or `totalStock = "million"`). (Denied)
8. **Malicious ID Injection**: Creating a product with an ID containing special characters or too long (e.g., `../admin`). (Denied)
9. **Tampering with Order Status**: Attempting to update an order status from "pending" to "sent" as a standard user. (Denied)
10. **System Field Injection**: Attempting to write system-only fields in user profile. (Denied)
11. **Guest Order Submission**: Attempting to write an order as an unauthenticated user. (Denied)
12. **Double PIN Setup**: Attempting to overwrite the admin PIN config once it is already set up and locked. (Denied)

## 3. Security Rules Outline (firestore.rules)
We will implement standard, high-quality, production-ready security rules to enforce these constraints. Since we are using standard Firestore Rules, the rules themselves will enforce that only authorized operations succeed.
