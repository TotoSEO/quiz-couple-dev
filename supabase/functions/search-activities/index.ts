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
  weatherCompat: number;
  confidence: number;
}

interface WeatherData {
  condition: string;
  temp: number;
  description: string;
  icon: string;
  isNight: boolean;
}

type WeatherCondition =
  | "soleil"
  | "nuageux"
  | "pluie_legere"
  | "pluie_forte"
  | "neige"
  | "canicule";

type ExposureType =
  | "interieur"
  | "exterieur_couvert"
  | "exterieur_decouvert"
  | "mixte"
  | "nature_randonnee"
  | "aquatique_exterieur";

type GroupSize = "solo" | "couple" | "small" | "large";

// ---------------------------------------------------------------------------
// OSM tag mapping per activity category
// ---------------------------------------------------------------------------

const OSM_TAG_MAP: Record<string, string[]> = {
  culture: [
    "tourism=museum",
    "tourism=gallery",
    "tourism=artwork",
    "historic=monument",
    "historic=castle",
    "historic=manor",
    "historic=memorial",
    "historic=ruins",
    "historic=archaeological_site",
    "historic=fort",
    "amenity=place_of_worship",
    "amenity=library",
    "amenity=theatre",
    "amenity=cinema",
    "amenity=planetarium",
    "amenity=community_centre",
    "amenity=conference_centre",
  ],
  nature: [
    "leisure=park",
    "leisure=garden",
    "leisure=dog_park",
    "landuse=forest",
    "natural=wood",
    "natural=water",
    "natural=beach",
    "natural=peak",
    "natural=cave_entrance",
    "natural=hot_spring",
    "tourism=viewpoint",
    "tourism=picnic_site",
    "leisure=nature_reserve",
    "leisure=bird_hide",
    "leisure=fishing",
    "waterway=waterfall",
    "natural=glacier",
    "route=hiking",
    "route=foot",
    "highway=path",
  ],
  sport: [
    "leisure=swimming_pool",
    "leisure=sports_centre",
    "leisure=ice_rink",
    "leisure=bowling_alley",
    "leisure=golf_course",
    "leisure=miniature_golf",
    "leisure=fitness_centre",
    "leisure=stadium",
    "leisure=horse_riding",
    "leisure=pitch",
    "leisure=track",
    "leisure=swimming_area",
    "sport=climbing",
    "sport=tennis",
    "sport=surfing",
    "sport=scuba_diving",
    "sport=kayak",
    "sport=canoe",
    "sport=sailing",
    "sport=skiing",
    "amenity=public_bath",
  ],
  divertissement: [
    "leisure=escape_game",
    "tourism=theme_park",
    "leisure=water_park",
    "tourism=zoo",
    "tourism=aquarium",
    "leisure=amusement_arcade",
    "leisure=trampoline_park",
    "amenity=nightclub",
    "amenity=bar",
    "amenity=pub",
    "amenity=casino",
    "leisure=dance",
    "amenity=events_venue",
    "shop=games",
  ],
  bienEtre: [
    "leisure=spa",
    "leisure=sauna",
    "amenity=public_bath",
    "shop=massage",
    "leisure=turkish_bath",
    "amenity=hot_spring",
    "sport=yoga",
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
    "craft=winery",
    "craft=brewery",
    "craft=distillery",
  ],
  ateliers: [
    "amenity=arts_centre",
    "craft=pottery",
    "craft=painter",
    "craft=sculptor",
    "craft=photographer",
    "shop=farm",
    "tourism=gallery",
    "leisure=hackerspace",
    "amenity=cooking_school",
    "shop=craft",
  ],
};

// Sport sub-tags (compound tags with sport=*)
const SPORT_SUB_TAGS: Record<string, string> = {
  climbing: "sport=climbing",
  karting: "sport=karting",
  climbing_adventure: "sport=climbing_adventure",
  laser_tag: "sport=laser_tag",
  paintball: "sport=paintball",
  sailing: "sport=sailing",
  trampoline: "sport=trampoline",
  yoga: "sport=yoga",
  tennis: "sport=tennis",
  surfing: "sport=surfing",
  scuba_diving: "sport=scuba_diving",
  kayak: "sport=kayak",
  canoe: "sport=canoe",
  skiing: "sport=skiing",
  horse_racing: "sport=horse_racing",
};

