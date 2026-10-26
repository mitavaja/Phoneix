/**
 * Directory of country defaults and zone-based international shipping tariff matrices
 */

export const COUNTRY_DEFAULTS = {
  // North America
  US: { city: "New York", state: "NY", postalCode: "10001", countryName: "United States" },
  CA: { city: "Toronto", state: "ON", postalCode: "M5V1J2", countryName: "Canada" },
  MX: { city: "Mexico City", state: "CMX", postalCode: "01000", countryName: "Mexico" },

  // UK & Europe
  GB: { city: "London", state: "", postalCode: "EC1A 1BB", countryName: "United Kingdom" },
  DE: { city: "Berlin", state: "", postalCode: "10115", countryName: "Germany" },
  FR: { city: "Paris", state: "", postalCode: "75001", countryName: "France" },
  IT: { city: "Rome", state: "", postalCode: "00118", countryName: "Italy" },
  ES: { city: "Madrid", state: "", postalCode: "28001", countryName: "Spain" },
  NL: { city: "Amsterdam", state: "", postalCode: "1012 JS", countryName: "Netherlands" },
  BE: { city: "Brussels", state: "", postalCode: "1000", countryName: "Belgium" },
  CH: { city: "Zurich", state: "", postalCode: "8001", countryName: "Switzerland" },
  AT: { city: "Vienna", state: "", postalCode: "1010", countryName: "Austria" },
  IE: { city: "Dublin", state: "", postalCode: "D01", countryName: "Ireland" },
  SE: { city: "Stockholm", state: "", postalCode: "111 20", countryName: "Sweden" },
  NO: { city: "Oslo", state: "", postalCode: "0150", countryName: "Norway" },
  DK: { city: "Copenhagen", state: "", postalCode: "1050", countryName: "Denmark" },
  FI: { city: "Helsinki", state: "", postalCode: "00100", countryName: "Finland" },
  PL: { city: "Warsaw", state: "", postalCode: "00-001", countryName: "Poland" },
  CZ: { city: "Prague", state: "", postalCode: "11000", countryName: "Czech Republic" },
  PT: { city: "Lisbon", state: "", postalCode: "1000-001", countryName: "Portugal" },
  GR: { city: "Athens", state: "", postalCode: "10557", countryName: "Greece" },
  HU: { city: "Budapest", state: "", postalCode: "1011", countryName: "Hungary" },
  RO: { city: "Bucharest", state: "", postalCode: "010011", countryName: "Romania" },
  TR: { city: "Istanbul", state: "", postalCode: "34000", countryName: "Turkey" },
  RU: { city: "Moscow", state: "", postalCode: "101000", countryName: "Russia" },

  // GCC / Middle East
  AE: { city: "Dubai", state: "DU", postalCode: "", countryName: "United Arab Emirates" },
  SA: { city: "Riyadh", state: "", postalCode: "11564", countryName: "Saudi Arabia" },
  KW: { city: "Kuwait City", state: "", postalCode: "13001", countryName: "Kuwait" },
  QA: { city: "Doha", state: "", postalCode: "", countryName: "Qatar" },
  OM: { city: "Muscat", state: "", postalCode: "100", countryName: "Oman" },
  BH: { city: "Manama", state: "", postalCode: "304", countryName: "Bahrain" },
  JO: { city: "Amman", state: "", postalCode: "11118", countryName: "Jordan" },
  LB: { city: "Beirut", state: "", postalCode: "1107", countryName: "Lebanon" },
  EG: { city: "Cairo", state: "", postalCode: "11511", countryName: "Egypt" },

  // Southeast & East Asia
  SG: { city: "Singapore", state: "", postalCode: "018989", countryName: "Singapore" },
  MY: { city: "Kuala Lumpur", state: "", postalCode: "50000", countryName: "Malaysia" },
  TH: { city: "Bangkok", state: "", postalCode: "10200", countryName: "Thailand" },
  ID: { city: "Jakarta", state: "", postalCode: "10110", countryName: "Indonesia" },
  PH: { city: "Manila", state: "", postalCode: "1000", countryName: "Philippines" },
  VN: { city: "Hanoi", state: "", postalCode: "100000", countryName: "Vietnam" },
  HK: { city: "Hong Kong", state: "", postalCode: "999077", countryName: "Hong Kong" },
  JP: { city: "Tokyo", state: "", postalCode: "100-0001", countryName: "Japan" },
  KR: { city: "Seoul", state: "", postalCode: "03000", countryName: "South Korea" },
  CN: { city: "Beijing", state: "", postalCode: "100000", countryName: "China" },
  TW: { city: "Taipei", state: "", postalCode: "100", countryName: "Taiwan" },

  // South Asia
  IN: { city: "Mumbai", state: "MH", postalCode: "400001", countryName: "India" },
  BD: { city: "Dhaka", state: "", postalCode: "1000", countryName: "Bangladesh" },
  LK: { city: "Colombo", state: "", postalCode: "00100", countryName: "Sri Lanka" },
  NP: { city: "Kathmandu", state: "", postalCode: "44600", countryName: "Nepal" },
  BT: { city: "Thimphu", state: "", postalCode: "11001", countryName: "Bhutan" },
  MV: { city: "Male", state: "", postalCode: "20002", countryName: "Maldives" },
  PK: { city: "Islamabad", state: "", postalCode: "44000", countryName: "Pakistan" },

  // Oceania
  AU: { city: "Sydney", state: "NSW", postalCode: "2000", countryName: "Australia" },
  NZ: { city: "Auckland", state: "", postalCode: "1010", countryName: "New Zealand" },
  FJ: { city: "Suva", state: "", postalCode: "", countryName: "Fiji" },

  // Africa & South America
  ZA: { city: "Johannesburg", state: "", postalCode: "2000", countryName: "South Africa" },
  NG: { city: "Lagos", state: "", postalCode: "100001", countryName: "Nigeria" },
  KE: { city: "Nairobi", state: "", postalCode: "00100", countryName: "Kenya" },
  BR: { city: "Sao Paulo", state: "SP", postalCode: "01000-000", countryName: "Brazil" },
  AR: { city: "Buenos Aires", state: "", postalCode: "C1002", countryName: "Argentina" },
  CL: { city: "Santiago", state: "", postalCode: "8320000", countryName: "Chile" },
  CO: { city: "Bogota", state: "", postalCode: "110111", countryName: "Colombia" },
};

