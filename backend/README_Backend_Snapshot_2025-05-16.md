
# 🎓 Πτυχιακή Εργασία – Backend API για Υποστήριξη Καρκινοπαθών

> Έκδοση: Snapshot - 2025-05-16

## 🔧 Περιγραφή

Αυτό το backend είναι μέρος της πτυχιακής εργασίας με στόχο την υποστήριξη καρκινοπαθών και των οικογενειών τους μέσω διαδικτυακής πλατφόρμας. Χτισμένο με Node.js και Express, υποστηρίζει διαχείριση αιτημάτων υποστήριξης, διαβαθμισμένη πρόσβαση βάσει ρόλων και δικαιωμάτων (RBAC), και καθαρή RESTful δομή.

---

## ✅ Ολοκληρωμένες Λειτουργίες

### 1. 🔐 Αυθεντικοποίηση (Authentication)
- Εγγραφή χρήστη (`registerUser`)
- Σύνδεση χρήστη με JWT (`loginUser`)
- Middleware για επαλήθευση token (`verifyToken`)

### 2. 🛡️ Role-Based Access Control (RBAC)
- Υλοποίηση:
  - Πίνακες: `roles`, `permissions`, `user_roles`, `role_permissions`
  - Middleware: `requireRole`, `requirePermission`
- Κάλυψη granular ελέγχου πρόσβασης σε routes και ενέργειες

### 3. 📄 Διαχείριση Αιτημάτων Υποστήριξης
- Δημιουργία αίτησης (`POST /support-requests`)
- Προβολή προσωπικών αιτήσεων (`GET /support-requests`)
- Προβολή αιτήσεων ανά ρόλο (`GET /support-requests/admin-view`)
- Ανάθεση αιτημάτων με δικαιώματα (`PATCH /support-requests/:id/assign`)

### 4. 🧼 RESTful Routing
- Ορθό routing με σωστά HTTP methods (`POST`, `GET`, `PATCH`)
- Διαχωρισμός business logic σε controllers
- Καθαρή και επεκτάσιμη αρχιτεκτονική φακέλων

---

## 🗂️ Δομή Φακέλων

```
/controllers       # Business logic (auth, requests)
/routes            # Express routes
/middlewares       # Auth & RBAC middleware
/db                # DB connection pool
/config            # Env variables, DB setup
```

---

## 🔜 Επόμενα Βήματα

- [✅] Υλοποίηση `logoutUser`
- [✅] Υλοποίηση `getUserProfile`
- [✅] Προβολή και διαχείριση χρηστών (Admin)
- [✅] CRUD για roles/permissions (RBAC dashboard)
- [ ] Frontend integration
- [ ] Unit + integration testing

---

## ✍️ Συντάκτης

Βασίλης Συναγρίδης  
Πτυχιακή εργασία | Τμήμα Πληροφορικής | Πανεπιστήμιο Πειραιώς