// ---------------------------------------------------------------------------
// Weather matrix  [exposure][condition] → score 0–1
// ---------------------------------------------------------------------------

const WEATHER_MATRIX: Record<ExposureType, Record<WeatherCondition, number>> = {
  interieur: {
    soleil: 0.7,
    nuageux: 0.8,
    pluie_legere: 1.0,
    pluie_forte: 1.0,
    neige: 1.0,
    canicule: 1.0,
  },
  exterieur_couvert: {
    soleil: 1.0,
    nuageux: 1.0,
    pluie_legere: 0.7,
    pluie_forte: 0.3,
    neige: 0.5,
    canicule: 0.7,
  },
  exterieur_decouvert: {
    soleil: 1.0,
    nuageux: 0.9,
    pluie_legere: 0.3,
    pluie_forte: 0.0,
    neige: 0.3,
    canicule: 0.4,
  },
  mixte: {
    soleil: 0.9,
    nuageux: 0.9,
    pluie_legere: 0.6,
    pluie_forte: 0.4,
    neige: 0.6,
    canicule: 0.7,
  },
  nature_randonnee: {
    soleil: 1.0,
    nuageux: 0.9,
    pluie_legere: 0.4,
    pluie_forte: 0.0,
    neige: 0.2,
    canicule: 0.3,
  },
  aquatique_exterieur: {
    soleil: 1.0,
    nuageux: 0.8,
    pluie_legere: 0.2,
    pluie_forte: 0.0,
    neige: 0.0,
    canicule: 0.9,
  },
};

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
  library: [0, 0], place_of_worship: [0, 0], memorial: [0, 0],
  artwork: [0, 0], bird_hide: [0, 0],
  // Cheap
  cafe: [2, 8], bakery: [2, 6], pastry: [2, 8], ice_cream: [2, 6],
  fast_food: [5, 15], pub: [5, 15], bar: [5, 15],
  marketplace: [0, 10], biergarten: [5, 15],
  // Moderate
  cinema: [8, 14], museum: [5, 15], castle: [5, 15],
  swimming_pool: [3, 10], miniature_golf: [5, 12],
  bowling_alley: [8, 18], ice_rink: [8, 15],
  // Expensive
  escape_game: [20, 35], spa: [25, 80], sauna: [15, 40],
  turkish_bath: [15, 40], theme_park: [25, 55],
  restaurant: [15, 50], winery: [10, 30],
};

// ---------------------------------------------------------------------------
// Indoor / outdoor mapping per subcategory
// ---------------------------------------------------------------------------

const INDOOR_MAP: Record<string, boolean | null> = {
  // culture
  museum: true, gallery: true, artwork: false, monument: null, castle: null, manor: true,
  memorial: false, ruins: false, archaeological_site: false, fort: null,
  place_of_worship: true, library: true, theatre: true, cinema: true,
  planetarium: true, community_centre: true, conference_centre: true,
  // nature
  park: false, garden: false, dog_park: false, forest: false, wood: false,
  water: false, beach: false, peak: false, cave_entrance: null, hot_spring: false,
  viewpoint: false, picnic_site: false, nature_reserve: false, bird_hide: false,
  fishing: false, waterfall: false, glacier: false,
  hiking: false, foot: false, path: false,
  // sport
  swimming_pool: null, sports_centre: true, ice_rink: true, bowling_alley: true,
  golf_course: false, miniature_golf: false, fitness_centre: true, stadium: false,
  horse_riding: false, pitch: false, track: false, swimming_area: false,
  climbing: null, tennis: false, surfing: false, scuba_diving: false,
  kayak: false, canoe: false, sailing: false, skiing: false,
  public_bath: true,
  // divertissement
  escape_game: true, theme_park: false, water_park: null, zoo: false,
  aquarium: true, amusement_arcade: true, trampoline_park: true,
  nightclub: true, bar: true, pub: true, casino: true, dance: true,
  events_venue: true, games: true,
  // bienEtre
  spa: true, sauna: true, turkish_bath: true, massage: true, yoga: true,
  // gastronomie
  restaurant: true, cafe: true, fast_food: true, ice_cream: null,
  marketplace: null, biergarten: false, food_court: true,
  wine: true, tea: true, chocolate: true, pastry: true, bakery: true,
  deli: true, cheese: true, winery: true, brewery: true, distillery: true,
  // ateliers
  arts_centre: true, pottery: true, painter: true, sculptor: true,
  photographer: true, farm: false, hackerspace: true, cooking_school: true, craft: true,
};

