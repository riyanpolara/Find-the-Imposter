export type Difficulty = 'easy' | 'medium' | 'hard'
export type WordPack = 'mixed' | 'india' | 'classic'
export type WordOptions = { difficulty: Difficulty; wordPack: WordPack }
export type WordEntry = {
  word: string
  category: string
  difficulty: Difficulty
  pack: Exclude<WordPack, 'mixed'>
  aliases: string[]
}
export type WordCategory = { id: string; name: string; words: string[] }

export const DIFFICULTIES = [
  { id: 'easy', label: 'Easy', description: 'Familiar words. Easy to hint at.' },
  { id: 'medium', label: 'Medium', description: 'More specific words. Think before you speak.' },
  { id: 'hard', label: 'Hard', description: 'Regional names and trickier ideas. Know your crowd.' },
] as const
export const WORD_PACKS = [
  { id: 'mixed', label: 'Mixed', description: 'Indian favourites + everyday classics' },
  { id: 'india', label: 'Indian', description: 'Food, festivals, places and daily life' },
  { id: 'classic', label: 'Classic', description: 'Everyday words from around the world' },
] as const
export const DEFAULT_WORD_OPTIONS: WordOptions = { difficulty: 'easy', wordPack: 'mixed' }

/** Treat missing/unknown options from older saved games as safe defaults. */
export function resolveWordOptions(options: Partial<WordOptions> = {}): WordOptions {
  return {
    difficulty: DIFFICULTIES.some((item) => item.id === options.difficulty) ? options.difficulty! : 'easy',
    wordPack: WORD_PACKS.some((item) => item.id === options.wordPack) ? options.wordPack! : 'mixed',
  }
}

