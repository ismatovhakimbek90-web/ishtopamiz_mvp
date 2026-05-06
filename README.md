# ⚡ IshTop — Ish topish va kasb o'rganish platformasi

## 📦 Loyiha tuzilmasi

```
ishplatform/
├── frontend/               ← Pure HTML/CSS/JS (brauzerda to'g'ridan-to'g'ri ochiladi)
│   ├── index.html
│   ├── css/style.css
│   └── js/
│       ├── db.js          ← LocalStorage DB + seed data
│       ├── auth.js        ← Login/Register/Session
│       ├── jobs.js        ← E'lonlar va matching algoritmi
│       ├── learn.js       ← Kurslar bazasi
│       └── app.js         ← Router va navigation
├── api/                   ← Django REST API
├── backend_django/        ← Django sozlamalari
├── server.js              ← Node.js Express server (frontend uchun)
├── manage.py              ← Django CLI
└── requirements.txt
```

---

## 🚀 ISHGA TUSHIRISH

### ✅ 1-USUL: To'g'ridan-to'g'ri brauzerda (eng oddiy)
```
frontend/index.html → ikki marta bosing yoki brauzerga torting
```
Barcha ma'lumotlar localStorage da saqlanadi. Internet kerak emas!

---

### 🟢 2-USUL: Node.js Express server bilan

```bash
# Node.js o'rnatilgan bo'lishi kerak (https://nodejs.org)
npm install
npm start
# http://localhost:3000 da ochiladi
```

---

### 🐍 3-USUL: Django backend bilan

```bash
# Virtual environment yaratish (ixtiyoriy)
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Kutubxonalarni o'rnatish
pip install -r requirements.txt

# Ma'lumotlar bazasi
python manage.py migrate
python manage.py seed           # Test ma'lumotlarni yuklash

# Serverni ishga tushirish
python manage.py runserver

# http://127.0.0.1:8000 da ochiladi
# http://127.0.0.1:8000/admin → Admin panel
```

---

## 👤 Test foydalanuvchilar

| Email | Parol | Rol |
|-------|-------|-----|
| ali@test.uz | 123456 | Ish qidiruvchi (Python, UI/UX) |
| malika@test.uz | 123456 | Ish qidiruvchi (SMM, Ingliz tili) |
| techcorp@test.uz | 123456 | Ish beruvchi (TechCorp LLC) |
| digital@test.uz | 123456 | Ish beruvchi (DigitalPro Agency) |
| admin | admin123 | Superuser (Django admin) |

---

## ✨ Funksiyalar

- 🔐 **Ro'yxatdan o'tish / Kirish** — email, parol, rol tanlash
- 🎯 **Skill Matching** — Jaccard algoritmi asosida % mos e'lonlar
- 📋 **E'lonlar** — yaratish, tahrirlash, o'chirish (ish beruvchi)
- 🚀 **Ariza yuborish** — status kuzatish (ish qidiruvchi)
- 📊 **Arizalarni boshqarish** — qabul/rad etish (ish beruvchi)
- 📚 **Kasb o'rganish** — 20+ YouTube kurslari, 7 skill
- 📱 **Responsive dizayn** — mobil va desktop

## 🔌 Django REST API Endpointlar

```
POST /api/auth/register/        → Ro'yxatdan o'tish
POST /api/auth/login/           → Kirish
POST /api/auth/logout/          → Chiqish
GET  /api/auth/me/              → Joriy foydalanuvchi

GET  /api/jobs/                 → Barcha e'lonlar
POST /api/jobs/                 → E'lon yaratish (employer)
GET  /api/jobs/<id>/            → E'lon tafsiloti
PUT  /api/jobs/<id>/            → E'lon yangilash (employer)
DELETE /api/jobs/<id>/          → E'lon o'chirish (employer)
GET  /api/jobs/matched/         → Menga mos e'lonlar (seeker)
POST /api/jobs/<id>/apply/      → Ariza yuborish (seeker)
GET  /api/jobs/<id>/applications/ → E'lon arizalari (employer)

GET  /api/applications/mine/          → Mening arizalarim
PATCH /api/applications/<id>/status/  → Ariza statusini o'zgartirish
```
