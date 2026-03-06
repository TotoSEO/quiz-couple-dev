import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SearchRequest {
  lat: number;
  lng: number;
  radius: number; // metres
  activityTypes?: string[];
  intensity?: string;
  ambiance?: string;
  duration?: string;
  environment?: string;
  setting?: string;
  novelty?: string;
  budget?: string;
  groupSize?: string;
  groupComposition?: string;
  childrenAge?: string;
  lang?: string;
}

interface Activity {
  id: number;
  name: string;
  lat: number;
  lng: number;
  distance: number;
  category: string;
  subcategory: string;
  score: number;
  priceRange: [number, number];
  priceClass: string;
  address: string;
  phone: string | null;
  website: string | null;
  openingHours: string | null;
  indoor: boolean | null;
  confidence: number;
}

type GroupSize = "solo" | "couple" | "small" | "large";

// ---------------------------------------------------------------------------
// OSM tag mapping per activity category
// Each tag is "key=value". Tags may appear in multiple categories — the
// categoriseElement function resolves conflicts by preferring the user's
// selected categories.
// ---------------------------------------------------------------------------

const OSM_TAG_MAP: Record<string, string[]> = {
  culture: [
    // Tourism & Heritage
    "tourism=museum",
    "tourism=gallery",
    "tourism=artwork",
    "tourism=attraction",
    "tourism=information",
    // Historic
    "historic=monument",
    "historic=castle",
    "historic=manor",
    "historic=memorial",
    "historic=ruins",
    "historic=archaeological_site",
    "historic=fort",
    "historic=church",
    "historic=building",
    "historic=city_gate",
    "historic=tower",
    "historic=wayside_cross",
    "historic=wayside_shrine",
    // Amenities
    "amenity=place_of_worship",
    "amenity=library",
    "amenity=theatre",
    "amenity=cinema",
    "amenity=planetarium",
    "amenity=community_centre",
    "amenity=conference_centre",
    "amenity=fountain",
    "amenity=townhall",
    // Man-made landmarks
    "man_made=lighthouse",
    "man_made=tower",
  ],
  nature: [
    // Leisure areas
    "leisure=park",
    "leisure=garden",
    "leisure=dog_park",
    "leisure=nature_reserve",
    "leisure=bird_hide",
    "leisure=fishing",
    "leisure=recreation_ground",
    "leisure=playground",
    "leisure=wildlife_hide",
    // Land use
    "landuse=forest",
    "landuse=vineyard",
    "landuse=orchard",
    // Natural features
    "natural=wood",
    "natural=water",
    "natural=beach",
    "natural=peak",
    "natural=cave_entrance",
    "natural=hot_spring",
    "natural=spring",
    "natural=wetland",
    "natural=cliff",
    // Tourism
    "tourism=viewpoint",
    "tourism=picnic_site",
    "tourism=camp_site",
    "tourism=wilderness_hut",
    // Water
    "waterway=waterfall",
  ],
  sport: [
    // Leisure facilities
    "leisure=swimming_pool",
    "leisure=sports_centre",
    "leisure=ice_rink",
    "leisure=golf_course",
    "leisure=fitness_centre",
    "leisure=stadium",
    "leisure=horse_riding",
    "leisure=pitch",
    "leisure=track",
    "leisure=swimming_area",
    "leisure=skatepark",
    // Rental
    "amenity=boat_rental",
    "amenity=bicycle_rental",
    "amenity=public_bath",
    // Individual sports caught by regex query in buildOverpassQuery
  ],
  divertissement: [
    "leisure=escape_game",
    "tourism=theme_park",
    "leisure=water_park",
    "tourism=zoo",
    "tourism=aquarium",
    "leisure=amusement_arcade",
    "leisure=trampoline_park",
    "leisure=bowling_alley",
    "leisure=miniature_golf",
    "leisure=adult_gaming_centre",
    "leisure=dance",
    "amenity=nightclub",
    "amenity=bar",
    "amenity=pub",
    "amenity=casino",
    "amenity=events_venue",
    "shop=games",
  ],
  bienEtre: [
    "leisure=spa",
    "leisure=sauna",
    "leisure=turkish_bath",
    "amenity=spa",
    "shop=massage",
    "shop=beauty",
    "shop=perfumery",
    "shop=herbalist",
    "amenity=public_bath",
    "leisure=fitness_centre",
  ],
  gastronomie: [
    "amenity=restaurant",
    "amenity=cafe",
    "amenity=fast_food",
    "amenity=ice_cream",
    "amenity=marketplace",
    "amenity=biergarten",
    "amenity=food_court",
    "shop=wine",
    "shop=tea",
    "shop=chocolate",
    "shop=pastry",
    "shop=bakery",
    "shop=deli",
    "shop=cheese",
    "shop=coffee",
    "shop=organic",
    "shop=confectionery",
    "shop=beverages",
    "shop=health_food",
    "craft=winery",
    "craft=brewery",
    "craft=distillery",
  ],
  ateliers: [
    "amenity=arts_centre",
    "amenity=cooking_school",
    "amenity=studio",
    "tourism=gallery",
    "leisure=hackerspace",
    "shop=farm",
    "shop=craft",
    "shop=art",
    "shop=fabric",
    "craft=pottery",
    "craft=painter",
    "craft=sculptor",
    "craft=photographer",
    "craft=florist",
    "craft=jeweller",
    "craft=carpenter",
    "craft=beekeeper",
    "craft=glassblower",
    "craft=leather",
    "craft=bookbinder",
    "craft=soap",
  ],
};

