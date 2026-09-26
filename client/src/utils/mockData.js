export const destinations = [
  {
    id: 'd1',
    name: 'Kyoto, Japan',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop',
    rating: 4.8,
    tags: ['Culture', 'Temples', 'Spring'],
    priceLevel: '$$$',
    description: 'Experience the magic of ancient temples, bamboo forests, and traditional tea houses.'
  },
  {
    id: 'd2',
    name: 'Santorini, Greece',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac542?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    tags: ['Romance', 'Beaches', 'Views'],
    priceLevel: '$$$$',
    description: 'Breathtaking sunsets and iconic white-washed architecture overlooking the Aegean Sea.'
  },
  {
    id: 'd3',
    name: 'Bali, Indonesia',
    image: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop',
    rating: 4.7,
    tags: ['Nature', 'Relaxation', 'Culture'],
    priceLevel: '$$',
    description: 'Lush jungles, vibrant coral reefs, and a deeply spiritual local culture await.'
  },
  {
    id: 'd4',
    name: 'Banff National Park, Canada',
    image: 'https://images.unsplash.com/photo-1522896582496-e2a14e9154a1?q=80&w=800&auto=format&fit=crop',
    rating: 4.9,
    tags: ['Mountains', 'Adventure', 'Lakes'],
    priceLevel: '$$$',
    description: 'Stunning turquoise lakes framed by majestic mountain peaks.'
  }
];

export const publicReviews = [
  {
    id: 'r1',
    user: 'Alex T.',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    destination: 'Kyoto, Japan',
    text: 'Visiting the Fushimi Inari Shrine early in the morning was the best decision. Avoided the crowds and got amazing photos!',
    likes: 24,
    date: '2 weeks ago'
  },
  {
    id: 'r2',
    user: 'Sarah M.',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    destination: 'Santorini, Greece',
    text: 'Book restaurants in Oia for sunset well in advance. They fill up months before summer!',
    likes: 56,
    date: '1 month ago'
  },
  {
    id: 'r3',
    user: 'David K.',
    avatar: 'https://randomuser.me/api/portraits/men/86.jpg',
    destination: 'Bali, Indonesia',
    text: 'Ubud is great, but don’t miss out on exploring the northern parts of the island for a more authentic vibe.',
    likes: 18,
    date: '3 weeks ago'
  }
];

export const initialItinerary = [
  {
    id: 'day1',
    day: 'Day 1: Arrival & Exploration',
    items: [
      { time: '10:00 AM', title: 'Check-in to Hotel', type: 'lodging' },
      { time: '1:00 PM', title: 'Lunch at Local Market', type: 'food' },
      { time: '3:30 PM', title: 'City Walking Tour', type: 'activity' },
    ]
  },
  {
    id: 'day2',
    day: 'Day 2: Main Attractions',
    items: [
      { time: '09:00 AM', title: 'Museum Visit', type: 'activity' },
      { time: '01:00 PM', title: 'Scenic Lunch', type: 'food' },
      { time: '04:00 PM', title: 'Sunset Viewpoint', type: 'activity' },
    ]
  }
];

export const initialExpenses = [
  { id: '1', title: 'Flights', category: 'Transport', amount: 850, date: '2023-11-01' },
  { id: '2', title: 'Hotel Deposit', category: 'Accommodation', amount: 400, date: '2023-11-05' },
  { id: '3', title: 'Museum Tickets', category: 'Activities', amount: 45, date: '2023-11-10' },
];
