const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { MongoMemoryServer } = require('mongodb-memory-server');
const { GoogleGenAI } = require('@google/generative-ai');

const User = require('./models/User');
const Trip = require('./models/Trip');
const Destination = require('./models/Destination');
const Review = require('./models/Review');
const Expense = require('./models/Expense');
const ItineraryDay = require('./models/Itinerary');

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`[Backend] ${req.method} ${req.url}`);
  next();
});

const JWT_SECRET = process.env.JWT_SECRET || 'wander-smart-secret-key-12345';

// Database setup and auto-seeding
let isConnecting = null;
async function ensureDBConnected() {
  if (mongoose.connection.readyState === 1) return;
  if (isConnecting) return isConnecting;

  isConnecting = (async () => {
    try {
      let mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
        if (process.env.VERCEL) {
          console.warn("⚠️ Running on Vercel without MONGO_URI. Operating in serverless mode.");
          return;
        }
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const mongod = await MongoMemoryServer.create();
        mongoUri = mongod.getUri();
        console.log(`✨ In-memory MongoDB started at: ${mongoUri}`);
      }
      await mongoose.connect(mongoUri);
      console.log("✅ DB Connected");

      // Seeding database
      const count = await Destination.countDocuments();
      if (count === 0) {
        console.log("🌱 Database is empty. Seeding initial data...");
        const runSeed = require('./seed');
        await runSeed();

        // Seed a default test user
        const hashedPassword = await bcrypt.hash('password', 10);
        const testUser = await User.create({
          username: 'traveler',
          email: 'traveler@example.com',
          password: hashedPassword
        });
        console.log("👤 Default test user seeded: traveler@example.com / password");

        // Create a default trip for this test user
        const trip = await Trip.create({
          user: testUser._id,
          destination: 'Goa, India',
          isActive: true
        });

        // Copy template itineraries for this default trip
        const itineraryTemplates = await ItineraryDay.find({ user: { $exists: false } });
        for (const template of itineraryTemplates) {
          await ItineraryDay.create({
            dayTitle: template.dayTitle,
            items: template.items,
            user: testUser._id,
            trip: trip._id
          });
        }

        // Copy template expenses for this default trip
        const expenseTemplates = await Expense.find({ user: { $exists: false } });
        for (const exp of expenseTemplates) {
          await Expense.create({
            title: exp.title,
            category: exp.category,
            amount: exp.amount,
            dateString: exp.dateString,
            user: testUser._id,
            trip: trip._id
          });
        }
      } else {
        console.log("👍 Database already contains data. Skipping seeding.");
      }
    } catch (err) {
      console.error("❌ DB connection error:", err);
    } finally {
      isConnecting = null;
    }
  })();

  return isConnecting;
}

// Auto-connect middleware for serverless requests
app.use(async (req, res, next) => {
  await ensureDBConnected();
  next();
});

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ================= AUTH ROUTES =================

