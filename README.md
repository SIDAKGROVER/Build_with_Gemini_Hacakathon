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

## Emotional-Spending Detector (ESD)

FinMentor includes a prototype Emotional-Spending Detector that looks for patterns where users tend to spend more after expressing negative emotions in chat (e.g., "I'm stressed").

How it works (prototype):
- You log transactions via the backend API (`/api/transactions`).
- The server analyzes recent transactions and chat messages (`searches`) for a user and looks for spending spikes within 7 days after chats that contain negative keywords.
- When a spike is detected, an alert document is saved in the `esd_alerts` collection and returned by the analysis endpoint.

Endpoints (examples):

Log a transaction:
```powershell
curl.exe -X POST "http://localhost:4000/api/transactions" -H "Content-Type: application/json" -d '{ "userId":"user_123", "amount":499, "category":"food", "merchant":"Zomato", "note":"late-night order" }'
```

Run ESD analysis for a user (server returns alerts if found):
```powershell
curl.exe -X POST "http://localhost:4000/api/esd/analyze" -H "Content-Type: application/json" -d '{ "userId":"user_123", "lookbackDays":90 }'
```

Fetch alerts for a user:
```powershell
curl.exe "http://localhost:4000/api/esd/alerts?userId=user_123"
```

## Personalized Side-Hustle Generator

FinMentor now includes a Side-Hustle Generator prototype that recommends gig ideas based on a user's skills and available hours, and can generate starter guides and gig/resume text.

How it works (prototype):
- User provides skills and weekly hours.
- The server returns a set of suggested side-hustles with short descriptions, estimated monthly income, and starter steps.
- The `generate` endpoint returns a gig description, step-by-step starter plan, and a resume snippet you can copy-paste.

Endpoints (examples):

Suggest ideas:
```powershell
curl.exe -X POST "http://localhost:4000/api/sidehustle/suggest" -H "Content-Type: application/json" -d '{ "skills":"video editing, premiere", "hoursPerWeek":8 }'
```

Generate a guide & gig text:
```powershell
curl.exe -X POST "http://localhost:4000/api/sidehustle/generate" -H "Content-Type: application/json" -d '{ "title":"Video Editor (Freelance)", "skills":"premiere, color grading", "hoursPerWeek":8 }'
```

Frontend:
- A responsive `SideHustle` component is added under the Budget panel. Enter skills and hours to get suggestions and generate starter guides.

Notes & next steps:
- This is a rule-based prototype. We can later replace mappings with an ML model or richer prompts to an LLM to produce more personalized outputs.
- If you want a separate full-page UI, I can move `SideHustle` to its own route and add richer forms and CV export options.


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