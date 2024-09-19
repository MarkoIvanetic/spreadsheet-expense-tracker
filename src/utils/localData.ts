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
  no_idea: "❓ No idea",
  mortgage_bills: "🏠 Rezije Kredit",
  drinks_outings: "☕🍺 Kave Cuge Izlasci",
  home_furnishing: "🏠 Opremanje Stana",
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
  { includes: ["WoltEUR", "Mlinar", "Pekara"], category: categoriesLocal.food },
  { includes: ["INTERSPAR"], category: categoriesLocal.groceries },
  {
    includes: ["PetrolEUR", "INAEUR", "Tifon"],
    priceBelow: 12,
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