// ---------------------------------------------------------------------------
// Exposure type per subcategory (for weather scoring)
// ---------------------------------------------------------------------------

const EXPOSURE_MAP: Record<string, ExposureType> = {
  // culture
  museum: "interieur", gallery: "interieur", artwork: "exterieur_decouvert",
  monument: "mixte", castle: "mixte", manor: "interieur",
  memorial: "exterieur_decouvert", ruins: "exterieur_decouvert",
  archaeological_site: "exterieur_decouvert", fort: "mixte",
  place_of_worship: "interieur", library: "interieur",
  theatre: "interieur", cinema: "interieur",
  planetarium: "interieur", community_centre: "interieur", conference_centre: "interieur",
  // nature
  park: "exterieur_decouvert", garden: "exterieur_decouvert", dog_park: "exterieur_decouvert",
  forest: "nature_randonnee", wood: "nature_randonnee",
  water: "exterieur_decouvert", beach: "exterieur_decouvert",
  peak: "nature_randonnee", cave_entrance: "mixte", hot_spring: "aquatique_exterieur",
  viewpoint: "exterieur_decouvert", picnic_site: "exterieur_decouvert",
  nature_reserve: "nature_randonnee", bird_hide: "exterieur_couvert",
  fishing: "exterieur_decouvert", waterfall: "nature_randonnee", glacier: "nature_randonnee",
  hiking: "nature_randonnee", foot: "nature_randonnee", path: "nature_randonnee",
  // sport
  swimming_pool: "aquatique_exterieur", sports_centre: "interieur",
  ice_rink: "interieur", bowling_alley: "interieur",
  golf_course: "exterieur_decouvert", miniature_golf: "exterieur_decouvert",
  fitness_centre: "interieur", stadium: "exterieur_couvert",
  horse_riding: "exterieur_decouvert", pitch: "exterieur_decouvert",
  track: "exterieur_decouvert", swimming_area: "aquatique_exterieur",
  climbing: "mixte", tennis: "exterieur_decouvert",
  surfing: "aquatique_exterieur", scuba_diving: "aquatique_exterieur",
  kayak: "aquatique_exterieur", canoe: "aquatique_exterieur",
  sailing: "aquatique_exterieur", skiing: "exterieur_decouvert",
  public_bath: "interieur",
  // divertissement
  escape_game: "interieur", theme_park: "exterieur_couvert",
  water_park: "aquatique_exterieur", zoo: "exterieur_couvert",
  aquarium: "interieur", amusement_arcade: "interieur", trampoline_park: "interieur",
  nightclub: "interieur", bar: "interieur", pub: "interieur",
  casino: "interieur", dance: "interieur", events_venue: "interieur", games: "interieur",
  // bienEtre
  spa: "interieur", sauna: "interieur", turkish_bath: "interieur",
  massage: "interieur", yoga: "interieur",
  // gastronomie
  restaurant: "interieur", cafe: "interieur", fast_food: "interieur",
  ice_cream: "mixte", marketplace: "exterieur_couvert", biergarten: "exterieur_couvert",
  food_court: "interieur",
  wine: "interieur", tea: "interieur", chocolate: "interieur",
  pastry: "interieur", bakery: "interieur", deli: "interieur", cheese: "interieur",
  winery: "interieur", brewery: "interieur", distillery: "interieur",
  // ateliers
  arts_centre: "interieur", pottery: "interieur", painter: "interieur",
  sculptor: "interieur", photographer: "interieur",
  farm: "exterieur_decouvert", hackerspace: "interieur",
  cooking_school: "interieur", craft: "interieur",
};

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

