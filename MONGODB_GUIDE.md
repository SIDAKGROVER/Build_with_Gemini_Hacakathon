# FinMentor MongoDB Integration Guide

Complete setup for **persistent login** and **search tracking** using MongoDB.

---

## What's New ✨

### 1. **Persistent User Login**
- User data now saved to MongoDB `users` collection
- Login/signup persisted across browser refreshes
- View all users in MongoDB Compass

### 2. **Search Tracking**
- Every chat query logged to MongoDB `searches` collection
- Includes: userId, query, income, goal, timestamp
- Filter searches by user in Compass

### 3. **MongoDB Endpoints**
- **POST `/api/auth/register`** — Create new user account
- **POST `/api/auth/login`** — Login user (or auto-create if doesn't exist)
- **GET `/api/auth/users`** — List all users
- **POST `/api/chat`** — Send chat message + auto-log search
- **POST `/api/chat/log`** — Explicit search logging
- **GET `/api/searches`** — Retrieve all searches (filter by userId)

---

## Setup Instructions

### Prerequisites

1. **MongoDB Server** running
   ```bash
   mongod
   ```

2. **Backend Node.js environment**
   - Dependencies already installed: `npm install` (in `/backend`)
   
3. **Frontend environment**
   - Vite dev server ready: `npm run dev` (in `/frontend`)

### Step 1: Start MongoDB

```bash
mongod
```
(Keep this running in a separate terminal)

### Step 2: Start Backend

```bash
cd backend
npm run dev
```

Expected output:
```
✅ Connected to MongoDB at mongodb://localhost:27017, DB: finmentor_dev
✅ Backend running on http://localhost:4000
```

### Step 3: Start Frontend

```bash
cd frontend
npm run dev
```

Then open the app in your browser (usually `http://localhost:5173`)

### Step 4: Sign Up / Login

1. Click **"Create account"** (or login if you already have one)
2. Enter email and name
3. Click **"Sign up"**
4. User data is **automatically saved to MongoDB**
5. Refresh the page — **you stay logged in!** ✅

### Step 5: Chat & Track Searches

1. Enter income (optional)
2. Enter goal (optional)
3. Send a chat message
4. Every message is **automatically logged to MongoDB**

---

## View Data in MongoDB Compass

### Open MongoDB Compass

1. Launch **MongoDB Compass**
2. Click **"Connect"** (connects to `mongodb://localhost:27017`)
3. Select database **`finmentor_dev`**

### View Users

1. Click collection **`users`**
2. See all registered accounts with:
   - `email` — login email
   - `name` — user's name
   - `createdAt` — signup timestamp
   - `lastLogin` — last login time

### View Searches

1. Click collection **`searches`**
2. See all chat queries with:
   - `userId` — session/user ID
   - `query` — what the user asked
   - `income` — their income (if provided)
   - `goal` — their goal (if provided)
   - `timestamp` — when they searched
   - `source` — always "chat"

### Filter by User

1. In collection `searches`, click **"Filter"**
2. Enter filter:
   ```json
   { "userId": "email@example.com" }
   ```
3. See only that user's searches

---

## Test Data Workflow

```
1. Sign Up → User saved to `users` collection
2. Refresh page → User restored from DB ✅
3. Send chat message → Search logged to `searches` collection
4. View in MongoDB Compass → See user & search data
```

---

## Environment Variables

### Backend (`.env`)

```env
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB=finmentor_dev
PORT=4000
```

### Frontend (`.env` or `.env.local`)

```env
VITE_API_URL=http://localhost:4000
```

---

## API Reference

### Authentication

#### POST `/api/auth/register`
Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "ObjectId(...)",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/api/auth/login`
Login existing user or create if doesn't exist.

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "ObjectId(...)",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

#### GET `/api/auth/users`
List all users (admin).

**Response:**
```json
[
  {
    "_id": "ObjectId(...)",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-11-12T10:30:00Z",
    "lastLogin": "2025-11-12T10:35:00Z"
  },
  ...
]
```

### Chat & Searches

#### POST `/api/chat`
Send a chat message (auto-logs search).

**Request:**
```json
{
  "userMessage": "How much should I save?",
  "income": 50000,
  "goal": "buy laptop in 9 months",
  "userId": "user@example.com"
}
```

**Response:**
```json
{
  "reply": "If you earn ₹50000, try saving ₹10000 (20%)..."
}
```

#### POST `/api/chat/log`
Explicitly log a search query.

**Request:**
```json
{
  "userId": "user@example.com",
  "query": "How much should I save?",
  "income": 50000,
  "goal": "buy laptop",
  "timestamp": "2025-11-12T10:30:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Search logged"
}
```

#### GET `/api/searches`
Retrieve all searches (filter by userId optional).

**Request:**
```bash
GET http://localhost:4000/api/searches
GET http://localhost:4000/api/searches?userId=user@example.com
```

**Response:**
```json
[
  {
    "_id": "ObjectId(...)",
    "userId": "user@example.com",
    "query": "How much should I save?",
    "income": 50000,
    "goal": "buy laptop",
    "source": "chat",
    "timestamp": "2025-11-12T10:30:00.000Z"
  },
  ...
]
```

---

## Troubleshooting

### "MongoDB not connected" error
- Ensure MongoDB server is running: `mongod`
- Check `MONGODB_URI` in `.env`
- Restart backend: `npm run dev`

### Users not persisting after refresh
- Check localStorage is enabled in browser
- Clear browser cache & localStorage, then try again
- Check backend logs for save errors

### Searches not showing in Compass
1. Confirm backend is running and connected to MongoDB
2. Check browser Network tab for `/api/chat/log` POST requests
3. Refresh Compass collection view (F5)
4. Wait a moment (async writes) then refresh again

### "Email already exists" error
- That email is already registered
- Try logging in instead of signing up
- Or use a different email

---

## Next Steps

- **User Authentication:** Add password encryption (bcrypt) for production
- **Search Analytics:** Build dashboards to analyze user queries
- **User Preferences:** Save chat preferences/history per user
- **Export Data:** Add endpoints to export user data

---

## Summary

✅ **Users** persisted to MongoDB `users` collection  
✅ **Searches** logged to MongoDB `searches` collection  
✅ **Login** saved across browser refresh  
✅ **Data** viewable in MongoDB Compass  

You're all set! 🎉
