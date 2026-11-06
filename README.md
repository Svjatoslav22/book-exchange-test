# BookXhange-insiders

Тестове завдання: веб-додаток для обміну книгами.

**Відео-демонстрація (Loom):** https://www.loom.com/share/5df8aca7aa0046f78a0de064b33988e9

## Стек
- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, bcrypt, Zod, Multer, Nodemailer (Ethereal Email).
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS, Axios, React Hook Form, Zod.

## Запуск проєкту

### 1. Backend
```bash
cd backend
npm install
```
Створіть `backend/.env`:
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB"
JWT_SECRET="secret"
PORT=5000
FRONTEND_URL="http://localhost:3000"
```
Запустіть міграції та сервер:
```bash
npx prisma migrate dev
npm run dev
```

### 2. Frontend
```bash
cd frontend
npm install
```
Створіть `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```
Запустіть додаток:
```bash
npm run dev
```
Додаток буде доступний на `http://localhost:3000`.