/** Classify OpenWeatherMap response into our weather categories */
function classifyWeather(owm: any): {
  condition: WeatherCondition;
  temp: number;
  description: string;
  icon: string;
  isNight: boolean;
} {
  const id: number = owm.weather?.[0]?.id ?? 800;
  const temp: number = owm.main?.temp ?? 20;
  const description: string = owm.weather?.[0]?.description ?? "";
  const icon: string = owm.weather?.[0]?.icon ?? "01d";

  // Detect night from icon suffix ("n") or from sunrise/sunset timestamps
  const isNight = icon.endsWith("n") || (() => {
    const now = Math.floor(Date.now() / 1000);
    const sunrise = owm.sys?.sunrise;
    const sunset = owm.sys?.sunset;
    if (sunrise && sunset) return now < sunrise || now > sunset;
    return false;
  })();

  let condition: WeatherCondition;

  if (temp >= 38) {
    condition = "canicule";
  } else if (id >= 600 && id < 700) {
    condition = "neige";
  } else if (id >= 502 && id < 600) {
    condition = "pluie_forte";
  } else if (id >= 300 && id < 502) {
    condition = "pluie_legere";
  } else if (id >= 801) {
    condition = "nuageux";
  } else {
    // id=800 (clear sky) — at night, treat as "nuageux" (neutral)
    // to avoid showing "ensoleillé" when it's dark
    condition = isNight ? "nuageux" : "soleil";
  }

  return { condition, temp, description, icon, isNight };
}

/** Map an OSM element to { category, subcategory } */
function categoriseElement(tags: Record<string, string>): {
  category: string;
  subcategory: string;
} {
  // Try compound sport tags first
  if (tags["sport"]) {
    const sportVal = tags["sport"];
    if (["climbing", "climbing_adventure"].includes(sportVal))
      return { category: "sport", subcategory: "sports_centre" };
    if (sportVal === "karting")
      return { category: "sport", subcategory: "sports_centre" };
    if (sportVal === "laser_tag")
      return { category: "divertissement", subcategory: "sports_centre" };
    if (sportVal === "paintball")
      return { category: "sport", subcategory: "sports_centre" };
    if (sportVal === "sailing")
      return { category: "sport", subcategory: "sports_centre" };
    if (sportVal === "trampoline")
      return { category: "divertissement", subcategory: "sports_centre" };
    if (sportVal === "yoga")
      return { category: "bienEtre", subcategory: "sports_centre" };
  }

  // Iterate through each category and its tags
  for (const [category, tagList] of Object.entries(OSM_TAG_MAP)) {
    for (const tagStr of tagList) {
      const [key, value] = tagStr.split("=");
      if (tags[key] === value) {
        return { category, subcategory: value };
      }
    }
  }

  // Fallback
  return { category: "culture", subcategory: "monument" };
}

