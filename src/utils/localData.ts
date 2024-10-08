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
    includes: ["WoltEUR", "Mlinar", "Pekara", "Burger"],
    category: categoriesLocal.food,
  },
  {
    includes: ["Tedi"],
    category: categoriesLocal.hobby,
  },
  {
    includes: ["INTERSPAR", "Konzum", "Lidl", "Kaufland"],
    category: categoriesLocal.groceries,
  },
  {
    includes: ["INTERSPORT", "House"],
    category: categoriesLocal.clothing,
  },
  {
    includes: ["PetrolEUR", "INAEUR", "Tifon"],
    priceBelow: 15,
    category: categoriesLocal.tobacco,
  },
  {
    includes: ["Tisak"],
    category: categoriesLocal.tobacco,
  },
  {
    includes: ["PetrolEUR", "INAEUR", "Tifon"],
    category: categoriesLocal.car_gas,
  },
  {
    includes: ["TemuEUR"],
    category: categoriesLocal.hobby,
  },
];