// Regex patterns for broad sport queries (used in buildOverpassQuery)
const SPORT_REGEX =
  "tennis|badminton|basketball|volleyball|handball|football|soccer|rugby|" +
  "padel|squash|table_tennis|archery|fencing|gymnastics|boxing|martial_arts|judo|karate|" +
  "athletics|running|cycling|mountain_biking|bmx|motocross|" +
  "karting|paintball|laser_tag|" +
  "paragliding|free_flying|hang_gliding|" +
  "climbing|climbing_adventure|bouldering|" +
  "swimming|diving|water_polo|rowing|rafting|canoeing|" +
  "kayak|canoe|sailing|surfing|kitesurfing|windsurfing|scuba_diving|" +
  "skateboard|roller_skating|ice_skating|ice_hockey|curling|" +
  "equestrian|horse_racing|polo|" +
  "golf|disc_golf|" +
  "skiing|snowboard|cross_country_skiing|" +
  "trampoline|yoga|pilates|" +
  "cricket|baseball|softball|" +
  "petanque|boules|" +
  "orienteering|triathlon";

// ---------------------------------------------------------------------------
// Group compatibility matrix  [activityKey][groupSize] → score 0–1
// ---------------------------------------------------------------------------

const GROUP_MATRIX: Record<string, Record<GroupSize, number>> = {
  museum: { solo: 1.0, couple: 1.0, small: 0.8, large: 0.6 },
  cinema: { solo: 0.9, couple: 1.0, small: 0.8, large: 0.5 },
  escape_game: { solo: 0.2, couple: 0.7, small: 1.0, large: 0.6 },
  bowling: { solo: 0.4, couple: 0.8, small: 1.0, large: 1.0 },
  hiking: { solo: 0.9, couple: 1.0, small: 1.0, large: 0.7 },
  theme_park: { solo: 0.5, couple: 0.9, small: 1.0, large: 1.0 },
  laser_tag: { solo: 0.2, couple: 0.5, small: 1.0, large: 1.0 },
  spa: { solo: 0.8, couple: 1.0, small: 0.6, large: 0.2 },
  restaurant: { solo: 0.7, couple: 1.0, small: 1.0, large: 0.7 },
  karting: { solo: 0.3, couple: 0.7, small: 1.0, large: 0.9 },
  paintball: { solo: 0.1, couple: 0.4, small: 0.9, large: 1.0 },
  bar: { solo: 0.5, couple: 0.9, small: 1.0, large: 0.8 },
  ice_cream: { solo: 0.9, couple: 1.0, small: 1.0, large: 0.8 },
  kayak: { solo: 0.6, couple: 1.0, small: 0.8, large: 0.4 },
  swimming: { solo: 0.8, couple: 0.9, small: 1.0, large: 0.7 },
  playground: { solo: 0.3, couple: 0.7, small: 1.0, large: 1.0 },
  default: { solo: 0.5, couple: 0.8, small: 0.8, large: 0.7 },
};

// ---------------------------------------------------------------------------
// Price estimation per category  [min, max] in €
// ---------------------------------------------------------------------------

const PRICE_MAP: Record<string, [number, number]> = {
  culture: [0, 15],
  nature: [0, 0],
  sport: [5, 30],
  divertissement: [10, 40],
  bienEtre: [20, 80],
  gastronomie: [10, 50],
  ateliers: [15, 50],
};

