# 📑 Project Plan (18 Αυγ – 23 Σεπτ)

Αυτό το έγγραφο περιγράφει τα tasks που απομένουν για την ολοκλήρωση της πτυχιακής και των δύο μαθημάτων (**Ασφάλεια ΠΣ** και **ΠΣ στο Διαδίκτυο**).

---

## 🔹 Backend
- [✅] CRUD Users (create/update/delete μόνο από admin)
- [✅] Validation στα routes (email format, required fields, password length)
- [✅] Cleanup: αφαίρεση `password_hash` από responses, format ημερομηνίας
- [ ] HTTPS (self-signed SSL cert)
- [ ] Security scans (`npm audit`, OWASP ZAP)
- [ ] Τελικό testing flows (patient, volunteer, employee, admin)

---

## 🔹 Frontend (React)
- [✅] Setup project με **Vite + React**
- [✅] Ρύθμιση routing (`/login`, `/register`, `/dashboard`)
- [✅] Axios instance + token storage (localStorage)
- [✅] Φόρμα **Register** (σύνδεση με backend)
- [✅] Φόρμα **Login** (JWT + redirect)
- [ ] Protected routes (αν δεν υπάρχει token → redirect login)
- [ ] Dashboard view (προβολή αιτημάτων)
- [ ] Support Request form (create request)
- [ ] Προβολή αιτημάτων ανά ρόλο (patient, staff, admin)
- [✅] Logout flow
- [✅] Basic styling (Tailwind ή CSS modules)
- [ ] UX βελτιώσεις (loading, error messages, date format)
- [ ] Hosting (Vercel frontend, Render backend)

---

## 🔹 Documentation (δύο ξεχωριστά παραδοτέα)

### 1️⃣ Ασφάλεια ΠΣ (Security focus)
- [ ] Μελέτη Απειλών / Πολιτική Ασφαλείας (από 1η άσκηση)
- [ ] SSL / HTTPS setup (από 3η άσκηση)
- [ ] Authentication (JWT + bcrypt)
- [ ] Authorization (roles/permissions)
- [ ] Input validation & filtering
- [ ] Security scans (npm audit, OWASP ZAP)
- [ ] Τεκμηρίωση με Postman screenshots (flows login, create request, restricted access)

### 2️⃣ ΠΣ στο Διαδίκτυο (Algorithmic flow focus)
- [ ] Διαχείριση χρηστών (CRUD)
- [ ] Support Requests Flow (δημιουργία, προβολή, ανάθεση)
- [ ] Προστατευμένα endpoints (με token)
- [ ] Διάγραμμα/αλγόριθμος (flowchart του support requests)
- [ ] Εγχειρίδιο χρήστη (UI + Postman screenshots)
- [ ] Σύντομη αναφορά στην αρχιτεκτονική (backend + frontend)

---

## 📌 Τελικές ενέργειες
- [ ] Εγχειρίδιο χρήστη (screenshots Postman + UI)
- [ ] Repo cleanup (logs, οργάνωση φακέλων)
- [ ] Cross-check με εκφωνήσεις (και των δύο μαθημάτων)
- [ ] Παράδοση έως **23 Σεπτεμβρίου** 🎯
