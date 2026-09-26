const mongoose = require('mongoose');
const Destination = require('./models/Destination');
const Review = require('./models/Review');
const Expense = require('./models/Expense');
const ItineraryDay = require('./models/Itinerary');

const destinationsData = [
  {
    name: 'Goa, India',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    rating: 4.7,
    tags: ['Beaches', 'Nightlife', 'Seafood'],
    priceLevel: '₹₹',
    description: 'Unwind on beautiful sandy beaches, explore historic Portuguese churches, and relish delicious Konkani curries.'
  },
  {
    name: 'Jaipur, India',
    image: 'https://images.unsplash.com/photo-1477584322904-48618db530d2?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    tags: ['Culture', 'Forts', 'Heritage'],
    priceLevel: '₹₹',
    description: 'Step into history with majestic forts, opulent palaces, and bustling colorful bazaars of the Pink City.'
  },
  {
    name: 'Munnar, India',
    image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=800&auto=format&fit=crop',
    rating: 4.6,
    tags: ['Hill Station', 'Tea Gardens', 'Nature'],
    priceLevel: '₹',
    description: 'Breathe in the fresh mountain air amidst sprawling tea plantations, waterfalls, and mist-covered hills.'
  },
  {
    name: 'Leh Ladakh, India',
    image: 'https://images.unsplash.com/photo-1590050752117-238cb061295a?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    tags: ['Mountains', 'Adventure', 'Road Trip'],
    priceLevel: '₹₹₹',
    description: 'Embark on an adventure of a lifetime through rugged mountain passes, pristine blue lakes, and ancient Buddhist monasteries.'
  },
  {
    name: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    tags: ['Culture', 'Romance', 'Museums'],
    priceLevel: '₹₹₹',
    description: 'Marvel at the Eiffel Tower, stroll along the Seine, and explore masterpieces at the Louvre.'
  },
  {
    name: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    tags: ['Technology', 'Food', 'Culture'],
    priceLevel: '₹₹₹',
    description: 'Immerse yourself in neon-lit streets, historic shrines, and world-class sushi bars.'
  },
  {
    name: 'New York, USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=800&auto=format&fit=crop',
    rating: 4.7,
    tags: ['Shopping', 'Skyline', 'Broadway'],
    priceLevel: '₹₹₹₹',
    description: 'Experience the energy of Times Square, walk Central Park, and watch a Broadway show.'
  },
  {
    name: 'London, UK',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop',
    rating: 4.7,
    tags: ['History', 'Architecture', 'Museums'],
    priceLevel: '₹₹₹',
    description: 'See Big Ben, visit the historic Tower of London, and enjoy tea at royal palaces.'
  },
  {
    name: 'Rome, Italy',
    image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    tags: ['History', 'Colosseum', 'Gelato'],
    priceLevel: '₹₹',
    description: 'Walk back in time inside the Colosseum, marvel at the Vatican, and throw a coin in Trevi Fountain.'
  },
  {
    name: 'Sydney, Australia',
    image: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?q=80&w=800&auto=format&fit=crop',
    rating: 4.6,
    tags: ['Harbour', 'Beaches', 'Opera House'],
    priceLevel: '₹₹₹',
    description: 'Enjoy sunny harbor views, visit the iconic Sydney Opera House, and relax on Bondi Beach.'
  },
  {
    name: 'Dubai, UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    tags: ['Luxury', 'Skyline', 'Desert'],
    priceLevel: '₹₹₹₹',
    description: 'Ascend Burj Khalifa (tallest building), shop at massive malls, and take a desert safari.'
  },
  {
    name: 'Cairo, Egypt',
    image: 'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?q=80&w=800&auto=format&fit=crop',
    rating: 4.5,
    tags: ['Pyramids', 'History', 'Nile'],
    priceLevel: '₹',
    description: 'Stand before the ancient Great Pyramids of Giza, explore Cairo museums, and cruise the River Nile.'
  }
];

const reviewsData = [
  {
    user: 'Rajesh K.',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    destination: 'Goa, India',
    text: 'Renting a scooter is the best way to explore Goa. North Goa is great for party lovers, but South Goa beaches like Palolem are incredibly peaceful!',
    likes: 42,
    dateString: '3 days ago'
  },
  {
    user: 'Priya S.',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    destination: 'Jaipur, India',
    text: 'Visit Amer Fort early in the morning to avoid the sun and the crowds. Don\'t miss buying local bandhani sarees and eating traditional pyaaz kachori!',
    likes: 87,
    dateString: '1 week ago'
  },
  {
    user: 'Amit V.',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    destination: 'Leh Ladakh, India',
    text: 'Ensure you spend at least two days in Leh town for acclimatization before going to Pangong Lake. The altitude is no joke, but the views are out of this world!',
    likes: 115,
    dateString: '2 weeks ago'
  }
];

const itineraryData = [
  {
    dayTitle: 'Day 1: Arrival & Sunset at Baga',
    items: [
      { time: '02:00 PM', title: 'Check-in to Beach Resort', type: 'lodging' },
      { time: '04:30 PM', title: 'Sunset Walk at Baga Beach', type: 'activity' },
      { time: '08:00 PM', title: 'Seafood Dinner at Beach Shack', type: 'food' },
    ]
  },
  {
    dayTitle: 'Day 2: Forts & Water Sports',
    items: [
      { time: '09:30 AM', title: 'Water Sports at Calangute Beach', type: 'activity' },
      { time: '01:00 PM', title: 'Lunch at local Goan eatery', type: 'food' },
      { time: '03:30 PM', title: 'Explore Historic Fort Aguada', type: 'activity' },
      { time: '07:30 PM', title: 'Drive back and sunset drinks', type: 'transport' },
    ]
  }
];

const expensesData = [
  { title: 'Flight Bookings', category: 'Transport', amount: 6500, dateString: '2026-07-10' },
  { title: 'Resort Deposit', category: 'Accommodation', amount: 12000, dateString: '2026-07-11' },
  { title: 'Scooty Rental', category: 'Transport', amount: 800, dateString: '2026-07-12' },
  { title: 'Museum & Fort Fees', category: 'Activities', amount: 450, dateString: '2026-07-13' },
];

const runSeed = async () => {
  try {
    // Clear existing data
    await Destination.deleteMany({});
    await Review.deleteMany({});
    await ItineraryDay.deleteMany({});
    await Expense.deleteMany({});

    // Keep it fast/parallel where possible
    await Promise.all([
      Destination.insertMany(destinationsData),
      Review.insertMany(reviewsData),
      ItineraryDay.insertMany(itineraryData),
      Expense.insertMany(expensesData)
    ]);
    
    console.log('Database seeded successfully via seed.js!');
  } catch (err) {
    console.error('Error in seed.js:', err);
  }
};

module.exports = runSeed;

if (require.main === module) {
  const mongoose = require('mongoose');
  mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smartTravelPlanner', async () => {
    await runSeed();
    process.exit(0);
  });
}