// Ratings are editorial, intended for mixed groups of friends in India.
// Each category contributes 15 words at each level. Sources: docs/word-bank.md.
const GROUPS: { id: string; name: string; pack: WordEntry['pack']; levels: Record<Difficulty, string> }[] = [
  { id: 'food', name: 'Food', pack: 'classic', levels: {
    easy: 'Pizza, Burger, Ice Cream, Chocolate, Popcorn, Sandwich, Noodles, Cheese, Honey, Banana, Apple, Cake, Milk, Coffee, Egg',
    medium: 'Pancake, Waffle, Doughnut, Sushi, Taco, Lasagna, Croissant, Omelette, Brownie, Marshmallow, Peanut Butter, Lemonade, Mushroom, Pumpkin, Coconut',
    hard: 'Sourdough, Tiramisu, Kimchi, Hummus, Risotto, Quinoa, Wasabi, Guacamole, Souffle, Truffle, Saffron, Nutmeg, Artichoke, Asparagus, Balsamic Vinegar',
  } },
  { id: 'everyday', name: 'Everyday Objects', pack: 'classic', levels: {
    easy: 'Umbrella, Mirror, Candle, Pillow, Clock, Toothbrush, Scissors, Balloon, Wallet, Broom, Bucket, Camera, Smartphone, Bicycle, Train',
    medium: 'Compass, Binoculars, Projector, Microphone, Thermometer, Fire Extinguisher, Escalator, Hammock, Submarine, Helicopter, Drone, Telescope, Stethoscope, Typewriter, Seat Belt',
    hard: 'Kaleidoscope, Metronome, Periscope, Sundial, Hourglass, Gyroscope, Anvil, Tuning Fork, Sextant, Geiger Counter, Seismograph, Barometer, Prism, Lockpick, Parachute',
  } },
  { id: 'nature', name: 'Animals & Nature', pack: 'classic', levels: {
    easy: 'Dog, Cat, Tiger, Elephant, Peacock, Monkey, Camel, Rabbit, Snake, Butterfly, Sun, Moon, Rain, Rainbow, Mountain',
    medium: 'Dolphin, Penguin, Octopus, Crocodile, Squirrel, Firefly, Flamingo, Chameleon, Jellyfish, Waterfall, Volcano, Glacier, Coral Reef, Cactus, Thunderstorm',
    hard: 'Platypus, Axolotl, Pangolin, Narwhal, Mantis, Kingfisher, Mangrove, Estuary, Aurora, Eclipse, Geyser, Mirage, Fossil, Quicksand, Bioluminescence',
  } },
  { id: 'places-ideas', name: 'Places & Activities', pack: 'classic', levels: {
    easy: 'School, Beach, Airport, Hospital, Library, Cinema, Garden, Zoo, Birthday, Football, Swimming, Dancing, Painting, Camping, Shopping',
    medium: 'Museum, Aquarium, Lighthouse, Observatory, Greenhouse, Escape Room, Roller Coaster, Archery, Fencing, Marathon, Pottery, Origami, Treasure Hunt, Magic Show, Rock Climbing',
    hard: 'Labyrinth, Planetarium, Archaeology, Camouflage, Hibernation, Metamorphosis, Time Capsule, Optical Illusion, Ventriloquism, Cryptography, Constellation, Time Travel, Deja Vu, Telepathy, Paradox',
  } },
  { id: 'indian-food', name: 'Indian Food', pack: 'india', levels: {
    easy: 'Samosa, Dosa, Idli, Biryani, Chai, Jalebi, Pani Puri, Roti, Paratha, Lassi, Gulab Jamun, Vada Pav, Pav Bhaji, Dal, Pakora',
    medium: 'Dhokla, Poha, Rajma, Chole Bhature, Aloo Tikki, Rasgulla, Kulfi, Kheer, Khichdi, Upma, Thepla, Modak, Butter Chicken, Filter Coffee, Momos',
    hard: 'Litti Chokha, Dal Baati Churma, Appam, Puttu, Ghewar, Undhiyu, Puran Poli, Mishti Doi, Rogan Josh, Pesarattu, Avial, Khandvi, Sandesh, Chhena Poda, Malpua',
  } },
  { id: 'indian-life', name: 'Indian Life & Games', pack: 'india', levels: {
    easy: 'Cricket, Carrom, Ludo, Kabaddi, Kite, Auto Rickshaw, Tiffin, Pressure Cooker, Saree, Kurta, Bindi, Bangles, Mehndi, Slippers, School Uniform',
    medium: 'Kho Kho, Gilli Danda, Lagori, Antakshari, Gully Cricket, Dabbawala, Dhaba, Chai Stall, Kirana Shop, Cycle Rickshaw, Local Train, Steel Thali, Dupatta, Turban, Charpai',
    hard: 'Pallankuzhi, Ganjifa, Kancha, Chaupar, Aadu Puli Aattam, Mallakhamb, Kalaripayattu, Silambam, Akhada, Jharokha, Matka, Kulhad, Sil Batta, Chakla Belan, Charkha',
  } },
  { id: 'indian-culture', name: 'Indian Festivals & Arts', pack: 'india', levels: {
    easy: 'Diwali, Holi, Raksha Bandhan, Eid, Christmas, Navratri, Dussehra, Ganesh Chaturthi, Rangoli, Diya, Bollywood, Dhol, Tabla, Wedding, Baraat',
    medium: 'Onam, Pongal, Baisakhi, Bihu, Lohri, Durga Puja, Janmashtami, Garba, Bhangra, Dandiya, Kathak, Bharatanatyam, Sitar, Shehnai, Kathputli',
    hard: 'Kathakali, Kuchipudi, Odissi, Mohiniyattam, Sattriya, Yakshagana, Chhau, Madhubani, Warli Painting, Chikankari, Pashmina, Bandhani, Kalamkari, Pattachitra, Bidriware',
  } },
  { id: 'indian-places', name: 'Indian Places', pack: 'india', levels: {
    easy: 'Taj Mahal, India Gate, Red Fort, Gateway of India, Qutub Minar, Golden Temple, Goa, Mumbai, Delhi, Jaipur, Kerala, Himalayas, Ganga, Thar Desert, Chennai',
    medium: 'Hawa Mahal, Charminar, Mysore Palace, Dal Lake, Howrah Bridge, Marine Drive, Rann of Kutch, Sundarbans, Kaziranga, Darjeeling, Varanasi, Ladakh, Hampi, Ajanta Caves, Konark Sun Temple',
    hard: 'Rani ki Vav, Dholavira, Sanchi Stupa, Bhimbetka, Fatehpur Sikri, Elephanta Caves, Ellora Caves, Jantar Mantar, Mahabalipuram, Pattadakal, Valley of Flowers, Loktak Lake, Living Root Bridge, Cellular Jail, Chand Baori',
  } },
]

