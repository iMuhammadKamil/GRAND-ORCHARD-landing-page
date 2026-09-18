/**
 * GRAND ORCHARD — official project data.
 *
 * SOURCING RULE: every value below comes from the officially published
 * Grand Orchard (Premier Choice International) information supplied by the
 * project owner. Nothing here is invented; where a fact is unknown the
 * copy says "Contact our team for details."
 */

export const PROJECT = {
  name: "Grand Orchard",
  developer: "Premier Choice International",
  tagline: "A Premium Address for Modern Vertical Living",
  status: "Under Construction",
  area: "1,000,000 SQ.FT",
  type: "Commercial & Residential",
  location: "DHA Orchard, DHA Phase I, Islamabad",
  commercial: "4 Commercial Floors",
  structure: "4 Basement Parking Floors + G + 18 Floors",
  address: "Grand Orchard, Main Link Road, Phase Sector B DHA, Islamabad",
  boulevard: "Orchard Boulevard, DHA, Islamabad",
} as const;

/**
 * Official Premier Choice International contact channel for Grand Orchard,
 * as provided by the project owner. The WhatsApp deep link is built once at
 * module scope (deterministic — identical on server and client).
 */
export const CONTACT = {
  phoneDisplay: "+92 301 123 3333",
  phoneHref: "tel:+923011233333",
  whatsappUrl: `https://wa.me/923011233333?text=${encodeURIComponent(
    "Hello, I would like more information about Grand Orchard."
  )}`,
} as const;

export const HERO_STATS = [
  { value: "1,000,000", unit: "SQ.FT", label: "Project Area" },
  { value: "4", unit: "", label: "Commercial Floors" },
  { value: "G + 18", unit: "", label: "Structure" },
] as const;

export const DESCRIPTION_PARAGRAPHS = [
  "Grand Orchard is centrally located at the newest commercial hub of the Twin Cities. The project sits at Orchard Boulevard, DHA, Islamabad — approximately a one-minute drive from GT Road and Fauji Foundation — placing daily retail, dining and business within immediate reach.",
  "The development brings together commercial floors and residences in a single composition, featuring open-plan apartments with terrace views. Grand Orchard focuses on modern vertical living with aspects of high-tech green living throughout the project.",
] as const;

export const FACTS = [
  { term: "Status", value: "Under Construction" },
  { term: "Area", value: "1,000,000 SQ.FT" },
  { term: "Type", value: "Commercial & Residential" },
  { term: "Location", value: "DHA Orchard, DHA Phase I, Islamabad" },
  { term: "Commercial", value: "4 Commercial Floors" },
  { term: "Structure", value: "4 Basement Parking Floors + G + 18 Floors" },
] as const;

export type Amenity = {
  title: string;
  description: string;
  icon: string;
  /**
   * Existing on-site visual for this amenity. Only set where a matching
   * asset exists; these renders are explicitly labelled "Indicative Visual"
   * wherever they appear, so nothing is presented as an official photograph.
   */
  image?: string;
};

export const AMENITIES: Amenity[] = [
  {
    title: "Mall",
    description: "Retail core within the development.",
    icon: "store",
  },
  {
    title: "4 Layered Security",
    description: "Security planned in four layers.",
    icon: "shield",
  },
  {
    title: "Foodcourt",
    description: "Dedicated foodcourt for the community.",
    icon: "foodcourt",
  },
  {
    title: "Card-Based Community",
    description: "Card-based access across the community.",
    icon: "card",
  },
  {
    title: "Supermarket",
    description: "Everyday grocery needs on site.",
    icon: "cart",
  },
  {
    title: "Tennis Court",
    description: "Tennis court for residents.",
    icon: "tennis",
  },
  {
    title: "Grade AAA Parkings",
    description: "Parking planned to a Grade AAA standard.",
    icon: "parking",
  },
  {
    title: "On-Demand Cleaning Services",
    description: "Cleaning services available on request.",
    icon: "cleaning",
  },
  {
    title: "Swimming Pool",
    description: "Swimming pool within the project.",
    icon: "pool",
    image: "/images/fac-1.png",
  },
  {
    title: "Ecological Approach",
    description: "High-tech green living principles.",
    icon: "leaf",
  },
  {
    title: "Restaurants and Cafes",
    description: "Dining and cafe options on site.",
    icon: "dining",
  },
  {
    title: "Gated Community",
    description: "Gated access to the community.",
    icon: "gate",
  },
  {
    title: "Fitness Center",
    description: "Fitness center for residents.",
    icon: "fitness",
    image: "/images/fac-2.png",
  },
];

export const UNITS = {
  apartment: { label: "Apartments", min: "516.23", max: "4,191.9" },
  commercial: { label: "Commercial Units", min: "88", max: "517" },
  views: ["Hill", "Valley", "River", "Pool"],
} as const;

export type PriceRow = {
  category: string;
  floor: string;
  price: string;
};

