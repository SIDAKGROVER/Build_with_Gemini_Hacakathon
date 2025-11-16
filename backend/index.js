 require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB setup
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mongoDbName = process.env.MONGODB_DB || 'finmentor_dev';
const client = new MongoClient(mongoUri, { serverSelectionTimeoutMS: 5000 });
let searchesCollection;

async function start() {
  try {
    await client.connect();
    const db = client.db(mongoDbName);
    searchesCollection = db.collection('searches');
    const usersCollection = db.collection('users');
    
    // Create indexes for better query performance
    await searchesCollection.createIndex({ userId: 1, timestamp: -1 });
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    
    // Make collections globally available
    global.searchesCollection = searchesCollection;
    global.usersCollection = usersCollection;
    
    console.log(`✅ Connected to MongoDB at ${mongoUri}, DB: ${mongoDbName}`);
  } catch (err) {
    console.warn('⚠️ Could not connect to MongoDB — searches will still work in-memory until a connection is available.', err.message);
    searchesCollection = null;
    global.searchesCollection = null;
    global.usersCollection = null;
  }

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`✅ Backend running on http://localhost:${PORT}`));
}

// Chatbot mock API — also logs search queries to `searches` collection when possible
app.post('/api/chat', async (req, res) => {
  const { userMessage, income, goal, userId } = req.body;
  
  // Smart AI logic: parse goals and give specific advice
  let reply = "";
  
  if (!userMessage || !userMessage.trim()) {
    reply = "Please ask me a question about saving, budgeting, or investing!";
  } else {
    const msg = userMessage.toLowerCase();
    
    // Parse goal patterns like "buy car in 12 months", "save ₹5,00,000 in 6 months", etc.
    const monthsMatch = msg.match(/(\d+)\s*months?/i);
    const months = monthsMatch ? parseInt(monthsMatch[1]) : null;

    // Robust amount parsing (prefer explicit currency then word-units then large numbers)
    let goalAmount = null;

    // 1) currency symbols: ₹, rs, rupees
    const curMatch = msg.match(/(?:₹|rs\.?|rupees?|rupee)\s*([\d,]+(?:\.\d+)?)/i);
    if (curMatch) {
      goalAmount = parseInt(curMatch[1].replace(/,/g, ''));
    }

    // 2) word-based units: k, thousand, lakh, lac, million, crore
    if (!goalAmount) {
      const wordMatch = msg.match(/(\d+(?:\.\d+)?)\s*(k|thousand|lakh|lac|million|crore|cr)\b/i);
      if (wordMatch) {
        const num = parseFloat(wordMatch[1]);
        const unit = wordMatch[2].toLowerCase();
        const multipliers = {
          k: 1_000,
          thousand: 1_000,
          lakh: 100_000,
          lac: 100_000,
          million: 1_000_000,
          crore: 10_000_000,
          cr: 10_000_000,
        };
        const mult = multipliers[unit] || 1;
        goalAmount = Math.round(num * mult);
      }
    }

    // 3) plain large numbers (avoid small numbers like months)
    if (!goalAmount) {
      const bigNumMatch = msg.match(/(\d{4,}(?:,\d{3})*)/);
      if (bigNumMatch) goalAmount = parseInt(bigNumMatch[1].replace(/,/g, ''));
    }
    
    // Determine what the user wants to buy/achieve
    let goalType = "savings goal";
    if (msg.includes("car")) goalType = "car";
    else if (msg.includes("laptop") || msg.includes("computer")) goalType = "laptop";
    else if (msg.includes("house") || msg.includes("home")) goalType = "house";
    else if (msg.includes("bike") || msg.includes("motorcycle")) goalType = "bike";
    else if (msg.includes("holiday") || msg.includes("vacation") || msg.includes("trip")) goalType = "holiday";
    else if (msg.includes("wedding")) goalType = "wedding";
    else if (msg.includes("education") || msg.includes("study")) goalType = "education";
    
    // Case 1: User provides both income and goal with timeframe
    if (income && months) {
      const monthlyIncome = parseInt(income);
      
      // Estimate item cost if not provided
      let estimatedCost = goalAmount;
      if (!estimatedCost) {
        if (goalType === "car") estimatedCost = 500000;
        else if (goalType === "laptop") estimatedCost = 100000;
        else if (goalType === "bike") estimatedCost = 150000;
        else if (goalType === "house") estimatedCost = 5000000;
        else if (goalType === "holiday") estimatedCost = 200000;
        else if (goalType === "wedding") estimatedCost = 1000000;
        else if (goalType === "education") estimatedCost = 500000;
        else estimatedCost = monthlyIncome * months * 0.2; // Default: 20% of annual income
      }
      
      const monthlySavingsNeeded = Math.ceil(estimatedCost / months);
      const percentageOfIncome = ((monthlySavingsNeeded / monthlyIncome) * 100).toFixed(1);
      
      // Check if goal is realistic
      if (monthlySavingsNeeded > monthlyIncome * 0.5) {
        reply = `🚗 To buy a ${goalType} (estimated ₹${estimatedCost.toLocaleString()}) in ${months} months:\n\n`;
        reply += `💰 You need to save: ₹${monthlySavingsNeeded.toLocaleString()} per month\n`;
        reply += `⚠️ That's ${percentageOfIncome}% of your ₹${monthlyIncome.toLocaleString()} monthly income.\n\n`;
        reply += `This is challenging! Consider:\n`;
        reply += `• Extend timeline to ${Math.ceil(estimatedCost / (monthlyIncome * 0.4))} months\n`;
        reply += `• Reduce the goal amount\n`;
        reply += `• Increase income through side projects\n`;
        reply += `• Get a loan/EMI for the balance`;
      } else {
        reply = `🚗 To buy a ${goalType} (estimated ₹${estimatedCost.toLocaleString()}) in ${months} months:\n\n`;
        reply += `✅ Monthly savings needed: ₹${monthlySavingsNeeded.toLocaleString()}\n`;
        reply += `📊 This is ${percentageOfIncome}% of your income — very achievable!\n\n`;
        reply += `💡 Savings breakdown (50/30/20 rule):\n`;
        reply += `• Needs (50%): ₹${Math.round(monthlyIncome * 0.5).toLocaleString()}\n`;
        reply += `• Wants (30%): ₹${Math.round(monthlyIncome * 0.3).toLocaleString()}\n`;
        reply += `• Savings (20%): ₹${Math.round(monthlyIncome * 0.2).toLocaleString()}\n\n`;
        reply += `🎯 Your goal requires ₹${monthlySavingsNeeded.toLocaleString()}, so:\n`;
        if (monthlySavingsNeeded <= Math.round(monthlyIncome * 0.2)) {
          reply += `• You can achieve this from your normal 20% savings.\n`;
        } else {
          const extra = monthlySavingsNeeded - Math.round(monthlyIncome * 0.2);
          reply += `• Cut back "Wants" by ₹${extra.toLocaleString()} to meet your goal.\n`;
        }
        reply += `• Open a dedicated savings account\n`;
        reply += `• Set up auto-transfer on salary day`;
      }
    }
    // Case 2: User asks about 50/30/20 rule
    else if (msg.includes("50/30/20") || msg.includes("50 30 20")) {
      const needs = income ? Math.round(income * 0.5) : 10000;
      const wants = income ? Math.round(income * 0.3) : 6000;
      const savings = income ? Math.round(income * 0.2) : 4000;
      
      reply = `💼 50/30/20 Budget Rule\n\n`;
      if (income) {
        reply += `With ₹${income} monthly income:\n`;
        reply += `🏠 Needs (50%): ₹${needs} (rent, food, utilities, transport)\n`;
        reply += `🎮 Wants (30%): ₹${wants} (entertainment, dining, hobbies)\n`;
        reply += `💰 Savings (20%): ₹${savings} (emergency fund, investments)\n\n`;
      } else {
        reply += `For any income:\n`;
        reply += `🏠 Needs: 50% (essential expenses)\n`;
        reply += `🎮 Wants: 30% (lifestyle & entertainment)\n`;
        reply += `💰 Savings: 20% (build wealth)\n\n`;
      }
      reply += `This rule helps balance your lifestyle with financial security.\n`;
      reply += `Adjust percentages based on your goals and location!`;
    }
    // Case 3: User asks about general saving strategies
    else if (msg.includes("save") || msg.includes("saving") || msg.includes("budget")) {
      if (income) {
        const amount = Math.round(income * 0.2);
        reply = `💡 Smart Saving Tips for ₹${income} monthly income:\n\n`;
        reply += `📌 Save at least ₹${amount} per month (20% rule)\n`;
        reply += `📌 Track every expense for a month\n`;
        reply += `📌 Cut 5-10 unnecessary subscriptions\n`;
        reply += `📌 Use "Pay Yourself First" — save before spending\n`;
        reply += `📌 Build 3-6 months emergency fund\n`;
        reply += `📌 Start small, increase gradually\n\n`;
        reply += `🎯 Specific goals help! Tell me what you want to buy.`;
      } else {
        reply = `💡 General Saving Tips:\n\n`;
        reply += `📌 Follow the 50/30/20 rule\n`;
        reply += `📌 Track your spending daily\n`;
        reply += `📌 Automate savings (auto-transfer to savings account)\n`;
        reply += `📌 Build emergency fund (3-6 months expenses)\n`;
        reply += `📌 Cut unnecessary subscriptions\n`;
        reply += `📌 Set specific financial goals\n\n`;
        reply += `💰 Share your income & goal, and I'll give personalized advice!`;
      }
    }
    // Case 4: General investment/financial advice
    else if (msg.includes("invest") || msg.includes("investment") || msg.includes("stock")) {
      reply = `📈 Investment Basics:\n\n`;
      reply += `Before investing, ensure:\n`;
      reply += `✅ Emergency fund (3-6 months expenses)\n`;
      reply += `✅ Zero high-interest debt\n`;
      reply += `✅ Clear financial goal & timeline\n\n`;
      reply += `📊 Popular options:\n`;
      reply += `• Savings Account: Safe, low returns (3-4%)\n`;
      reply += `• Fixed Deposits: Safe, better returns (5-7%)\n`;
      reply += `• Mutual Funds: Moderate risk, 8-12% returns\n`;
      reply += `• Stocks: High risk, high rewards\n\n`;
      reply += `💡 Tip: Start with low-risk options, gradually increase risk as you learn!`;
    }
    // Case 5: Income-based calculation
    else if (income && !months) {
      const amount = Math.round(income * 0.2);
      reply = `💼 With ₹${income} monthly income:\n\n`;
      reply += `🎯 Recommended monthly savings: ₹${amount} (20% rule)\n`;
      reply += `🏠 Essential expenses (50%): ₹${Math.round(income * 0.5)}\n`;
      reply += `🎮 Lifestyle (30%): ₹${Math.round(income * 0.3)}\n`;
      reply += `💰 Savings (20%): ₹${amount}\n\n`;
      reply += `💡 Tell me your goal (car, house, holiday, etc.) and timeframe, and I'll calculate exact monthly savings needed!`;
    }
    // Default response
    else {
      reply = `💭 I can help you with:\n\n`;
      reply += `✅ "I earn ₹50,000. I want to buy a car in 12 months. How much should I save?"\n`;
      reply += `✅ "What's the 50/30/20 rule?"\n`;
      reply += `✅ "How can I save more money?"\n`;
      reply += `✅ "Should I invest? What's the best way?"\n`;
      reply += `✅ "I earn ₹30,000. Tell me my budget."\n\n`;
      reply += `💰 Share your income and goal for personalized advice!`;
    }
  }

  // Attempt to log the search to MongoDB (best-effort; don't block the response on failure)
  const doc = {
    userId: userId || null,
    query: userMessage || null,
    income: income || null,
    goal: goal || null,
    source: 'chat',
    timestamp: new Date(),
  };

  console.log('📝 Chat request received:', { userId, query: userMessage, income, goal });

  if (searchesCollection) {
    try {
      const result = await searchesCollection.insertOne(doc);
      console.log('✅ Search logged to DB:', result.insertedId);
    } catch (err) {
      console.error('❌ Failed to insert search log into MongoDB:', err.message);
    }
  } else {
    // If MongoDB isn't connected, optionally fallback to console log
    console.log('⚠️ Search (no DB):', doc);
  }

  res.json({ reply });
});

