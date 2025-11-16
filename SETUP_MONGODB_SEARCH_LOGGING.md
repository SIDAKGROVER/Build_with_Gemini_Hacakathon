# FinMentor Search Logging & MongoDB Compass Setup

This guide explains how to view all user searches and chat queries in MongoDB Compass.

---

## Prerequisites

1. **MongoDB Server** running locally (default: `mongodb://localhost:27017`)
   - Download from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

2. **MongoDB Compass** (GUI to view data)
   - Download from [mongodb.com/compass](https://www.mongodb.com/products/compass)
   - Or use MongoDB Atlas web interface

3. **FinMentor Backend** running
   - Backend must be running to capture searches: `npm run dev` in `/backend`

---

## How It Works

### Backend Setup (Already Done ✅)

1. **MongoDB Connection**
   - `backend/index.js` connects to MongoDB on startup
   - Creates a database named `finmentor` (default)
   - Uses the `searches` collection to store all chat queries

2. **Endpoints**
   - **POST `/api/chat`** — User sends chat message + optional `userId`, `income`, `goal`
     - Backend logs the query to `searches` collection automatically
   - **POST `/api/chat/log`** — Explicit logging endpoint
     - Frontend sends user session ID + query details
   - **GET `/api/searches`** — Retrieve all searches (optional: filter by `userId`)
     - Example: `GET http://localhost:4000/api/searches?userId=user_123`

### Frontend Setup (Already Done ✅)

- **`frontend/src/components/Chat.jsx`**
  - Generates a unique session ID (`sessionId`) for each chat session
  - Stores it in `sessionStorage` so all messages in one session share the same ID
  - After sending chat message, automatically logs the query to `/api/chat/log`
  - Includes: `userId`, `query`, `income`, `goal`, `timestamp`

---

## Environment Variables

### Backend (`.env`)

```env
# Optional: override MongoDB connection (default is localhost:27017)
MONGODB_URI=mongodb://localhost:27017

# Optional: override database name (default is finmentor)
MONGODB_DB=finmentor

# Optional: override port (default is 4000)
PORT=4000
```

### Frontend (`.env` or `.env.local`)

```env
# Optional: override backend URL (default is http://localhost:4000)
VITE_API_URL=http://localhost:4000
```

---

## Viewing Searches in MongoDB Compass

### Step 1: Start Everything

```bash
# Terminal 1: Start MongoDB (if not already running)
mongod

# Terminal 2: Start Backend
cd backend
npm run dev

# Terminal 3: Start Frontend (optional, for testing)
cd frontend
npm run dev
```

### Step 2: Open MongoDB Compass

1. Launch **MongoDB Compass**
2. Click **"New Connection"** (or use default `mongodb://localhost:27017`)
3. Click **"Connect"**

### Step 3: Navigate to Searches Collection

1. Left sidebar: Click database **`finmentor`**
2. Click collection **`searches`**
3. You should see all logged searches!

---

## Data Structure (Document Example)

Each document in `searches` collection looks like:

```json
{
  "_id": ObjectId("..."),
  "userId": "user_1731347892345_abc123def",
  "query": "How much should I save?",
  "income": 50000,
  "goal": "buy laptop in 9 months",
  "source": "chat",
  "timestamp": ISODate("2025-11-12T10:30:45.123Z")
}
```

---

## Querying in MongoDB Compass

### Find All Searches from a Specific User

In Compass, click **Filter** and enter:

```json
{ "userId": "user_1731347892345_abc123def" }
```

### Find All Searches with a Specific Goal

```json
{ "goal": { "$regex": "laptop", "$options": "i" } }
```

### Find Searches from Last 24 Hours

```json
{ "timestamp": { "$gte": { "$date": "2025-11-11T10:30:00Z" } } }
```

### Count Total Searches

In Compass, right-click `searches` → **View Statistics** → See document count

---

## Using the REST API

### Get All Searches (via curl or Postman)

```bash
curl http://localhost:4000/api/searches
```

### Get Searches for a Specific User

```bash
curl "http://localhost:4000/api/searches?userId=user_1731347892345_abc123def"
```

### Response Format

```json
[
  {
    "_id": "ObjectId(...)",
    "userId": "user_1731347892345_abc123def",
    "query": "How much should I save?",
    "income": 50000,
    "goal": "buy laptop in 9 months",
    "source": "chat",
    "timestamp": "2025-11-12T10:30:45.123Z"
  },
  ...
]
```

---

## Troubleshooting

### "MongoDB not connected" error

- Ensure MongoDB server is running: `mongod`
- Check `MONGODB_URI` in `.env` matches your MongoDB location
- Backend logs will show: `⚠️ Could not connect to MongoDB` if connection fails

### Searches not appearing in Compass

1. Open backend logs to confirm searches are being logged
2. Verify frontend is sending POST to `/api/chat/log` (check browser Network tab)
3. Restart backend: `npm run dev`
4. Refresh Compass collection view (F5)

### No data after running the app

1. Use the chat in the frontend multiple times to generate searches
2. Wait a moment (searches are async) then refresh Compass

---

## Summary

- **All user searches** are automatically logged to MongoDB `finmentor.searches`
- **Each search** includes: userId, query, income, goal, timestamp
- **View in Compass**: Connect to MongoDB → select `finmentor` database → click `searches` collection
- **Filter by userId** to see a specific user's search history
- **Use REST API** (`GET /api/searches`) for programmatic access

Enjoy tracking user search behavior! 🎉