// More granular price overrides per subcategory
const PRICE_SUBCATEGORY: Record<string, [number, number]> = {
  // Free or nearly free
  park: [0, 0], garden: [0, 0], dog_park: [0, 0], forest: [0, 0],
  beach: [0, 0], viewpoint: [0, 0], picnic_site: [0, 0], nature_reserve: [0, 0],
  recreation_ground: [0, 0], playground: [0, 0], spring: [0, 0], wetland: [0, 0],
  peak: [0, 0], cliff: [0, 0], waterfall: [0, 0], wildlife_hide: [0, 0],
  wood: [0, 0], water: [0, 0], vineyard: [0, 0], orchard: [0, 0],
  fountain: [0, 0], attraction: [0, 15], information: [0, 0],
  library: [0, 0], place_of_worship: [0, 0], memorial: [0, 0],
  artwork: [0, 0], bird_hide: [0, 0], skatepark: [0, 0],
  monument: [0, 0], city_gate: [0, 0], wayside_cross: [0, 0], wayside_shrine: [0, 0],
  lighthouse: [0, 5], tower: [0, 5], townhall: [0, 0],
  camp_site: [5, 20], wilderness_hut: [0, 15],
  // Cheap
  cafe: [2, 8], bakery: [2, 6], pastry: [2, 8], ice_cream: [2, 6],
  fast_food: [5, 15], pub: [5, 15], bar: [5, 15],
  marketplace: [0, 10], biergarten: [5, 15],
  confectionery: [2, 10], beverages: [2, 10], health_food: [3, 15],
  coffee: [2, 8], organic: [3, 15], tea: [3, 10],
  bicycle_rental: [5, 15], boat_rental: [10, 25],
  // Moderate
  cinema: [8, 14], museum: [5, 15], castle: [5, 15],
  swimming_pool: [3, 10], miniature_golf: [5, 12],
  bowling_alley: [8, 18], ice_rink: [8, 15],
  community_centre: [0, 10], conference_centre: [0, 20],
  amusement_arcade: [5, 20], adult_gaming_centre: [10, 25],
  pitch: [0, 15], track: [0, 10], stadium: [10, 30],
  golf_course: [15, 50], horse_riding: [15, 40],
  fitness_centre: [5, 15], sports_centre: [5, 20],
  perfumery: [10, 40], herbalist: [5, 20],
  // Expensive
  escape_game: [20, 35], spa: [25, 80], sauna: [15, 40],
  turkish_bath: [15, 40], theme_park: [25, 55],
  water_park: [15, 40], zoo: [10, 25], aquarium: [10, 25],
  trampoline_park: [10, 20],
  restaurant: [15, 50], winery: [10, 30], brewery: [8, 20], distillery: [10, 25],
  nightclub: [10, 30], casino: [20, 100], events_venue: [10, 50],
  theatre: [15, 50], planetarium: [8, 15],
  arts_centre: [5, 20], cooking_school: [30, 80], studio: [15, 40],
};

// ---------------------------------------------------------------------------
// Indoor / outdoor mapping per subcategory
// ---------------------------------------------------------------------------

const INDOOR_MAP: Record<string, boolean | null> = {
  // culture
  museum: true, gallery: true, artwork: false, attraction: null,
  information: true, monument: null, castle: null, manor: true,
  memorial: false, ruins: false, archaeological_site: false, fort: null,
  church: true, building: true, city_gate: false, tower: null,
  wayside_cross: false, wayside_shrine: false,
  place_of_worship: true, library: true, theatre: true, cinema: true,
  planetarium: true, community_centre: true, conference_centre: true,
  fountain: false, townhall: true, lighthouse: null,
  // nature
  park: false, garden: false, dog_park: false, forest: false, wood: false,
  water: false, beach: false, peak: false, cave_entrance: null, hot_spring: false,
  viewpoint: false, picnic_site: false, nature_reserve: false, bird_hide: false,
  fishing: false, waterfall: false, spring: false, wetland: false,
  cliff: false, vineyard: false, orchard: false,
  recreation_ground: false, playground: false, camp_site: false,
  wilderness_hut: true, wildlife_hide: false,
  // sport
  swimming_pool: null, sports_centre: true, ice_rink: true,
  golf_course: false, fitness_centre: true, stadium: false,
  horse_riding: false, pitch: false, track: false, swimming_area: false,
  skatepark: false, boat_rental: false, bicycle_rental: false,
  public_bath: true,
  // divertissement
  escape_game: true, theme_park: false, water_park: null, zoo: false,
  aquarium: true, amusement_arcade: true, trampoline_park: true,
  bowling_alley: true, miniature_golf: false, adult_gaming_centre: true,
  nightclub: true, bar: true, pub: true, casino: true, dance: true,
  events_venue: true, games: true,
  // bienEtre
  spa: true, sauna: true, turkish_bath: true, massage: true,
  beauty: true, perfumery: true, herbalist: true,
  // gastronomie
  restaurant: true, cafe: true, fast_food: true, ice_cream: null,
  marketplace: null, biergarten: false, food_court: true,
  wine: true, tea: true, chocolate: true, pastry: true, bakery: true,
  deli: true, cheese: true, coffee: true, organic: true,
  confectionery: true, beverages: true, health_food: true,
  winery: true, brewery: true, distillery: true,
  // ateliers
  arts_centre: true, pottery: true, painter: true, sculptor: true,
  photographer: true, florist: true, jeweller: true,
  carpenter: true, beekeeper: false, glassblower: true,
  leather: true, bookbinder: true, soap: true,
  farm: false, hackerspace: true, cooking_school: true, craft: true, art: true,
  studio: true, fabric: true,
};

