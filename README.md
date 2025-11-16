# FinMentor — AI Financial Coach (Build_with_Gemini_Hacakathon)

FinMentor is a lightweight demo application that provides plain-language financial coaching via a chatbot and a simple budget planner. This repository contains a frontend (Vite + React) and a backend (Node + Express) with optional MongoDB persistence for chat searches and user accounts.

## Features

- Chatbot that gives savings and budgeting advice (mock AI responses)
- Smart goal parsing: calculates monthly savings for goals (e.g., "buy car in 12 months")
- Persisted user accounts and search logs in MongoDB (`users`, `searches` collections)
- Simple budget calculator (50/30/20 example)

## Quick Start (local)

Prerequisites:
- Node.js (16+)
- MongoDB (local or Atlas)

1. Start MongoDB (local):

```powershell
# run MongoDB server if installed locally
mongod
```

2. Start the backend:

```powershell
cd backend
npm install
npm run dev
```

3. Start the frontend (new terminal):

```powershell
cd frontend
npm install
npm run dev
```

Open the frontend URL from Vite (typically `http://localhost:5173`) and use the chat.

## Environment

Backend (`/backend/.env`):

```
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=finmentor_dev
PORT=4000
```

Frontend (`/frontend/.env` or `.env.local`):

```
VITE_API_URL=http://localhost:4000
```

## Viewing Data in MongoDB Compass

- Connect to your MongoDB instance in MongoDB Compass.
- Open the `finmentor_dev` database and inspect `users` and `searches` collections.
- See `MONGODB_GUIDE.md` for full details and example queries.

## Files of interest

- `backend/index.js` — Express server, chat logic, MongoDB integration
- `frontend/src/components/Chat.jsx` — Chat UI and logging behavior
- `frontend/src/components/Auth.jsx` — Sign up / login UI (persists to DB)
- `MONGODB_GUIDE.md` — Detailed instructions to view logged searches in MongoDB Compass

## Notes

- This is a demo app: authentication is minimal and not production-ready. Do not use the demo auth flow as-is in production.
- Consider adding `.gitignore` to exclude `node_modules`, `.env`, and build artifacts if you haven't already.

---

If you want different wording or additional sections (contributing, license, screenshots), tell me what to include and I'll update the README.