export const PRICING: PriceRow[] = [
  // Residential
  { category: "Furnished Apartments", floor: "—", price: "23,100" },
  { category: "Unfurnished Apartments", floor: "—", price: "18,700" },
  // Commercial Shops
  { category: "Commercial Shops", floor: "Ground Floor", price: "111,110" },
  { category: "Commercial Shops", floor: "First Floor", price: "94,450" },
  { category: "Commercial Shops", floor: "Second Floor", price: "83,350" },
  { category: "Commercial Shops", floor: "Third Floor", price: "75,000" },
  // Commercial Shops — Premium
  { category: "Commercial Shops — Premium", floor: "Ground", price: "122,250" },
  { category: "Commercial Shops — Premium", floor: "First", price: "102,250" },
  { category: "Commercial Shops — Premium", floor: "Second", price: "91,150" },
  // Commercial Shops — Premium+
  { category: "Commercial Shops — Premium+", floor: "First", price: "111,110" },
  { category: "Commercial Shops — Premium+", floor: "Second", price: "100,000" },
  // Kiosks
  { category: "Kiosks", floor: "Ground", price: "122,250" },
  { category: "Kiosks", floor: "First", price: "111,110" },
  { category: "Kiosks", floor: "Second", price: "100,000" },
];

export const PRICING_GROUPS = [
  {
    name: "Residential",
    note: "Apartments",
    rows: [
      { floor: "Furnished Apartments", price: "23,100" },
      { floor: "Unfurnished Apartments", price: "18,700" },
    ],
  },
  {
    name: "Commercial Shops",
    note: "Standard",
    rows: [
      { floor: "Ground Floor", price: "111,110" },
      { floor: "First Floor", price: "94,450" },
      { floor: "Second Floor", price: "83,350" },
      { floor: "Third Floor", price: "75,000" },
    ],
  },
  {
    name: "Commercial Shops",
    note: "Premium",
    rows: [
      { floor: "Ground", price: "122,250" },
      { floor: "First", price: "102,250" },
      { floor: "Second", price: "91,150" },
    ],
  },
  {
    name: "Commercial Shops",
    note: "Premium+",
    rows: [
      { floor: "First", price: "111,110" },
      { floor: "Second", price: "100,000" },
    ],
  },
  {
    name: "Kiosks",
    note: "",
    rows: [
      { floor: "Ground", price: "122,250" },
      { floor: "First", price: "111,110" },
      { floor: "Second", price: "100,000" },
    ],
  },
] as const;

export const NAV_LINKS = [
  { label: "Overview", href: "#overview" },
  { label: "Amenities", href: "#amenities" },
  { label: "Location", href: "#location" },
  { label: "Pricing", href: "#pricing" },
  { label: "Gallery", href: "#gallery" },
  { label: "FAQ", href: "#faq" },
] as const;

/**
 * FAQ — every answer restates only officially published Grand Orchard
 * information (Premier Choice International project page and its official
 * Grand Orchard FAQ). Where a fact is not published, the answer directs to
 * the team. Nothing generic or third-party is quoted.
 */
export const FAQS = [
  {
    q: "What is the status of Grand Orchard?",
    a: "Grand Orchard is officially listed as Under Construction. For the latest construction progress, contact our team for details.",
  },
  {
    q: "Where is Grand Orchard located?",
    a: "Grand Orchard is located at DHA Orchard, DHA Phase I, Islamabad — with its address at Main Link Road, Phase Sector B, DHA, Islamabad. It is approximately a one-minute drive from GT Road and Fauji Foundation, at the newest commercial hub of the Twin Cities.",
  },
  {
    q: "What is the total project area?",
    a: "The total project area is 1,000,000 SQ.FT.",
  },
  {
    q: "What type of project is Grand Orchard?",
    a: "Grand Orchard is a Commercial & Residential development.",
  },
  {
    q: "What is the structure of Grand Orchard?",
    a: "The structure comprises 4 Basement Parking Floors + G + 18 Floors.",
  },
  {
    q: "How many commercial floors are there?",
    a: "Grand Orchard includes 4 Commercial Floors.",
  },
  {
    q: "What are the apartment sizes?",
    a: "Apartments range from 516.23 sq.ft to 4,191.9 sq.ft, as officially listed for Grand Orchard. Availability changes over time — contact our team for current availability.",
  },
  {
    q: "What are the commercial unit sizes?",
    a: "Commercial units range from 88 sq.ft to 517 sq.ft. Availability changes over time — contact our team for current availability.",
  },
  {
    q: "What views do the apartments offer?",
    a: "Hill view, Valley view, River view, and Pool view are officially listed for Grand Orchard.",
  },
  {
    q: "What amenities are available?",
    a: "The officially announced amenities are: Mall, 4 Layered Security, Foodcourt, Card-based Community, Supermarket, Tennis Court, Grade AAA Parkings, On-Demand Cleaning Services, Swimming Pool, Ecological Approach, Restaurants and Cafes, Gated Community, and Fitness Center.",
  },
  {
    q: "What are the rates?",
    a: "The officially listed rates start from PKR 18,700 per sq.ft for unfurnished apartments and PKR 75,000 per sq.ft for commercial units. The complete list is published in the pricing section above.",
  },
  {
    q: "Is there a payment plan?",
    a: "We do not publish payment terms online. Contact our team for the latest payment plan, availability, and booking information.",
  },
  {
    q: "Is a hotel part of Grand Orchard?",
    a: "Hilton Garden Inn is scheduled to be located in Grand Orchard Tower A. For further details, contact our team.",
  },
] as const;

/** Map — real OpenStreetMap embed, marker at DHA Phase I, Islamabad. */
export const MAP = {
  lat: 33.5379,
  lon: 73.1013,
  bbox: "73.0613%2C33.5079%2C73.1413%2C33.5679",
  embedUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=73.0613%2C33.5079%2C73.1413%2C33.5679&layer=mapnik&marker=33.5379275%2C73.1013010",
  linkUrl: "https://www.openstreetmap.org/?mlat=33.5379275&mlon=73.1013010#map=14/33.5379/73.1013",
} as const;