// Subcategories that are dangerous/unsuitable at night (for schedule scoring)
const OUTDOOR_NIGHT_PENALTY = new Set([
  "forest", "wood", "peak", "nature_reserve", "waterfall", "cliff",
  "beach", "viewpoint", "fishing", "spring", "wetland", "vineyard", "orchard",
  "swimming_area", "boat_rental",
  "hot_spring", "dog_park", "bird_hide", "picnic_site", "wildlife_hide",
  "recreation_ground", "playground", "camp_site", "skatepark",
  "golf_course", "horse_riding", "pitch", "track",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Haversine distance in km */
function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Map an OSM element to { category, subcategory }.
 * When preferCategories are provided (user's selected types),
 * those categories are checked FIRST to avoid cross-category conflicts.
 */
function categoriseElement(
  tags: Record<string, string>,
  preferCategories?: string[]
): { category: string; subcategory: string } {
  // Build an ordered list of categories: preferred first, then the rest
  const orderedCategories: string[] = [];
  if (preferCategories?.length) {
    for (const cat of preferCategories) {
      if (OSM_TAG_MAP[cat]) orderedCategories.push(cat);
    }
  }
  for (const cat of Object.keys(OSM_TAG_MAP)) {
    if (!orderedCategories.includes(cat)) orderedCategories.push(cat);
  }

  // Check tags against the ordered list
  for (const category of orderedCategories) {
    const tagList = OSM_TAG_MAP[category];
    for (const tagStr of tagList) {
      const [key, value] = tagStr.split("=");
      if (tags[key] === value) {
        return { category, subcategory: value };
      }
    }
  }

  // Check sport=* tag for sport category
  if (tags["sport"]) {
    // Sport facilities default to sport category, unless bienEtre/divertissement preferred
    const sportVal = tags["sport"];
    if (preferCategories?.includes("bienEtre") && ["yoga", "pilates"].includes(sportVal)) {
      return { category: "bienEtre", subcategory: sportVal };
    }
    if (preferCategories?.includes("divertissement") && ["trampoline", "laser_tag", "bowling"].includes(sportVal)) {
      return { category: "divertissement", subcategory: sportVal };
    }
    return { category: "sport", subcategory: sportVal };
  }

  // Fallback
  return { category: "culture", subcategory: "monument" };
}

/** Determine group size bucket */
function getGroupSize(groupSize?: string): GroupSize {
  if (!groupSize) return "couple";
  const n = parseInt(groupSize, 10);
  if (isNaN(n) || n <= 1) {
    if (groupSize === "solo") return "solo";
    if (groupSize === "couple") return "couple";
    if (groupSize === "small") return "small";
    if (groupSize === "large") return "large";
    return "couple";
  }
  if (n <= 1) return "solo";
  if (n <= 2) return "couple";
  if (n <= 6) return "small";
  return "large";
}

/** Get group compatibility score for a given subcategory + group size */
function getGroupScore(subcategory: string, size: GroupSize): number {
  const keyMap: Record<string, string> = {
    museum: "museum", gallery: "museum", library: "museum", planetarium: "museum",
    cinema: "cinema", theatre: "cinema",
    escape_game: "escape_game",
    bowling_alley: "bowling",
    park: "hiking", garden: "hiking", forest: "hiking", wood: "hiking",
    nature_reserve: "hiking", viewpoint: "hiking", beach: "hiking",
    peak: "hiking", picnic_site: "hiking", dog_park: "hiking",
    recreation_ground: "hiking", playground: "playground", spring: "hiking",
    wetland: "hiking", camp_site: "hiking", waterfall: "hiking",
    cliff: "hiking", vineyard: "hiking", orchard: "hiking",
    wildlife_hide: "hiking", wilderness_hut: "hiking",
    skatepark: "karting", skateboard: "karting",
    theme_park: "theme_park", water_park: "theme_park", zoo: "theme_park",
    aquarium: "theme_park", trampoline_park: "theme_park",
    amusement_arcade: "theme_park", adult_gaming_centre: "theme_park",
    spa: "spa", public_bath: "spa", sauna: "spa", turkish_bath: "spa",
    massage: "spa", yoga: "spa", beauty: "spa", perfumery: "spa",
    restaurant: "restaurant", cafe: "restaurant", fast_food: "restaurant",
    marketplace: "restaurant", wine: "restaurant", winery: "restaurant",
    brewery: "restaurant", biergarten: "restaurant", bakery: "restaurant",
    ice_cream: "ice_cream",
    bar: "bar", pub: "bar", nightclub: "bar", casino: "bar",
    kayak: "kayak", canoe: "kayak", sailing: "kayak", boat_rental: "kayak",
    swimming_pool: "swimming", swimming_area: "swimming",
    karting: "karting", paintball: "paintball", laser_tag: "laser_tag",
    sports_centre: "default", fitness_centre: "default",
    pitch: "default", track: "default", stadium: "default",
  };

  const matrixKey = keyMap[subcategory] || "default";
  return (GROUP_MATRIX[matrixKey] || GROUP_MATRIX.default)[size];
}

/** Estimate a price class label from price range */
function priceClass(range: [number, number]): string {
  const avg = (range[0] + range[1]) / 2;
  if (avg === 0) return "gratuit";
  if (avg <= 10) return "economique";
  if (avg <= 25) return "modere";
  if (avg <= 50) return "cher";
  return "premium";
}

/**
 * Build Overpass QL query from selected activity types.
 * Groups tags by OSM key into regex patterns for efficiency:
 *   nwr["amenity"~"^(restaurant|cafe|fast_food)$"] instead of 3 separate statements.
 * This reduces statement count by ~7x and avoids Overpass timeouts on large radii.
 */
function buildOverpassQuery(
  lat: number,
  lng: number,
  radius: number,
  activityTypes?: string[]
): string {
  const types = activityTypes?.length ? activityTypes : Object.keys(OSM_TAG_MAP);

  // Group all tag values by their OSM key (e.g. "amenity" → ["restaurant","cafe",...])
  const keyGroups: Record<string, Set<string>> = {};

  for (const type of types) {
    const tags = OSM_TAG_MAP[type];
    if (!tags) continue;

    for (const tagStr of tags) {
      const [key, value] = tagStr.split("=");
      if (!keyGroups[key]) keyGroups[key] = new Set();
      keyGroups[key].add(value);
    }
  }

  const around = `around:${radius},${lat},${lng}`;
  const statements: string[] = [];

  // Emit one regex statement per OSM key
  for (const [key, values] of Object.entries(keyGroups)) {
    const valArr = Array.from(values);
    if (valArr.length === 1) {
      statements.push(`nwr["${key}"="${valArr[0]}"](${around});`);
    } else {
      statements.push(`nwr["${key}"~"^(${valArr.join("|")})$"](${around});`);
    }
  }

  // Broad sport=* regex query: catches ALL sport types in one statement
  if (types.includes("sport")) {
    statements.push(
      `nwr["sport"~"^(${SPORT_REGEX})$",i](${around});`
    );
  }

  // Broad historic=* for culture: catch any named historic feature
  if (types.includes("culture")) {
    statements.push(
      `nwr["historic"]["name"](${around});`
    );
  }

  // Broad craft=* for ateliers (only if not already covered by keyGroups)
  if (types.includes("ateliers")) {
    statements.push(
      `nwr["craft"]["name"](${around});`
    );
  }

  // Adapt timeout to query complexity: more statements or larger radius → more time
  const timeout = Math.min(60, Math.max(25, statements.length * 3 + Math.ceil(radius / 5000) * 5));

  return `[out:json][timeout:${timeout}];\n(\n${statements.join("\n")}\n);\nout center body qt 800;`;
}

/** Check if a POI is a duplicate (same name + same category within 100m) */
function isDuplicate(
  poi: { name: string; category: string; lat: number; lng: number },
  existing: { name: string; category: string; lat: number; lng: number }[]
): boolean {
  return existing.some(
    (e) =>
      e.name.toLowerCase() === poi.name.toLowerCase() &&
      e.category === poi.category &&
      haversine(poi.lat, poi.lng, e.lat, e.lng) < 0.1
  );
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

function computeScore(
  activity: {
    category: string;
    subcategory: string;
    distance: number;
    indoor: boolean | null;
    priceRange: [number, number];
    openingHours: string | null;
  },
  params: {
    radius: number;
    activityTypes?: string[];
    budget?: string;
    groupSize: GroupSize;
  }
): number {
  // ---- Adaptive weights ----
  let wType = 35;
  let wDistance = 30;
  let wBudget = 15;
  let wSchedule = 15;
  let wGroup = 5;

  if (params.budget && params.budget !== "indifferent") {
    wBudget = 20;
  }
  const currentHour = new Date().getUTCHours();
  if (currentHour > 20) {
    wSchedule = 20;
  }

  // ---- score_type ----
  let scoreType = 0.5;
  if (params.activityTypes?.length) {
    scoreType = params.activityTypes.includes(activity.category) ? 1.0 : 0.3;
  }

  // ---- score_distance ----
  const radiusKm = params.radius / 1000;
  let scoreDistance = Math.max(0, 1 - activity.distance / radiusKm);
  if (activity.distance <= radiusKm * 0.2) {
    scoreDistance = Math.min(scoreDistance * 1.2, 1.0);
  }

  // ---- score_budget ----
  let scoreBudget = 1.0;
  if (params.budget && params.budget !== "indifferent") {
    const budgetLimits: Record<string, number> = {
      gratuit: 0, free: 0,
      economique: 10, small: 10,
      modere: 25, medium: 25,
      cher: 50, comfortable: 50,
      premium: 100,
    };
    const limit = budgetLimits[params.budget] ?? 100;
    const avgPrice = (activity.priceRange[0] + activity.priceRange[1]) / 2;
    if (avgPrice <= limit) {
      scoreBudget = 1.0;
    } else {
      const overRatio = (avgPrice - limit) / Math.max(limit, 1);
      scoreBudget = overRatio < 0.3 ? 0.5 : 0.0;
    }
  }

  // ---- score_schedule ----
  let scoreSchedule = 0.6;
  if (activity.openingHours) {
    scoreSchedule = 0.8;
  }
  if (currentHour >= 21 || currentHour < 6) {
    const isIndoor = INDOOR_MAP[activity.subcategory];
    if (isIndoor === false) {
      scoreSchedule = Math.min(scoreSchedule, 0.2);
    } else if (isIndoor === true) {
      scoreSchedule = Math.min(scoreSchedule + 0.2, 1.0);
    }
    if (OUTDOOR_NIGHT_PENALTY.has(activity.subcategory)) {
      scoreSchedule = 0.0;
    }
  } else if (currentHour >= 6 && currentHour < 9) {
    if (["cafe", "bakery", "pastry"].includes(activity.subcategory)) {
      scoreSchedule = 1.0;
    } else if (["theme_park", "water_park", "escape_game", "nightclub", "bar", "casino"].includes(activity.subcategory)) {
      scoreSchedule = 0.1;
    }
  } else if (currentHour >= 18 && currentHour < 21) {
    if (["restaurant", "bar", "pub", "cinema", "nightclub", "biergarten", "theatre"].includes(activity.subcategory)) {
      scoreSchedule = 1.0;
    }
  }

  // ---- score_group ----
  const scoreGroup = getGroupScore(activity.subcategory, params.groupSize);

  // ---- Final weighted score ----
  const totalWeight = wType + wDistance + wBudget + wSchedule + wGroup;
  const raw =
    (wType * scoreType +
      wDistance * scoreDistance +
      wBudget * scoreBudget +
      wSchedule * scoreSchedule +
      wGroup * scoreGroup) /
    totalWeight;

  return Math.round(raw * 100);
}

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per edge function instance)
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 10;
const DAILY_LIMIT_MAX = 100;
const DAILY_WINDOW = 86_400_000;

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const dailyLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  if (rateLimitMap.size > 10000) {
    for (const [k, v] of rateLimitMap) {
      if (v.resetAt < now) rateLimitMap.delete(k);
    }
  }
  if (dailyLimitMap.size > 10000) {
    for (const [k, v] of dailyLimitMap) {
      if (v.resetAt < now) dailyLimitMap.delete(k);
    }
  }

  const entry = rateLimitMap.get(ip);
  if (entry && entry.resetAt > now) {
    if (entry.count >= RATE_LIMIT_MAX) {
      return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
    }
    entry.count++;
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  }

  const daily = dailyLimitMap.get(ip);
  if (daily && daily.resetAt > now) {
    if (daily.count >= DAILY_LIMIT_MAX) {
      return { allowed: false, retryAfter: Math.ceil((daily.resetAt - now) / 1000) };
    }
    daily.count++;
  } else {
    dailyLimitMap.set(ip, { count: 1, resetAt: now + DAILY_WINDOW });
  }

  return { allowed: true };
}

// Valid enum values for input sanitization
const VALID_STRINGS = new Set([
  "indifferent", "sedentaire", "modere", "sportif", "extreme",
  "calme", "fun", "culturel", "adrenaline", "romantique", "familial",
  "1h", "2h", "halfday", "fullday",
  "indoor", "outdoor", "mixed",
  "nature", "urban",
  "classic", "discovery", "unusual",
  "free", "small", "medium", "comfortable", "premium",
  "solo", "couple", "small", "medium", "large",
  "adults", "family", "teens", "friends", "team",
  "0-3", "3-6", "6-12", "12-16",
]);

const VALID_CATEGORIES = new Set([
  "culture", "nature", "sport", "divertissement", "bienEtre", "gastronomie", "ateliers"
]);

function sanitizeString(val: unknown): string | undefined {
  if (typeof val !== "string") return undefined;
  const clean = val.trim().slice(0, 50);
  if (VALID_STRINGS.has(clean)) return clean;
  return undefined;
}

function sanitizeCategories(val: unknown): string[] | undefined {
  if (!Array.isArray(val)) return undefined;
  return val
    .filter((v): v is string => typeof v === "string" && VALID_CATEGORIES.has(v))
    .slice(0, 7);
}

// ---------------------------------------------------------------------------
// Overpass API with fallback
// ---------------------------------------------------------------------------

const OVERPASS_URLS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

async function fetchOverpass(query: string): Promise<{ elements: any[]; failed?: boolean }> {
  const body = `data=${encodeURIComponent(query)}`;

  for (const url of OVERPASS_URLS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 45_000); // 45s hard timeout per server
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        return await res.json();
      }
      console.error(`Overpass ${url} returned ${res.status}`);
    } catch (err) {
      console.error(`Overpass ${url} error:`, err);
    }
  }

  return { elements: [], failed: true };
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- Rate limiting ----
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Rate limited. Please wait before retrying.", retryAfter: rateCheck.retryAfter }),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Retry-After": String(rateCheck.retryAfter || 60),
          },
        }
      );
    }

    // ---- Parse & validate input ----
    let rawBody: string;
    try {
      rawBody = await req.text();
      if (rawBody.length > 5000) {
        return new Response(
          JSON.stringify({ error: "Request body too large" }),
          { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: SearchRequest = JSON.parse(rawBody);
    const { lat, lng, radius } = body;

    if (lat == null || lng == null || radius == null) {
      return new Response(
        JSON.stringify({ error: "lat, lng and radius are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      typeof radius !== "number" ||
      !isFinite(lat) || !isFinite(lng) || !isFinite(radius)
    ) {
      return new Response(
        JSON.stringify({ error: "lat, lng and radius must be valid numbers" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return new Response(
        JSON.stringify({ error: "Invalid coordinates" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (radius <= 0 || radius > 50000) {
      return new Response(
        JSON.stringify({ error: "radius must be between 1 and 50000 metres" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Sanitize optional string inputs
    body.activityTypes = sanitizeCategories(body.activityTypes);
    body.intensity = sanitizeString(body.intensity);
    body.duration = sanitizeString(body.duration);
    body.environment = sanitizeString(body.environment);
    body.setting = sanitizeString(body.setting);
    body.novelty = sanitizeString(body.novelty);
    body.budget = sanitizeString(body.budget);
    body.groupSize = sanitizeString(body.groupSize);
    body.groupComposition = sanitizeString(body.groupComposition);
    body.childrenAge = sanitizeString(body.childrenAge);
    if (typeof body.lang === "string") {
      body.lang = body.lang.slice(0, 5).replace(/[^a-z]/gi, "");
    }

    // ---- Track activity validation (fire-and-forget) ----
    const sbUrl = Deno.env.get("SUPABASE_URL");
    const sbServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (sbUrl && sbServiceKey) {
      fetch(`${sbUrl}/rest/v1/activity_validations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": sbServiceKey,
          "Authorization": `Bearer ${sbServiceKey}`,
        },
        body: JSON.stringify({ ip_address: ip }),
      }).catch(() => {/* ignore tracking errors */});
    }

    // ---- Fetch Overpass data (with progressive fallback) ----
    let overpassData: { elements: any[]; failed?: boolean };
    let actualRadius = radius;

    // Try full radius first, then halve on failure (max 2 retries)
    for (let attempt = 0; attempt < 3; attempt++) {
      const overpassQuery = buildOverpassQuery(
        lat,
        lng,
        actualRadius,
        body.activityTypes
      );

      overpassData = await fetchOverpass(overpassQuery);

      if (!overpassData.failed) break;

      // Reduce radius by half for next attempt
      if (attempt < 2) {
        console.log(`Overpass failed at ${actualRadius}m, retrying at ${Math.round(actualRadius / 2)}m`);
        actualRadius = Math.round(actualRadius / 2);
      }
    }

    const overpassFailed = !!overpassData!.failed;
    const radiusReduced = actualRadius < radius;

    // ---- Process Overpass results ----
    const elements: any[] = overpassData!.elements || [];
    const groupSize = getGroupSize(body.groupSize);
    const selectedCategories = body.activityTypes;

    const seenPois: {
      name: string;
      category: string;
      lat: number;
      lng: number;
    }[] = [];
    const activities: Activity[] = [];
    let idCounter = 1;

    for (const el of elements) {
      const tags = el.tags || {};

      // Filter out unnamed POIs
      if (!tags.name) continue;

      // Get coordinates (ways/relations use center)
      const elLat: number = el.lat ?? el.center?.lat;
      const elLng: number = el.lon ?? el.center?.lon;
      if (elLat == null || elLng == null) continue;

      // Categorise — pass selected categories so they're checked first
      const { category, subcategory } = categoriseElement(tags, selectedCategories);

      // Deduplicate
      const poiRef = { name: tags.name, category, lat: elLat, lng: elLng };
      if (isDuplicate(poiRef, seenPois)) continue;
      seenPois.push(poiRef);

      // Distance
      const distance = haversine(lat, lng, elLat, elLng);

      // Price (use subcategory-specific price if available, else category)
      const priceRange: [number, number] = PRICE_SUBCATEGORY[subcategory] || PRICE_MAP[category] || [0, 20];
      const priceClassLabel = priceClass(priceRange);

      // Indoor
      const indoor = INDOOR_MAP[subcategory] ?? null;

      // Address construction from OSM tags
      const addressParts: string[] = [];
      if (tags["addr:housenumber"]) addressParts.push(tags["addr:housenumber"]);
      if (tags["addr:street"]) addressParts.push(tags["addr:street"]);
      if (tags["addr:postcode"]) addressParts.push(tags["addr:postcode"]);
      if (tags["addr:city"]) addressParts.push(tags["addr:city"]);
      const address = addressParts.join(", ") || tags["addr:full"] || "";

      // Confidence based on tag completeness
      let confidence = 0.5;
      if (tags.name) confidence += 0.1;
      if (tags["addr:street"]) confidence += 0.1;
      if (tags.opening_hours) confidence += 0.1;
      if (tags.phone || tags["contact:phone"]) confidence += 0.1;
      if (tags.website || tags["contact:website"]) confidence += 0.1;

      const act: Activity = {
        id: idCounter++,
        name: tags.name,
        lat: elLat,
        lng: elLng,
        distance,
        category,
        subcategory,
        score: 0,
        priceRange,
        priceClass: priceClassLabel,
        address,
        phone: tags.phone || tags["contact:phone"] || null,
        website: tags.website || tags["contact:website"] || null,
        openingHours: tags.opening_hours || null,
        indoor,
        confidence,
      };

      // Compute score
      act.score = computeScore(
        {
          category: act.category,
          subcategory: act.subcategory,
          distance: act.distance,
          indoor: act.indoor,
          priceRange: act.priceRange,
          openingHours: act.openingHours,
        },
        {
          radius,
          activityTypes: body.activityTypes,
          budget: body.budget,
          groupSize,
        }
      );

      activities.push(act);
    }

    // ---- Sort by score descending ----
    activities.sort((a, b) => b.score - a.score);

    // ---- Diversify: max 3 of same subcategory in top 10 ----
    const diversified: Activity[] = [];
    const subCounts: Record<string, number> = {};

    for (const act of activities) {
      if (diversified.length >= 10) {
        diversified.push(act);
        continue;
      }

      const count = subCounts[act.subcategory] || 0;
      if (count >= 3) {
        continue;
      }

      diversified.push(act);
      subCounts[act.subcategory] = count + 1;
    }

    // ---- Expansion suggestion ----
    const expanded = diversified.length < 5;
    const suggestedRadius = expanded
      ? Math.min(radius * 2, 50000)
      : null;

    // ---- Build response ----
    const response = {
      activities: diversified,
      meta: {
        total: diversified.length,
        expanded,
        suggestedRadius,
        overpassFailed,
        radiusReduced,
        actualRadius: radiusReduced ? actualRadius : undefined,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("search-activities error:", err);

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
