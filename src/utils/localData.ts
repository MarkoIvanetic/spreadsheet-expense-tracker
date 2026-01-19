// this should be updated when adding new categories
// used for manual detection

export const categoriesLocal = {
  health_fitness: "🏋🏻 Health/Fitness",
  groceries: "🥬🍌 Speceraj",
  food: "🍔 Food",
  car_gas: "⛽︎ Car Gas",
  car_maintenance: "🚗 Car Maintenance",
  car_parking: "🚗 Car Parking",
  tobacco: "🚭 Tobacco",
  no_idea: "❓No idea",
  mortgage_bills: "🏠 Rezije / Stan",
  kredit: "🏦 Kredit",
  drinks_outings: "☕🍺 Kave Cuge Izlasci",
  travel: "🗺️✈️ Putovanja",
  hobby: "🎨 Hobby",
  clothing: "👔 Roba",
  investing: "💰 Investing",
  gifts: "🎁 Gifts",
};

export interface MatchingData {
  includes: Array<string>;
  category: string;
  priceBelow?: number;
}

export const matchingData: Array<MatchingData> = [
  {
    includes: [
      "WoltEUR",
      "Mlinar",
      "Pekara",
      "Pekarna",
      "Burger",
      "McDonald",
      "Wolt",
      "Magazinska",
      "Caffe", // lateral
      "Trattoria",
      "Peko",
      "Tao",
    ],
    category: categoriesLocal.food,
  },
  {
    includes: ["Tedi", "TediEUR", "TemuEUR", "MenartEUR", "Bambu"],
    category: categoriesLocal.hobby,
  },
  {
    includes: [
      "INTERSPAR",
      "Konzum",
      "Lidl",
      "Kaufland",
      "SPAR",
      "Tvornica",
      "SamopostrezbaEUR",
      "Supernova",
      "Peradarstvo", // pilici
      "Martinjak", // mesar
      "Bread", // club
      "PlodineEUR",
      "Ela",
      "PEKIN", // moved here
    ],
    category: categoriesLocal.groceries,
  },
  {
    includes: ["House", "About You", "Peek", "HouseEUR"],
    category: categoriesLocal.clothing,
  },
  {
    includes: ["Laka", "Mali", "Hangtime", "Krivi"],
    category: categoriesLocal.drinks_outings,
  },
  {
    includes: ["PetrolEUR", "INAEUR", "Tifon"],
    category: categoriesLocal.tobacco,
  },
  {
    includes: ["Tisak", "TisakEUR"],
    category: categoriesLocal.tobacco,
  },
  {
    includes: ["PetrolEUR", "INAEUR", "Tifon", "LUKOILEUR", "BoltEUR"],
    category: categoriesLocal.car_gas,
  },
  {
    includes: [
      "GoogleEUR",
      "PevexEUR",
      "BonamiEUR",
      "Bauhaus",
      "EmmezetaEUR",
      "A1",
    ],
    category: categoriesLocal.mortgage_bills,
  },
  {
    includes: ["Hrvatske", "Toll", "Np"],
    category: categoriesLocal.travel,
  },
];

export const matchingDataFlat = matchingData.reduce((acc, iter) => {
  const result: Record<string, string> = {};

  iter.includes.forEach((cat: string) => {
    result[cat] = iter.category;
  });

  return { ...acc, ...result };
}, {}) as Record<string, string>;