/** Explicit spelling variants or equivalent names, never substring/fuzzy matching. */
const ALIASES: Record<string, string[]> = {
  'Ice Cream': ['Icecream'], Doughnut: ['Donut'], Omelette: ['Omelet'], Souffle: ['Soufflé'],
  'Deja Vu': ['Déjà Vu'], 'Pani Puri': ['Panipuri', 'Golgappa', 'Golgappe', 'Puchka', 'Phuchka'],
  Biryani: ['Biriyani'], Idli: ['Idly'], Chai: ['Tea'], Roti: ['Chapati', 'Chapatti'],
  Pakora: ['Pakoda'], 'Gulab Jamun': ['Gulabjamun'], 'Vada Pav': ['Vadapav'],
  'Chole Bhature': ['Chhole Bhature', 'Chole Bhatura'], Rasgulla: ['Rasgola', 'Rosogolla', 'Rosogulla'],
  Khichdi: ['Khichadi', 'Khichri'], 'Dal Baati Churma': ['Dal Bati Churma', 'Daal Baati Churma'],
  'Chhena Poda': ['Chena Poda'], 'Auto Rickshaw': ['Autorickshaw', 'Auto', 'Rickshaw'],
  Saree: ['Sari'], Mehndi: ['Mehendi', 'Henna'], 'Kho Kho': ['Kho-Kho'],
  'Gilli Danda': ['Gilli-Danda', 'Gulli Danda'], 'Steel Thali': ['Thali'],
  Lagori: ['Pitthu', 'Pithu', 'Pittu', 'Seven Stones'], Kancha: ['Marbles'],
  Kulhad: ['Kulhar'], Diwali: ['Deepavali', 'Dipavali'], Holi: ['Holi Festival'],
  'Raksha Bandhan': ['Rakhi', 'Rakshabandhan'], Dussehra: ['Dasara', 'Dusshera', 'Vijayadashami'],
  Baisakhi: ['Vaisakhi'], Bharatanatyam: ['Bharatnatyam', 'Bharata Natyam', 'Bharat Natyam'],
  Kathputli: ['Kathputali'], 'Qutub Minar': ['Qutb Minar', 'Qutubminar'],
  'Golden Temple': ['Harmandir Sahib'], Ganga: ['Ganges'], Varanasi: ['Banaras', 'Benares', 'Kashi'],
  'Rani ki Vav': ['Rani-ki-Vav'], 'Sanchi Stupa': ['Sanchi'],
  'Konark Sun Temple': ['Konark Temple'], Mahabalipuram: ['Mamallapuram'],
  'Mysore Palace': ['Mysuru Palace'], 'Rann of Kutch': ['Rann of Kachchh'],
}

export const WORD_BANK: WordEntry[] = GROUPS.flatMap((group) =>
  DIFFICULTIES.flatMap(({ id: difficulty }) => group.levels[difficulty].split(', ').map((word) => ({
    word, category: group.name, difficulty, pack: group.pack, aliases: ALIASES[word] ?? [],
  }))),
)

/** Aggregate view retained for category consumers and word-bank validation. */
export const WORD_CATEGORIES: WordCategory[] = GROUPS.map((group) => ({
  id: group.id, name: group.name, words: Object.values(group.levels).flatMap((list) => list.split(', ')),
}))

export function wordsFor(options: Partial<WordOptions> = {}): WordEntry[] {
  const { difficulty, wordPack } = resolveWordOptions(options)
  return WORD_BANK.filter((entry) => entry.difficulty === difficulty && (wordPack === 'mixed' || entry.pack === wordPack))
}
