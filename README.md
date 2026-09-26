# 🌍 WanderSmart - Smart Travel Planner

WanderSmart is a premium, glassmorphic travel planning web application designed to help travelers curate custom itineraries, manage vacation budgets, explore destinations on an interactive map, and interact with a context-aware AI Travel Agent. 

Built with a modern full-stack architecture (**React, Vite, Node.js, Express, and MongoDB**), the application is fully optimized with beautiful glassmorphic dark-mode aesthetics, micro-animations, and a zero-configuration database setup.

---

## 🌟 Core Features

### 1. 🗺️ Interactive Travel Map
- **Live Vector Mapping**: Centered on India (powered by Leaflet.js and OpenStreetMap), allowing users to pan, zoom, and explore travel hotspots.
- **Dynamic Planning Pins**: Interactive pins for destinations (Goa, Jaipur, Munnar, Leh Ladakh). Clicking **Plan Itinerary** inside a pin's popup dynamically initializes a custom trip setup.

### 2. 🤖 Context-Aware AI Travel Agent
- **Floating Chat Panel**: A glassmorphic overlay assistant widget powered by a backend NLP parser.
- **Trip Sync Action Triggers**:
  - **Check Budget**: Ask *"What is my remaining budget?"* to get an instant breakdown of expenses in Rupees.
  - **Schedule Activities**: Type *"Add activity Parasailing at 10:00 AM on day 1"* to dynamically update your timeline.
  - **Log Spending**: Type *"Add expense Dinner 1200"* to automatically log expenses.
  - **Local Recommendations**: Ask *"Give me tips for Munnar"* for climate, sightseeing, and dining suggestions.
- **Event Bus Syncing**: Database additions made by the AI Chatbot trigger real-time UI state re-renders across the Itinerary and Budget tabs without reloading the page.

### 3. ⚙️ Dynamic Onboarding & Setup
- **Planning Inputs**: When starting a trip, WanderSmart prompts for **Trip Duration (1-15 days)**, **Budget Style** (Backpacker, Mid-range, Luxury), and **Total Budget (₹)**.
- **Intelligent Seeding**:
  - Automatically generates the exact number of days chosen, pre-populating Day 1 (Arrival) and Day N (Departure) with contextual activities.
  - Seeds starter expenses (flights, lodging) scaled to the selected budget style (e.g. higher costs for Luxury, lower costs for Backpacker).

### 4. 🔒 Multi-User JWT Authentication
- **Secure Sessions**: Full signup, login, and token persistence using `bcryptjs` password hashing and `jsonwebtoken` session tokens.
- **Route Protection**: Exploration views are public, but planning features (itineraries, budgets, and community chat) are restricted until signed in.
- **Acclimatization Seeds**: Spins up a pre-seeded account (`traveler@example.com` / `password`) on boot pre-loaded with a Goa beach holiday to get you exploring instantly.

---

## 🛠️ Technology Stack

### Frontend (Client)
- **Core Library**: React 18
- **Build System**: Vite (provides HMR compilation in <200ms)
- **Styling**: Vanilla CSS (glassmorphism parameters, HSL-tailored variables, Outfit & Playfair Display typography)
- **Icons**: Lucide React
- **Maps**: Leaflet.js & OpenStreetMap CDN

### Backend (Server)
- **Runtime**: Node.js & Express
- **Database**: Mongoose (MongoDB ODM)
- **Development Database**: `mongodb-memory-server` (spins up a local self-contained database in memory automatically—**zero local MongoDB installation required**)
- **Authentication**: JWT & BcryptJS
- **Process Manager**: Nodemon

---

## 🚀 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.0.0 or higher)
- [npm](https://www.npmjs.com/)

### 1. Run the Backend Server
Navigate to the server directory, install dependencies, and start the development server:
```bash
cd server
npm install
npm run dev
```
*Note: The server will spin up an in-memory MongoDB database and auto-seed with destinations, reviews, and a default traveler account on port `5001`.*

### 2. Run the React Client
Open a new terminal window, navigate to the client directory, install dependencies, and start the Vite dev server:
```bash
cd client
npm install
npm start
```
*Note: Open **http://localhost:5173/** in your browser to view the application. Vite proxies requests matching `/api/*` to the backend on port `5001`.*

---

## 📝 Seeded Test Credentials
To test the features immediately without registering a new user:
- **Email**: `traveler@example.com`
- **Password**: `password`
- **Seeded Data**: Goa, India (4-day itinerary, ₹25,000 budget, and initial expenses).
