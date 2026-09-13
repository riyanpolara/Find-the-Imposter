export type WordCategory = {
  id: string
  name: string
  words: string[]
}

/**
 * Local word database. Words are chosen to be cluable — concrete, widely known,
 * and rich enough that a Civilian can hint at them without naming them outright.
 *
 * Shaped as a plain array so a future backend can serve the same structure
 * without the game engine changing.
 */
export const WORD_CATEGORIES: WordCategory[] = [
  {
    id: 'food',
    name: 'Food',
    words: [
      'Pizza', 'Burger', 'Biryani', 'Pasta', 'Sushi', 'Pancake', 'Samosa',
      'Taco', 'Ice Cream', 'Chocolate', 'Popcorn', 'Noodles', 'Sandwich',
      'Doughnut', 'Omelette', 'Cheese', 'Honey', 'Curry',
    ],
  },
  {
    id: 'places',
    name: 'Places',
    words: [
      'Beach', 'Airport', 'Hospital', 'Library', 'Museum', 'Stadium', 'Desert',
      'Jungle', 'Volcano', 'Bakery', 'Prison', 'Casino', 'Cinema', 'Temple',
      'Farm', 'Hotel', 'Zoo', 'Island',
    ],
  },
  {
    id: 'animals',
    name: 'Animals',
    words: [
      'Elephant', 'Penguin', 'Dolphin', 'Tiger', 'Owl', 'Octopus', 'Kangaroo',
      'Snake', 'Camel', 'Peacock', 'Shark', 'Bat', 'Crocodile', 'Squirrel',
      'Horse', 'Spider', 'Whale', 'Rabbit',
    ],
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    words: [
      'Potato', 'Onion', 'Carrot', 'Pumpkin', 'Spinach', 'Broccoli', 'Garlic',
      'Cabbage', 'Chilli', 'Mushroom', 'Corn', 'Cucumber', 'Beetroot', 'Ginger',
      'Peas', 'Tomato',
    ],
  },
  {
    id: 'sports',
    name: 'Sports',
    words: [
      'Cricket', 'Football', 'Tennis', 'Boxing', 'Swimming', 'Chess', 'Golf',
      'Marathon', 'Surfing', 'Basketball', 'Archery', 'Skiing', 'Cycling',
      'Wrestling', 'Badminton', 'Gymnastics',
    ],
  },
  {
    id: 'movies',
    name: 'Movies',
    words: [
      'Titanic', 'Avatar', 'Jurassic Park', 'The Lion King', 'Frozen',
      'Inception', 'Jaws', 'Toy Story', 'The Matrix', 'Harry Potter',
      'Spider-Man', 'Finding Nemo', 'Rocky', 'Shrek', 'Interstellar',
    ],
  },
  {
    id: 'vehicles',
    name: 'Vehicles',
    words: [
      'Bicycle', 'Helicopter', 'Submarine', 'Tractor', 'Ambulance', 'Rickshaw',
      'Rocket', 'Train', 'Sailboat', 'Motorbike', 'Bulldozer', 'Hot Air Balloon',
      'Skateboard', 'Fire Truck', 'Ferry',
    ],
  },
  {
    id: 'technology',
    name: 'Technology',
    words: [
      'Smartphone', 'Headphones', 'Keyboard', 'Printer', 'Satellite', 'Wi-Fi',
      'Robot', 'Camera', 'Microwave', 'Password', 'Drone', 'Battery',
      'Bluetooth', 'Hard Drive', 'Projector',
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    words: [
      'Umbrella', 'Mirror', 'Candle', 'Ladder', 'Toothbrush', 'Scissors',
      'Suitcase', 'Balloon', 'Pillow', 'Clock', 'Wallet', 'Broom', 'Compass',
      'Bucket', 'Anchor', 'Kite',
    ],
  },
  {
    id: 'professions',
    name: 'Professions',
    words: [
      'Doctor', 'Teacher', 'Chef', 'Pilot', 'Firefighter', 'Farmer', 'Barber',
      'Magician', 'Lawyer', 'Astronaut', 'Plumber', 'Journalist', 'Detective',
      'Lifeguard', 'Photographer', 'Electrician',
    ],
  },
]
