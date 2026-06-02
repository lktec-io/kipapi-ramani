// Prices are in TZS (Tanzanian Shilling) — architectural plan purchase price
const PH = 'https://placehold.co'

export const mockPlans = [
  {
    id: 1,
    title: 'Villa Serena',
    description:
      'A prestige 4-bedroom modern villa with an open-plan kitchen-lounge, master en-suite with walk-in wardrobe, double garage, and expansive veranda. Ideal for corner plots.',
    price: 1_400_000,
    bedrooms: 4,
    bathrooms: 3,
    stories: 2,
    plot_size: '20m × 25m',
    style: 'Modern',
    thumbnail_url: `${PH}/600x450/1a3c5e/e8a020?text=Villa+Serena`,
    featured: true,
  },
  {
    id: 2,
    title: 'Nyumba Ndoto',
    description:
      'A practical 3-bedroom single-storey bungalow designed for ease of maintenance. Features an enclosed kitchen garden, spacious lounge and natural ventilation throughout.',
    price: 680_000,
    bedrooms: 3,
    bathrooms: 2,
    stories: 1,
    plot_size: '15m × 20m',
    style: 'Contemporary',
    thumbnail_url: `${PH}/600x450/34495e/ffffff?text=Nyumba+Ndoto`,
    featured: true,
  },
  {
    id: 3,
    title: 'Bungalow Amani',
    description:
      'A timeless 3-bedroom traditional bungalow with covered veranda, colonial arches, and a courtyard. Built for comfort in warm climates with deep overhanging eaves.',
    price: 520_000,
    bedrooms: 3,
    bathrooms: 2,
    stories: 1,
    plot_size: '14m × 18m',
    style: 'Traditional',
    thumbnail_url: `${PH}/600x450/5d4037/ffd54f?text=Bungalow+Amani`,
    featured: true,
  },
  {
    id: 4,
    title: 'Jumba la Lux',
    description:
      'An executive 5-bedroom double-storey mansion with a roof terrace, swimming pool allowance, cinema room, staff quarters, and a 3-car garage. The pinnacle of modern living.',
    price: 2_200_000,
    bedrooms: 5,
    bathrooms: 4,
    stories: 2,
    plot_size: '25m × 30m',
    style: 'Modern',
    thumbnail_url: `${PH}/600x450/0d2139/e8a020?text=Jumba+la+Lux`,
    featured: false,
  },
  {
    id: 5,
    title: 'Nakshi Compact',
    description:
      'A smart 2-bedroom starter home with an efficient floor plan, open lounge-dining, compact fitted kitchen, and a covered parking bay — perfect for young families or rental.',
    price: 350_000,
    bedrooms: 2,
    bathrooms: 1,
    stories: 1,
    plot_size: '10m × 15m',
    style: 'Contemporary',
    thumbnail_url: `${PH}/600x450/37474f/80deea?text=Nakshi+Compact`,
    featured: false,
  },
  {
    id: 6,
    title: 'Palazzo Classic',
    description:
      'A grand 4-bedroom traditional double-storey with symmetrical façade, wrap-around balcony, formal dining room, study, and decorative mouldings. Timeless elegance.',
    price: 1_750_000,
    bedrooms: 4,
    bathrooms: 3,
    stories: 2,
    plot_size: '22m × 28m',
    style: 'Traditional',
    thumbnail_url: `${PH}/600x450/4e342e/ffcc80?text=Palazzo+Classic`,
    featured: false,
  },
  {
    id: 7,
    title: 'Nyumba ya Bahari',
    description:
      'A contemporary 3-bedroom coastal home with panoramic window walls, breeze-block screens, roof garden, and a fully tiled open terrace facing the garden. Light-filled throughout.',
    price: 890_000,
    bedrooms: 3,
    bathrooms: 2,
    stories: 1,
    plot_size: '18m × 22m',
    style: 'Modern',
    thumbnail_url: `${PH}/600x450/006064/b2ebf2?text=Nyumba+ya+Bahari`,
    featured: false,
  },
  {
    id: 8,
    title: 'Duplex Imara',
    description:
      'An income-generating 4-bedroom duplex with two self-contained 2-bedroom units on separate floors. Separate entrances, meters, and laundry — ideal for owner-occupier rental.',
    price: 1_100_000,
    bedrooms: 4,
    bathrooms: 4,
    stories: 2,
    plot_size: '15m × 22m',
    style: 'Contemporary',
    thumbnail_url: `${PH}/600x450/283593/9fa8da?text=Duplex+Imara`,
    featured: false,
  },
]

export const STYLES    = ['Modern', 'Contemporary', 'Traditional']
export const BEDROOMS  = [1, 2, 3, 4, 5]
export const MAX_PRICE = 2_500_000
export const MIN_PRICE = 0
