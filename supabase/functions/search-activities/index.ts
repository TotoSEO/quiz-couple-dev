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
  pmr?: boolean;
  dogAllowed?: boolean;
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
  wheelchair: string | null;
  indoor: boolean | null;
  weatherCompat: number;
  confidence: number;
}

interface WeatherData {
  condition: string;
  temp: number;
  description: string;
  icon: string;
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
    "historic=monument",
    "historic=castle",
    "historic=manor",
    "historic=archaeological_site",
    "amenity=place_of_worship",
    "amenity=library",
    "amenity=theatre",
    "amenity=cinema",
  ],
  nature: [
    "leisure=park",
    "leisure=garden",
    "landuse=forest",
    "natural=wood",
    "natural=water",
    "natural=beach",
    "tourism=viewpoint",
    "leisure=nature_reserve",
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
  ],
  divertissement: [
    "leisure=escape_game",
    "tourism=theme_park",
    "leisure=water_park",
    "tourism=zoo",
    "tourism=aquarium",
    "leisure=amusement_arcade",
    "amenity=nightclub",
    "amenity=bar",
  ],
  bienEtre: [
    "leisure=spa",
    "amenity=public_bath",
    "leisure=sauna",
    "shop=massage",
  ],
  gastronomie: [
    "amenity=restaurant",
    "amenity=cafe",
    "amenity=marketplace",
    "shop=wine",
    "craft=winery",
    "craft=brewery",
  ],
  ateliers: ["amenity=arts_centre", "craft=pottery", "shop=farm"],
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

// ---------------------------------------------------------------------------
// Indoor / outdoor mapping per subcategory
// ---------------------------------------------------------------------------

const INDOOR_MAP: Record<string, boolean | null> = {
  // culture
  museum: true,
  gallery: true,
  monument: null,
  castle: null,
  manor: true,
  archaeological_site: false,
  place_of_worship: true,
  library: true,
  theatre: true,
  cinema: true,
  // nature
  park: false,
  garden: false,
  forest: false,
  wood: false,
  water: false,
  beach: false,
  viewpoint: false,
  nature_reserve: false,
  // sport
  swimming_pool: null,
  sports_centre: true,
  ice_rink: true,
  bowling_alley: true,
  golf_course: false,
  miniature_golf: false,
  fitness_centre: true,
  stadium: false,
  // divertissement
  escape_game: true,
  theme_park: false,
  water_park: null,
  zoo: false,
  aquarium: true,
  amusement_arcade: true,
  nightclub: true,
  bar: true,
  // bienEtre
  spa: true,
  public_bath: true,
  sauna: true,
  massage: true,
  // gastronomie
  restaurant: true,
  cafe: true,
  marketplace: null,
  wine: true,
  winery: true,
  brewery: true,
  // ateliers
  arts_centre: true,
  pottery: true,
  farm: false,
};

// ---------------------------------------------------------------------------
// Exposure type per subcategory (for weather scoring)
// ---------------------------------------------------------------------------

const EXPOSURE_MAP: Record<string, ExposureType> = {
  // culture
  museum: "interieur",
  gallery: "interieur",
  monument: "mixte",
  castle: "mixte",
  manor: "interieur",
  archaeological_site: "exterieur_decouvert",
  place_of_worship: "interieur",
  library: "interieur",
  theatre: "interieur",
  cinema: "interieur",
  // nature
  park: "exterieur_decouvert",
  garden: "exterieur_decouvert",
  forest: "nature_randonnee",
  wood: "nature_randonnee",
  water: "exterieur_decouvert",
  beach: "exterieur_decouvert",
  viewpoint: "exterieur_decouvert",
  nature_reserve: "nature_randonnee",
  // sport
  swimming_pool: "aquatique_exterieur",
  sports_centre: "interieur",
  ice_rink: "interieur",
  bowling_alley: "interieur",
  golf_course: "exterieur_decouvert",
  miniature_golf: "exterieur_decouvert",
  fitness_centre: "interieur",
  stadium: "exterieur_couvert",
  // divertissement
  escape_game: "interieur",
  theme_park: "exterieur_couvert",
  water_park: "aquatique_exterieur",
  zoo: "exterieur_couvert",
  aquarium: "interieur",
  amusement_arcade: "interieur",
  nightclub: "interieur",
  bar: "interieur",
  // bienEtre
  spa: "interieur",
  public_bath: "interieur",
  sauna: "interieur",
  massage: "interieur",
  // gastronomie
  restaurant: "interieur",
  cafe: "interieur",
  marketplace: "exterieur_couvert",
  wine: "interieur",
  winery: "interieur",
  brewery: "interieur",
  // ateliers
  arts_centre: "interieur",
  pottery: "interieur",
  farm: "exterieur_decouvert",
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
} {
  const id: number = owm.weather?.[0]?.id ?? 800;
  const temp: number = owm.main?.temp ?? 20;
  const description: string = owm.weather?.[0]?.description ?? "";
  const icon: string = owm.weather?.[0]?.icon ?? "01d";

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
    condition = "soleil";
  }

  return { condition, temp, description, icon };
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
    museum: "museum",
    gallery: "museum",
    cinema: "cinema",
    escape_game: "escape_game",
    bowling_alley: "bowling",
    park: "hiking",
    garden: "hiking",
    forest: "hiking",
    wood: "hiking",
    nature_reserve: "hiking",
    viewpoint: "hiking",
    beach: "hiking",
    theme_park: "theme_park",
    water_park: "theme_park",
    zoo: "theme_park",
    aquarium: "theme_park",
    spa: "spa",
    public_bath: "spa",
    sauna: "spa",
    massage: "spa",
    restaurant: "restaurant",
    cafe: "restaurant",
    marketplace: "restaurant",
    wine: "restaurant",
    winery: "restaurant",
    brewery: "restaurant",
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

  // ---- score_schedule ----
  // Simplified: without real-time opening hours parsing we use a heuristic
  let scoreSchedule = 0.6; // default: no data
  if (activity.openingHours) {
    // We have data but cannot fully parse — give a moderate confidence
    scoreSchedule = 0.8;
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
// Main handler
// ---------------------------------------------------------------------------

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- Parse & validate input ----
    const body: SearchRequest = await req.json();
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
      typeof radius !== "number"
    ) {
      return new Response(
        JSON.stringify({ error: "lat, lng and radius must be numbers" }),
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
        };

    const weatherResponse: WeatherData = {
      condition: weatherInfo.condition,
      temp: weatherInfo.temp,
      description: weatherInfo.description,
      icon: weatherInfo.icon,
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

      // Deduplicate
      const poiRef = { name: tags.name, category, lat: elLat, lng: elLng };
      if (isDuplicate(poiRef, seenPois)) continue;
      seenPois.push(poiRef);

      // Distance
      const distance = haversine(lat, lng, elLat, elLng);

      // Price
      const priceRange: [number, number] = PRICE_MAP[category] || [0, 20];
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
        wheelchair: tags.wheelchair || null,
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