// User Registration
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please provide all fields' });
  }
  const cleanEmail = email.trim().toLowerCase();
  try {
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email: cleanEmail, password: hashedPassword });
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });

    // Automatically create a default trip for the user so they start with data
    const trip = await Trip.create({
      user: user._id,
      destination: 'Goa, India',
      isActive: true
    });

    // Copy template itineraries for this default trip
    const itineraryTemplates = await ItineraryDay.find({ user: { $exists: false } });
    for (const template of itineraryTemplates) {
      await ItineraryDay.create({
        dayTitle: template.dayTitle,
        items: template.items,
        user: user._id,
        trip: trip._id
      });
    }

    // Copy template expenses for this default trip
    const expenseTemplates = await Expense.find({ user: { $exists: false } });
    for (const exp of expenseTemplates) {
      await Expense.create({
        title: exp.title,
        category: exp.category,
        amount: exp.amount,
        dateString: exp.dateString,
        user: user._id,
        trip: trip._id
      });
    }

    res.status(201).json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please provide email and password' });
  }
  const cleanEmail = email.trim().toLowerCase();
  try {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Current User Profile
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= PUBLIC DESTINATIONS & REVIEWS =================

app.get('/api/destinations', async (req, res) => {
  try {
    const destinations = await Destination.find();
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const newReview = new Review(req.body);
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= USER SCOPED TRIP ROUTES =================

// Get all trips
app.get('/api/trips', authMiddleware, async (req, res) => {
  try {
    const trips = await Trip.find({ user: req.userId });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create and activate a new trip
app.post('/api/trips', authMiddleware, async (req, res) => {
  const { destination, numberOfDays, totalBudget, budgetStyle } = req.body;
  if (!destination) {
    return res.status(400).json({ error: 'Destination is required' });
  }
  try {
    // Set all other user trips to inactive
    await Trip.updateMany({ user: req.userId }, { isActive: false });

    const days = parseInt(numberOfDays) || 2;
    const budget = parseFloat(totalBudget) || 25000;
    const style = budgetStyle || 'Mid-range';

    // Create the new trip with dynamic parameters
    const trip = await Trip.create({
      user: req.userId,
      destination,
      numberOfDays: days,
      totalBudget: budget,
      budgetStyle: style,
      isActive: true
    });

    // Dynamically generate Itinerary Days matching the exact days count chosen by user
    for (let i = 1; i <= days; i++) {
      let dayTitle = `Day ${i}: `;
      let items = [];

      if (i === 1) {
        dayTitle += 'Arrival & Exploration';
        items = [
          { time: '12:00 PM', title: 'Arrival & Check-in at Hotel', type: 'lodging' },
          { time: '02:30 PM', title: 'Lunch at local cafe', type: 'food' },
          { time: '05:00 PM', title: 'Evening orientation walk & sunset viewing', type: 'activity' }
        ];
      } else if (i === days && days > 1) {
        dayTitle += 'Departure';
        items = [
          { time: '10:00 AM', title: 'Local souvenir shopping & packing', type: 'activity' },
          { time: '12:00 PM', title: 'Check-out & Transit to terminal', type: 'transport' }
        ];
      } else {
        dayTitle += `Sightseeing & Local Attractions`;
        items = [
          { time: '09:00 AM', title: 'Explore key historical landmarks', type: 'activity' },
          { time: '01:00 PM', title: 'Traditional regional lunch', type: 'food' },
          { time: '04:00 PM', title: 'Local market walking tour & snacks', type: 'activity' },
          { time: '08:00 PM', title: 'Cultural dinner program', type: 'food' }
        ];
      }

      await ItineraryDay.create({
        dayTitle,
        items,
        user: req.userId,
        trip: trip._id
      });
    }

    // Seed default starter expenses matching their budget style scale
    const flightCost = style === 'Luxury' ? 12000 : (style === 'Backpacker' ? 4500 : 6500);
    const hotelCost = style === 'Luxury' ? 25000 : (style === 'Backpacker' ? 3000 : 8000);
    const localCost = style === 'Luxury' ? 3500 : (style === 'Backpacker' ? 800 : 1500);

    await Expense.create([
      { title: 'Transit / Flight Bookings', category: 'Transport', amount: flightCost, dateString: new Date().toISOString().split('T')[0], user: req.userId, trip: trip._id },
      { title: 'Accommodation Booking', category: 'Accommodation', amount: hotelCost, dateString: new Date().toISOString().split('T')[0], user: req.userId, trip: trip._id },
      { title: 'Local Transport & Snacks', category: 'Food', amount: localCost, dateString: new Date().toISOString().split('T')[0], user: req.userId, trip: trip._id }
    ]);

    res.status(201).json(trip);
  } catch (err) {
    console.error('Create trip error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get user's currently active trip
app.get('/api/trips/active', authMiddleware, async (req, res) => {
  try {
    let trip = await Trip.findOne({ user: req.userId, isActive: true });
    if (!trip) {
      // Fallback: check if user has any trips. If so, make the latest one active.
      trip = await Trip.findOne({ user: req.userId }).sort({ updatedAt: -1 });
      if (trip) {
        trip.isActive = true;
        await trip.save();
      } else {
        // Create a default trip
        trip = await Trip.create({
          user: req.userId,
          destination: 'Goa, India',
          isActive: true
        });
        
        // Copy templates
        const templates = await ItineraryDay.find({ user: { $exists: false } });
        for (const template of templates) {
          await ItineraryDay.create({
            dayTitle: template.dayTitle,
            items: template.items,
            user: req.userId,
            trip: trip._id
          });
        }
      }
    }
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Set active trip by ID
app.post('/api/trips/active/:id', authMiddleware, async (req, res) => {
  try {
    await Trip.updateMany({ user: req.userId }, { isActive: false });
    const trip = await Trip.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { isActive: true },
      { new: true }
    );
    if (!trip) return res.status(404).json({ error: 'Trip not found' });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a trip
app.delete('/api/trips/:id', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    // Clean up associated itinerary days and expenses
    await ItineraryDay.deleteMany({ trip: req.params.id, user: req.userId });
    await Expense.deleteMany({ trip: req.params.id, user: req.userId });

    res.json({ message: 'Trip deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= USER SCOPED ITINERARY ENDPOINTS =================

// Get itinerary days for active trip
app.get('/api/itineraries', authMiddleware, async (req, res) => {
  try {
    const activeTrip = await Trip.findOne({ user: req.userId, isActive: true });
    if (!activeTrip) return res.json([]);

    const days = await ItineraryDay.find({ user: req.userId, trip: activeTrip._id });
    res.json(days);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new itinerary day
app.post('/api/itineraries/day', authMiddleware, async (req, res) => {
  const { dayTitle } = req.body;
  if (!dayTitle) return res.status(400).json({ error: 'Day title is required' });

  try {
    const activeTrip = await Trip.findOne({ user: req.userId, isActive: true });
    if (!activeTrip) return res.status(400).json({ error: 'No active trip found' });

    const newDay = await ItineraryDay.create({
      dayTitle,
      items: [],
      user: req.userId,
      trip: activeTrip._id
    });
    res.status(201).json(newDay);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add an activity to an itinerary day
app.post('/api/itineraries/activity', authMiddleware, async (req, res) => {
  const { dayId, time, title, type } = req.body;
  if (!dayId || !time || !title || !type) {
    return res.status(400).json({ error: 'All activity fields are required' });
  }

  try {
    const day = await ItineraryDay.findOne({ _id: dayId, user: req.userId });
    if (!day) return res.status(404).json({ error: 'Itinerary day not found' });

    day.items.push({ time, title, type });
    await day.save();
    res.status(201).json(day);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= USER SCOPED EXPENSE ENDPOINTS =================

// Get expenses for active trip
app.get('/api/expenses', authMiddleware, async (req, res) => {
  try {
    const activeTrip = await Trip.findOne({ user: req.userId, isActive: true });
    if (!activeTrip) return res.json([]);

    const expenses = await Expense.find({ user: req.userId, trip: activeTrip._id });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add an expense to active trip
app.post('/api/expenses', authMiddleware, async (req, res) => {
  const { title, category, amount, dateString } = req.body;
  if (!title || !category || amount === undefined || !dateString) {
    return res.status(400).json({ error: 'All expense fields are required' });
  }

  try {
    const activeTrip = await Trip.findOne({ user: req.userId, isActive: true });
    if (!activeTrip) return res.status(400).json({ error: 'No active trip found' });

    const newExpense = await Expense.create({
      title,
      category,
      amount,
      dateString,
      user: req.userId,
      trip: activeTrip._id
    });
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete an expense
app.delete('/api/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted successfully!' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Legacy clean route
app.delete('/api/clear', authMiddleware, async (req, res) => {
  try {
    const activeTrip = await Trip.findOne({ user: req.userId, isActive: true });
    if (activeTrip) {
      await ItineraryDay.deleteMany({ trip: activeTrip._id, user: req.userId });
      await Expense.deleteMany({ trip: activeTrip._id, user: req.userId });
    }
    res.json({ message: 'Active trip itinerary and expenses cleared' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ================= AI CHAT AGENT ROUTE =================
app.post('/api/chat', authMiddleware, async (req, res) => {
  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const activeTrip = await Trip.findOne({ user: req.userId, isActive: true });
    if (!activeTrip) {
      return res.json({ reply: "I couldn't find an active trip! Please select a destination in the **Explore** or **Travel Map** tabs first so we can start planning together. 🌍" });
    }

    const expenses = await Expense.find({ user: req.userId, trip: activeTrip._id });
    const itineraries = await ItineraryDay.find({ user: req.userId, trip: activeTrip._id }).sort({ createdAt: 1 });

    const queryText = message.trim();

    // ================= DYNAMIC GEMINI LLM INTERACTION =================
    if (process.env.GEMINI_API_KEY) {
      try {
        const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalBudget = activeTrip.totalBudget || 25000;
        const remaining = totalBudget - totalSpent;
        const percent = Math.min((totalSpent / totalBudget) * 100, 100).toFixed(1);

        const expensesContext = expenses.map(e => `- ${e.title}: ₹${e.amount} (${e.category})`).join('\n');
        
        let itinerariesContext = '';
        itineraries.forEach((day, index) => {
          itinerariesContext += `Day ${index + 1} (${day.dayTitle}):\n`;
          if (day.items.length === 0) {
            itinerariesContext += `  - No activities planned\n`;
          } else {
            day.items.forEach(item => {
              itinerariesContext += `  - ${item.time}: ${item.title} (${item.type})\n`;
            });
          }
        });

        // Prompt with context
        const prompt = `
You are "WanderSmart AI", a premium, friendly, and highly intelligent AI travel agent assisting the user with their trip to ${activeTrip.destination}.

Current Trip Parameters:
- Destination: ${activeTrip.destination}
- Total Budget limit: ₹${totalBudget.toLocaleString()}
- Budget Style scale: ${activeTrip.budgetStyle || 'Mid-range'}
- Total Spent so far: ₹${totalSpent.toLocaleString()} (${percent}% spent)
- Remaining Balance: ₹${remaining.toLocaleString()}

Current Logged Expenses:
${expensesContext || 'No expenses logged yet.'}

Current Daily Itinerary:
${itinerariesContext || 'No itinerary days added yet.'}

USER QUERY: "${queryText}"

CRITICAL INSTRUCTIONS:
1. Answer the user's question contextually using the trip parameters, expenses, and itinerary provided above.
2. Format your response beautifully in GitHub-flavored Markdown. Keep responses concise, engaging, and localized to Indian vibes (currency symbol ₹).
3. If the user asks about their budget or schedule, sum or list the parameters provided above.
4. Keep responses under 200 words. Do not hallucinate details unrelated to travel.
`;

        // Intercept action commands first (add expense / add activity) so they run in DB
        const addExpenseRegex = /(?:add\s+expense|spent)\s+(.+?)\s+(\d+)/i;
        const addExpenseRegex2 = /(?:add\s+expense|spent)\s+(\d+)\s+(?:on|for)\s+(.+)/i;
        const addActivityRegex = /(?:add\s+activity|add\s+event|schedule)\s+(.+?)\s+at\s+(.+?)\s+on\s+day\s+(\d+)/i;
        
        const isDbAction = addExpenseRegex.test(queryText) || 
                            addExpenseRegex2.test(queryText) || 
                            addActivityRegex.test(queryText);

        if (!isDbAction) {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const model = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContent({ contents: [{ role: 'user', parts: [{ text: prompt }] }] });
          const responseText = result.response.text();
          
          if (responseText && responseText.trim()) {
            return res.json({ reply: responseText.trim() });
          }
        }
      } catch (geminiErr) {
        console.error("Gemini API error (falling back to regex engine):", geminiErr);
      }
    }

    // ================= DETERMINISTIC FALLBACK MODE (Regex Engine) =================

    // 1. INTENT: Add Expense
    const addExpenseRegex = /(?:add\s+expense|spent)\s+(.+?)\s+(\d+)/i;
    const addExpenseRegex2 = /(?:add\s+expense|spent)\s+(\d+)\s+(?:on|for)\s+(.+)/i;
    let expenseMatch = queryText.match(addExpenseRegex) || queryText.match(addExpenseRegex2);
    
    if (expenseMatch) {
      let title, amount;
      if (isNaN(expenseMatch[1])) {
        title = expenseMatch[1].trim();
        amount = parseFloat(expenseMatch[2]);
      } else {
        amount = parseFloat(expenseMatch[1]);
        title = expenseMatch[2].trim();
      }

      if (!isNaN(amount) && amount > 0) {
        const newExpense = await Expense.create({
          title,
          category: 'Other',
          amount,
          dateString: new Date().toISOString().split('T')[0],
          user: req.userId,
          trip: activeTrip._id
        });
        return res.json({
          reply: `Sure! I have added an expense of **₹${amount.toLocaleString()}** for **"${title}"** to your **${activeTrip.destination}** budget. 💸`,
          action: 'add_expense',
          data: newExpense
        });
      }
    }

    // 2. INTENT: Add Activity
    const addActivityRegex = /(?:add\s+activity|add\s+event|schedule)\s+(.+?)\s+at\s+(.+?)\s+on\s+day\s+(\d+)/i;
    const activityMatch = queryText.match(addActivityRegex);
    if (activityMatch) {
      const title = activityMatch[1].trim();
      const time = activityMatch[2].trim();
      const dayNum = parseInt(activityMatch[3]);

      if (dayNum > 0 && dayNum <= itineraries.length) {
        const day = itineraries[dayNum - 1];
        day.items.push({ time, title, type: 'activity' });
        await day.save();
        return res.json({
          reply: `Done! I have scheduled **"${title}"** at **${time}** on **Day ${dayNum}** of your itinerary. 🗓️`,
          action: 'add_activity',
          data: day
        });
      } else {
        return res.json({
          reply: `I couldn't find **Day ${dayNum}** in your itinerary. Currently, you have **${itineraries.length}** days. You can add a day first in the Itinerary tab.`
        });
      }
    }

    // 3. INTENT: Query Budget Status
    if (/budget|spent|money|expense|cost|remaining|balance/i.test(queryText)) {
      const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalBudget = activeTrip.totalBudget || 25000;
      const remaining = totalBudget - totalSpent;
      const percent = Math.min((totalSpent / totalBudget) * 100, 100).toFixed(1);
      return res.json({
        reply: `Here is your current budget status for your trip to **${activeTrip.destination}**:\n\n` +
               `- **Total Budget**: ₹${totalBudget.toLocaleString()}\n` +
               `- **Total Spent**: ₹${totalSpent.toLocaleString()} (${percent}% spent)\n` +
               `- **Remaining Balance**: **₹${remaining.toLocaleString()}**\n\n` +
               (remaining < 0 ? `⚠️ You are over budget by ₹${Math.abs(remaining).toLocaleString()}!` : `👍 You are well within your budget. Keep it up!`)
      });
    }

    // 4. INTENT: Query Itinerary Schedule
    if (/itinerary|schedule|plan|activities|agenda|days/i.test(queryText)) {
      if (itineraries.length === 0) {
        return res.json({
          reply: `Your itinerary for **${activeTrip.destination}** is currently empty. You can add days and activities to build it! 📝`
        });
      }
      let itineraryText = `Here is your itinerary for **${activeTrip.destination}**:\n\n`;
      itineraries.forEach((day, index) => {
        itineraryText += `🗓️ **Day ${index + 1}: ${day.dayTitle}**\n`;
        if (day.items.length === 0) {
          itineraryText += `  *(No activities planned)*\n`;
        } else {
          day.items.forEach(item => {
            let emoji = '📍';
            if (item.type === 'lodging') emoji = '🏨';
            if (item.type === 'food') emoji = '🍽️';
            if (item.type === 'transport') emoji = '🚗';
            itineraryText += `  - **${item.time}**: ${emoji} ${item.title}\n`;
          });
        }
        itineraryText += `\n`;
      });
      return res.json({ reply: itineraryText });
    }

    // 5. INTENT: Recommendations/Tips
    if (/tip|recommend|suggest|what\s+to|where\s+to|food|beach|attraction/i.test(queryText)) {
      const destLower = activeTrip.destination.toLowerCase();
      if (destLower.includes('goa')) {
        return res.json({
          reply: `Here are some recommendations for your **Goa** trip:\n\n` +
                 `- **Beaches**: For party & water sports, head to Calangute or Baga. For calm & sunsets, Palolem or Mandrem are top picks.\n` +
                 `- **Food**: Try local Goan Fish Curry, Bebinca, and visit Martin's Corner in South Goa.\n` +
                 `- **Transport**: Renting a scooter (₹300-₹500/day) is highly recommended for exploring winding roads.\n` +
                 `- **Tips**: Visit Fort Aguada around 4:00 PM for beautiful photographs without excessive heat.`
        });
      } else if (destLower.includes('jaipur')) {
        return res.json({
          reply: `Here are some tips for your **Jaipur** trip:\n\n` +
                 `- **Sightseeing**: Explore Amer Fort, Hawa Mahal (Palace of Winds), and the royal City Palace.\n` +
                 `- **Shopping**: Johari Bazaar is great for silver jewellery, and Bapu Bazaar is perfect for ethnic clothing.\n` +
                 `- **Food**: Try local Dal Baati Churma and sweet Mawa Kachori at Rawat Mishtan Bhandar.\n` +
                 `- **Tips**: Get the Composite Ticket which saves entry fees across Amer Fort, Hawa Mahal, and Albert Hall.`
        });
      } else if (destLower.includes('munnar')) {
        return res.json({
          reply: `Here are some recommendations for your **Munnar** trip:\n\n` +
                 `- **Tea Gardens**: Visit Lockhart Tea Museum or take a walking tour in Kolukkumalai (highest tea estate).\n` +
                 `- **Nature**: Trek up to Anamudi Peak (highest in South India) or visit Lakkam Waterfalls.\n` +
                 `- **Food**: Savour Kerala-style appam with stew and local banana fritters.\n` +
                 `- **Tips**: Carry a light jacket or sweater as Munnar can get chilly in the evenings and mornings.`
        });
      } else if (destLower.includes('ladakh') || destLower.includes('leh')) {
        return res.json({
          reply: `Here are some vital tips for your **Leh Ladakh** adventure:\n\n` +
                 `- **Acclimatization**: Spend your first 48 hours resting in Leh. Do not travel immediately to higher passes.\n` +
                 `- **Places**: Visit Pangong Tso Lake (changes colors!), Nubra Valley, and Khardung La pass.\n` +
                 `- **Transport**: Renting a Royal Enfield or hiring a local 4x4 taxi is standard.\n` +
                 `- **Tips**: Keep warm clothing handy and carry cash as network and ATM availability are limited in remote areas.`
        });
      }
    }

    // 6. FALLBACK / HELP GREETING
    return res.json({
      reply: `Hello! I am your **WanderSmart AI Assistant** for your trip to **${activeTrip.destination}**. 🤖✈️\n\n` +
             `You can ask me questions about your trip, or request actions! Try typing:\n` +
             `- *"What is my budget?"* (to see expenses breakdown)\n` +
             `- *"Show my itinerary"* (to see your days & activities)\n` +
             `- *"Add expense Flight Booking 5000"* (to add an expense)\n` +
             `- *"Add activity Parasailing at 10:00 AM on day 1"* (to add an activity)\n` +
             `- *"Give me tips for Goa"* (to get local recommendations)`
    });

  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Server error during chat response' });
  }
});

if (!process.env.VERCEL) {
  app.listen(5001, '0.0.0.0', () => console.log('🚀 Server at 5001'));
}

module.exports = app;