/** Determine group size bucket */
function getGroupSize(groupSize?: string): GroupSize {
  if (!groupSize) return "couple";
  const n = parseInt(groupSize, 10);
  if (isNaN(n) || n <= 1) {
    // Handle string labels
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
  // Map subcategories to group matrix keys
  const keyMap: Record<string, string> = {
    museum: "museum", gallery: "museum", library: "museum", planetarium: "museum",
    cinema: "cinema", theatre: "cinema",
    escape_game: "escape_game",
    bowling_alley: "bowling",
    park: "hiking", garden: "hiking", forest: "hiking", wood: "hiking",
    nature_reserve: "hiking", viewpoint: "hiking", beach: "hiking",
    peak: "hiking", picnic_site: "hiking", dog_park: "hiking",
    theme_park: "theme_park", water_park: "theme_park", zoo: "theme_park",
    aquarium: "theme_park", trampoline_park: "theme_park",
    spa: "spa", public_bath: "spa", sauna: "spa", turkish_bath: "spa",
    massage: "spa", yoga: "spa",
    restaurant: "restaurant", cafe: "restaurant", fast_food: "restaurant",
    marketplace: "restaurant", wine: "restaurant", winery: "restaurant",
    brewery: "restaurant", biergarten: "restaurant", bakery: "restaurant",
    ice_cream: "ice_cream",
    bar: "bar", pub: "bar", nightclub: "bar", casino: "bar",
    kayak: "kayak", canoe: "kayak", sailing: "kayak",
    swimming_pool: "swimming", swimming_area: "swimming",
    karting: "karting", paintball: "paintball",
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

/** Build Overpass QL query from selected activity types */
function buildOverpassQuery(
  lat: number,
  lng: number,
  radius: number,
  activityTypes?: string[]
): string {
  const types = activityTypes?.length ? activityTypes : Object.keys(OSM_TAG_MAP);

  const statements: string[] = [];

  for (const type of types) {
    const tags = OSM_TAG_MAP[type];
    if (!tags) continue;

    for (const tagStr of tags) {
      const parts = tagStr.split("+");
      const mainTag = parts[0]; // e.g. "leisure=sports_centre"
      const [key, value] = mainTag.split("=");

      // If there are compound filters (e.g. sport=climbing), handle them
      if (parts.length > 1) {
        const [subKey, subValue] = parts[1].split("=");
        statements.push(
          `node["${key}"="${value}"]["${subKey}"="${subValue}"](around:${radius},${lat},${lng});`
        );
        statements.push(
          `way["${key}"="${value}"]["${subKey}"="${subValue}"](around:${radius},${lat},${lng});`
        );
        statements.push(
          `relation["${key}"="${value}"]["${subKey}"="${subValue}"](around:${radius},${lat},${lng});`
        );
      } else {
        statements.push(
          `node["${key}"="${value}"](around:${radius},${lat},${lng});`
        );
        statements.push(
          `way["${key}"="${value}"](around:${radius},${lat},${lng});`
        );
        statements.push(
          `relation["${key}"="${value}"](around:${radius},${lat},${lng});`
        );
      }
    }
  }

  // Add sport-specific sub-tags when sport category is selected
  if (types.includes("sport") || types.includes("divertissement") || types.includes("bienEtre")) {
    const sportSubTagsForType: Record<string, string[]> = {
      sport: ["climbing", "karting", "climbing_adventure", "paintball", "sailing"],
      divertissement: ["trampoline", "laser_tag"],
      bienEtre: ["yoga"],
    };

    for (const type of types) {
      const subTags = sportSubTagsForType[type];
      if (!subTags) continue;
      for (const sportVal of subTags) {
        statements.push(
          `node["leisure"="sports_centre"]["sport"="${sportVal}"](around:${radius},${lat},${lng});`
        );
        statements.push(
          `way["leisure"="sports_centre"]["sport"="${sportVal}"](around:${radius},${lat},${lng});`
        );
      }
    }
  }

  return `[out:json][timeout:25];\n(\n${statements.join("\n")}\n);\nout center body qt 300;`;
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
    weatherCompat: number;
    priceRange: [number, number];
    openingHours: string | null;
  },
  params: {
    radius: number;
    activityTypes?: string[];
    budget?: string;
    groupSize: GroupSize;
    weather: WeatherCondition;
  }
): number {
  // ---- Adaptive weights ----
  let wType = 30;
  let wDistance = 25;
  let wWeather = 15;
  let wBudget = 15;
  let wSchedule = 10;
  let wGroup = 5;

  // Strict budget
  if (params.budget && params.budget !== "indifferent") {
    wBudget = 20;
  }
  // Heavy rain or snow
  if (
    params.weather === "pluie_forte" ||
    params.weather === "neige"
  ) {
    wWeather = 25;
  }
  // Evening
  const currentHour = new Date().getUTCHours();
  if (currentHour > 20) {
    wSchedule = 15;
  }

  // ---- score_type ----
  let scoreType = 0.5; // no filter → 0.5
  if (params.activityTypes?.length) {
    if (params.activityTypes.includes(activity.category)) {
      scoreType = 1.0;
    } else {
      // Check parent category match
      const parentCategories: Record<string, string[]> = {
        culture: ["culture"],
        nature: ["nature"],
        sport: ["sport"],
        divertissement: ["divertissement"],
        bienEtre: ["bienEtre"],
        gastronomie: ["gastronomie"],
        ateliers: ["ateliers"],
      };
      const matches = params.activityTypes.some((t) =>
        parentCategories[t]?.includes(activity.category)
      );
      scoreType = matches ? 0.4 : 0.0;
    }
  }

  // ---- score_distance ----
  const radiusKm = params.radius / 1000;
  let scoreDistance = Math.max(0, 1 - activity.distance / radiusKm);
  if (activity.distance <= radiusKm * 0.2) {
    scoreDistance *= 1.2;
    scoreDistance = Math.min(scoreDistance, 1.0);
  }

  // ---- score_weather ----
  const exposure: ExposureType =
    EXPOSURE_MAP[activity.subcategory] || "mixte";
  const scoreWeather =
    WEATHER_MATRIX[exposure]?.[params.weather] ?? 0.6;

  // ---- score_budget ----
  let scoreBudget = 1.0;
  if (params.budget && params.budget !== "indifferent") {
    const budgetLimits: Record<string, number> = {
      gratuit: 0,
      economique: 10,
      modere: 25,
      cher: 50,
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

  // ---- score_schedule (time-of-day awareness) ----
  let scoreSchedule = 0.6; // default: no data
  if (activity.openingHours) {
    scoreSchedule = 0.8;
  }
  // Time-of-day heuristics: penalise outdoor-only at night, boost indoor at night
  if (currentHour >= 21 || currentHour < 6) {
    // Night time: strongly favour indoor activities
    const isIndoor = INDOOR_MAP[activity.subcategory];
    if (isIndoor === false) {
      scoreSchedule = Math.min(scoreSchedule, 0.2); // outdoor at night = bad
    } else if (isIndoor === true) {
      scoreSchedule = Math.min(scoreSchedule + 0.2, 1.0); // indoor at night = good
    }
    // Nature/hiking at night is a bad idea
    const exposure: ExposureType = EXPOSURE_MAP[activity.subcategory] || "mixte";
    if (exposure === "nature_randonnee" || exposure === "aquatique_exterieur") {
      scoreSchedule = 0.0;
    }
  } else if (currentHour >= 6 && currentHour < 9) {
    // Early morning: cafes and bakeries are great, theme parks not open yet
    if (["cafe", "bakery", "pastry"].includes(activity.subcategory)) {
      scoreSchedule = 1.0;
    } else if (["theme_park", "water_park", "escape_game", "nightclub", "bar", "casino"].includes(activity.subcategory)) {
      scoreSchedule = 0.1;
    }
  } else if (currentHour >= 18 && currentHour < 21) {
    // Evening: restaurants, bars, cinema are great
    if (["restaurant", "bar", "pub", "cinema", "nightclub", "biergarten", "theatre"].includes(activity.subcategory)) {
      scoreSchedule = 1.0;
    }
  }

  // ---- score_group ----
  const scoreGroup = getGroupScore(activity.subcategory, params.groupSize);

  // ---- Final weighted score ----
  const totalWeight = wType + wDistance + wWeather + wBudget + wSchedule + wGroup;
  const raw =
    (wType * scoreType +
      wDistance * scoreDistance +
      wWeather * scoreWeather +
      wBudget * scoreBudget +
      wSchedule * scoreSchedule +
      wGroup * scoreGroup) /
    totalWeight;

  return Math.round(raw * 100);
}

// ---------------------------------------------------------------------------
// Rate limiting (in-memory, per edge function instance)
// ---------------------------------------------------------------------------

const RATE_LIMIT_WINDOW = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per IP per minute
const DAILY_LIMIT_MAX = 100; // max requests per IP per day
const DAILY_WINDOW = 86_400_000; // 24h

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const dailyLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();

  // Clean stale entries periodically
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

  // Per-minute rate limit
  const entry = rateLimitMap.get(ip);
  if (entry && entry.resetAt > now) {
    if (entry.count >= RATE_LIMIT_MAX) {
      return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
    }
    entry.count++;
  } else {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  }

  // Daily rate limit
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

    // Validate coordinate ranges
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
        JSON.stringify({
          error: "radius must be between 1 and 50000 metres",
        }),
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

    // ---- Fetch weather & Overpass data in parallel ----
    const OPENWEATHER_API_KEY = Deno.env.get("OPENWEATHER_API_KEY");

    const weatherPromise = OPENWEATHER_API_KEY
      ? fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&appid=${OPENWEATHER_API_KEY}`
        )
          .then((r) => r.json())
          .catch((err) => {
            console.error("Weather fetch error:", err);
            return null;
          })
      : Promise.resolve(null);

    const overpassQuery = buildOverpassQuery(
      lat,
      lng,
      radius,
      body.activityTypes
    );

    const overpassPromise = fetch(
      "https://overpass-api.de/api/interpreter",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      }
    )
      .then((r) => r.json())
      .catch((err) => {
        console.error("Overpass fetch error:", err);
        return { elements: [] };
      });

    const [weatherRaw, overpassData] = await Promise.all([
      weatherPromise,
      overpassPromise,
    ]);

    // ---- Process weather ----
    const weatherInfo = weatherRaw
      ? classifyWeather(weatherRaw)
      : {
          condition: "nuageux" as WeatherCondition,
          temp: 20,
          description: "unknown",
          icon: "02d",
          isNight: false,
        };

    const weatherResponse: WeatherData = {
      condition: weatherInfo.condition,
      temp: weatherInfo.temp,
      description: weatherInfo.description,
      icon: weatherInfo.icon,
      isNight: weatherInfo.isNight,
    };

    // ---- Process Overpass results ----
    const elements: any[] = overpassData.elements || [];
    const groupSize = getGroupSize(body.groupSize);

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

      // Categorise
      const { category, subcategory } = categoriseElement(tags);

      // Filter out results from unselected categories
      if (body.activityTypes?.length && body.activityTypes.length < Object.keys(OSM_TAG_MAP).length) {
        if (!body.activityTypes.includes(category)) continue;
      }

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

      // Weather compatibility
      const exposure: ExposureType =
        EXPOSURE_MAP[subcategory] || "mixte";
      const weatherCompat =
        WEATHER_MATRIX[exposure]?.[weatherInfo.condition] ?? 0.6;

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
        score: 0, // computed below
        priceRange,
        priceClass: priceClassLabel,
        address,
        phone: tags.phone || tags["contact:phone"] || null,
        website: tags.website || tags["contact:website"] || null,
        openingHours: tags.opening_hours || null,
        indoor,
        weatherCompat,
        confidence,
      };

      // Compute score
      act.score = computeScore(
        {
          category: act.category,
          subcategory: act.subcategory,
          distance: act.distance,
          indoor: act.indoor,
          weatherCompat: act.weatherCompat,
          priceRange: act.priceRange,
          openingHours: act.openingHours,
        },
        {
          radius,
          activityTypes: body.activityTypes,
          budget: body.budget,
          groupSize,
          weather: weatherInfo.condition,
        }
      );

      activities.push(act);
    }

    // ---- Sort by score descending ----
    activities.sort((a, b) => b.score - a.score);

    // ---- Diversify: max 3 of same category in top 10 ----
    const diversified: Activity[] = [];
    const categoryCounts: Record<string, number> = {};

    for (const act of activities) {
      if (diversified.length >= 10) {
        // Still add the rest after top 10 without diversification
        diversified.push(act);
        continue;
      }

      const count = categoryCounts[act.category] || 0;
      if (count >= 3) {
        // Push to end (will appear after top 10)
        continue;
      }

      diversified.push(act);
      categoryCounts[act.category] = count + 1;
    }

    // ---- Expansion suggestion ----
    const expanded = diversified.length < 5;
    const suggestedRadius = expanded
      ? Math.min(radius * 2, 50000)
      : null;

    // ---- Build response ----
    const response = {
      activities: diversified,
      weather: weatherResponse,
      meta: {
        total: diversified.length,
        expanded,
        suggestedRadius,
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