// Budget calculator API
app.post('/api/budget', (req, res) => {
  const income = Number(req.body.income) || 20000;
  res.json({
    income,
    needs: income * 0.5,
    wants: income * 0.3,
    savings: income * 0.2,
  });
});

// Explicit search logging endpoint (frontend can call this separately to log queries)
app.post('/api/chat/log', async (req, res) => {
  const { userId, query, income, goal, timestamp } = req.body;
  const doc = {
    userId: userId || null,
    query: query || null,
    income: income || null,
    goal: goal || null,
    source: 'chat',
    timestamp: timestamp ? new Date(timestamp) : new Date(),
  };

  console.log('📝 Explicit log request received:', { userId, query, income, goal });

  if (searchesCollection) {
    try {
      const result = await searchesCollection.insertOne(doc);
      console.log('✅ Search explicitly logged to DB:', result.insertedId);
      res.json({ success: true, message: 'Search logged' });
    } catch (err) {
      console.error('❌ Failed to insert search log into MongoDB:', err.message);
      res.status(500).json({ error: 'Failed to log search' });
    }
  } else {
    console.log('⚠️ Search (no DB):', doc);
    res.json({ success: true, message: 'Search logged (no DB)' });
  }
});

// Admin API: list recent searches (for viewing in MongoDB Compass you can also open the DB directly)
app.get('/api/searches', async (req, res) => {
  try {
    if (!searchesCollection) return res.status(503).json({ error: 'MongoDB not connected' });
    const q = {};
    if (req.query.userId) q.userId = req.query.userId;
    const cursor = searchesCollection.find(q).sort({ timestamp: -1 }).limit(1000);
    const results = await cursor.toArray();
    res.json(results);
  } catch (err) {
    console.error('Error fetching searches:', err.message);
    res.status(500).json({ error: 'Failed to fetch searches' });
  }
});