/**
 * Returns clean destination defaults (city, state, postalCode) for any given ISO country code.
 */
export const getCountryDefaults = (countryCode) => {
  if (!countryCode) return { city: "Dubai", state: "", postalCode: "" };
  const code = countryCode.toString().trim().toUpperCase();
  if (COUNTRY_DEFAULTS[code]) {
    return { ...COUNTRY_DEFAULTS[code] };
  }
  return {
    city: "Capital City",
    state: "",
    postalCode: "10001",
    countryName: code,
  };
};

/**
 * Calibrated zone-based international shipping tariff matrix.
 * Used for fallback / simulated rates so each region/country calculates distinct, realistic rates.
 */
const ZONE_TABLE = [
  // Domestic
  {
    name: "Domestic India",
    countries: ["IN"],
    baseRate: 280.0,
    ratePerKg: 70.0,
  },
  // Zone 1: GCC / Middle East
  {
    name: "GCC / Middle East",
    countries: ["AE", "SA", "OM", "QA", "KW", "BH", "JO", "LB", "EG"],
    baseRate: 1850.0,
    ratePerKg: 290.0,
  },
  // Zone 2: South Asia
  {
    name: "South Asia",
    countries: ["BD", "LK", "NP", "BT", "MV", "PK", "AF"],
    baseRate: 1250.0,
    ratePerKg: 220.0,
  },
  // Zone 3: Southeast Asia
  {
    name: "Southeast Asia",
    countries: ["SG", "MY", "TH", "ID", "VN", "PH", "BN", "KH", "LA", "MM"],
    baseRate: 1650.0,
    ratePerKg: 310.0,
  },
  // Zone 4: Far East Asia
  {
    name: "Far East Asia",
    countries: ["HK", "JP", "KR", "TW", "CN", "MO"],
    baseRate: 2100.0,
    ratePerKg: 380.0,
  },
  // Zone 5: UK & Western Europe
  {
    name: "UK & Western Europe",
    countries: ["GB", "DE", "FR", "IT", "ES", "NL", "BE", "CH", "AT", "IE", "LU", "MC"],
    baseRate: 2650.0,
    ratePerKg: 460.0,
  },
  // Zone 6: Northern & Eastern Europe
  {
    name: "Northern & Eastern Europe",
    countries: [
      "PL", "SE", "NO", "DK", "FI", "CZ", "GR", "PT", "RO", "HU",
      "SK", "BG", "HR", "SI", "EE", "LV", "LT", "CY", "MT", "IS", "TR", "RU", "UA"
    ],
    baseRate: 3100.0,
    ratePerKg: 510.0,
  },
  // Zone 7: North America
  {
    name: "North America",
    countries: ["US", "CA", "MX"],
    baseRate: 4600.0,
    ratePerKg: 820.0,
  },
  // Zone 8: Oceania
  {
    name: "Oceania",
    countries: ["AU", "NZ", "FJ", "PG"],
    baseRate: 2750.0,
    ratePerKg: 490.0,
  },
];

const REST_OF_WORLD_ZONE = {
  name: "Rest of World",
  baseRate: 3400.0,
  ratePerKg: 620.0,
};

/**
 * Computes calibrated base shipping rate for a country and chargeable weight
 */
export const getZoneBasedFallbackRate = (countryCode, chargeableWeight = 1) => {
  const code = (countryCode || "").toString().trim().toUpperCase();
  const weight = Math.max(0.1, parseFloat(chargeableWeight) || 1.0);

  let matchedZone = ZONE_TABLE.find((z) => z.countries.includes(code));
  if (!matchedZone) {
    matchedZone = REST_OF_WORLD_ZONE;
  }

  const baseRate = matchedZone.baseRate;
  const ratePerKg = matchedZone.ratePerKg;
  // Chargeable base: base rate covers first 0.5 kg, then incremental weight
  const additionalWeight = Math.max(0, weight - 0.5);
  const totalBaseCost = parseFloat((baseRate + additionalWeight * ratePerKg).toFixed(2));

  return {
    zoneName: matchedZone.name,
    baseRate,
    ratePerKg,
    totalBaseCost,
  };
};