// Authentication API: Register/Login with persistence to MongoDB
app.post('/api/auth/register', async (req, res) => {
  const { email, name } = req.body;
  
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  try {
    const usersCollection = global.usersCollection;
    if (!usersCollection) return res.status(503).json({ error: 'MongoDB not connected' });

    // Check if user already exists
    const existing = await usersCollection.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create new user
    const user = {
      email,
      name,
      createdAt: new Date(),
      lastLogin: new Date(),
    };

    const result = await usersCollection.insertOne(user);
    const userData = { _id: result.insertedId.toString(), email, name };
    
    console.log('✅ New user registered:', email);
    res.json({ success: true, user: userData });
  } catch (err) {
    console.error('❌ Registration error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const usersCollection = global.usersCollection;
    if (!usersCollection) return res.status(503).json({ error: 'MongoDB not connected' });

    // Find or create user
    const user = await usersCollection.findOneAndUpdate(
      { email },
      {
        $set: { lastLogin: new Date(), name: name || 'User' },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true, returnDocument: 'after' }
    );

    const userData = { _id: user.value._id.toString(), email: user.value.email, name: user.value.name };
    
    console.log('✅ User logged in:', email);
    res.json({ success: true, user: userData });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/users', async (req, res) => {
  try {
    const usersCollection = global.usersCollection;
    if (!usersCollection) return res.status(503).json({ error: 'MongoDB not connected' });

    const users = await usersCollection
      .find({}, { projection: { email: 1, name: 1, createdAt: 1, lastLogin: 1 } })
      .sort({ lastLogin: -1 })
      .limit(100)
      .toArray();

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

start().catch((e) => console.error('Startup error:', e));

