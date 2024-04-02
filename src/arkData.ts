import { Species, Diet, Food } from "./types";

const minute = 60;
const hour = 60 * minute;
const day = 24 * hour;

let food:Food[] = [
  {
    name: "Raw Fish Meat",
    stackSize: 40,
    spoilTime: 20 * minute,
    weight: 0.1
  },
  {
    name: "Cooked Fish Meat",
    stackSize: 50,
    spoilTime: 30 * minute,
    weight: 0.1
  },
  {
    name: "Raw Meat",
    stackSize: 40,
    spoilTime: 10 * minute,
    weight: 0.1
  },
  {
    name: "Cooked Meat",
    stackSize: 50,
    spoilTime: 20 * minute,
    weight: 0.1
  },
  {
    name: "Spoiled Meat",
    stackSize: 100,
    spoilTime: 1 * hour,
    weight: 0.1
  },
  {
    name: "Mejoberry",
    stackSize: 100,
    spoilTime: 10 * minute,
    weight: 0.1
  },
  {
    name: "Berry",
    stackSize: 100,
    spoilTime: 10 * minute,
    weight: 0.1
  },
  {
    name: "Vegetables",
    stackSize: 100,
    spoilTime: 5 * minute,
    weight: 0.1
  },
  {
    name: "Rare Flower",
    stackSize: 100,
    spoilTime: 3 * day,
    weight: 0.15
  },
  {
    name: "Kibble",
    stackSize: 100,
    spoilTime: 3 * day,
    weight: 0.1
  },
  {
    name: "Wyvern Milk",
    stackSize: 1,
    spoilTime: 30 * minute,
    weight: 0.1
  },
  {
    name: "Mutagen",
    stackSize: 1,
    spoilTime: 30 * minute,
    weight: 0.1
  },
  {
    name: "Primal Crystal",
    stackSize: 1,
    spoilTime: 3 * hour,
    weight: 1
  },
  {
    name: "Ambergris",
    stackSize: 1,
    spoilTime: 20 * minute,
    weight: 5
  },
  {
    name: "Nameless Venom",
    stackSize: 1,
    spoilTime: 30 * minute,
    weight: 0.1
  },
  {
    name: "Blood Pack",
    stackSize: 100,
    spoilTime: 30 * minute,
    weight: 0.05
  },
  {
    name: "Chitin",
    stackSize: 100,
    spoilTime: null,
    weight: 0.01
  },
  {
    name: "Sulfur",
    stackSize: 100,
    spoilTime: null,
    weight: 0.05
  }
];

let diets:Diet[] = [
  {
    name: "herbivore",
    food: {
      "Berry": 20,
      "Mejoberry": 30,
      "Vegetables": 40,
      "Kibble": 60
    }
  },
  {
    name: "carnivore",
    food: {
      "Raw Fish Meat": 25,
      "Cooked Fish Meat": 12.5,
      "Raw Meat": 50,
      "Cooked Meat": 25,
      "Kibble": 60
    }
  },
  {
    name: "omnivore",
    food: {
      "Raw Fish Meat": 25,
      "Cooked Fish Meat": 12.5,
      "Raw Meat": 50,
      "Berry": 20,
      "Cooked Meat": 25,
      "Mejoberry": 30,
      "Vegetables": 40,
      "Kibble": 60
    }
  },
  {
    name: "piscivore",
    food: {
      "Raw Fish Meat": 25,
      "Cooked Fish Meat": 12.5
    }
  },
  {
    name: "carrion",
    food: {
      "Raw Fish Meat": 5,
      "Spoiled Meat": 50,
      "Raw Meat": 10
    }
  },
  {
    name: "archaeopteryx",
    food: {
      "chitin": 50
    }
  },
  {
    name: "daeodon",
    food: {
      "Raw Fish Meat": 25,
      "Cooked Fish Meat": 12.5,
      "Raw Meat": 50,
      "Cooked Meat": 25,
      "Kibble": 60
    }
  },
  {
    name: "microraptor",
    food: {
      "Raw Fish Meat": 25,
      "Cooked Fish Meat": 12.5,
      "Raw Meat": 50,
      "Cooked Meat": 25,
      "Kibble": 60,
      "Rare Flower": 60
    }
  }
];

let troughTypes:Record<string, number> = {
  player: 1,
  normal: 4,
  tek: 100
};

let species:Species[] = [
  new Species({
    name: "Allosaurus",
    diet: "carnivore",
    babyFoodRateStart: 0.94452,
    babyFoodRateEnd: 0.001852,
    adultFoodRate: 0.001852,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Amargasaurus",
    diet: "herbivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Andrewsarchus",
    diet: "omnivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.0000048
  }),
  new Species({
    name: "Anglerfish",
    diet: "carnivore",
    babyFoodRateStart: 0.94452,
    babyFoodRateEnd: 0.001852,
    adultFoodRate: 0.001852,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Ankylosaurus",
    diet: "herbivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Araneo",
    diet: "carrion",
    babyFoodRateStart: 0.88536,
    babyFoodRateEnd: 0.001736,
    adultFoodRate: 0.001736,
    ageSpeed: 0.0000111
  }),
  new Species({
    name: "Archaeopteryx",
    diet: "archaeopteryx",
    babyFoodRateStart: 0.66402,
    babyFoodRateEnd: 0.001302,
    adultFoodRate: 0.001302,
    ageSpeed: 0.000018
  }),
  new Species({
    name: "Argentavis",
    diet: "carnivore",
    babyFoodRateStart: 0.94452,
    babyFoodRateEnd: 0.001852,
    adultFoodRate: 0.001852,
    ageSpeed: 0.0000051
  }),
  new Species({
    name: "Arthropluera",
    diet: "carrion",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000054
  }),
  new Species({
    name: "Astrodelphis",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000051
  }),
  new Species({
    name: "Baryonyx",
    diet: "piscivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Basilosaurus",
    diet: "carnivore",
    babyFoodRateStart: 1.49379,
    babyFoodRateEnd: 0.002929,
    adultFoodRate: 0.002929,
    ageSpeed: 0.0000024
  }),
  new Species({
    name: "Beelzebufo",
    diet: "carnivore",
    babyFoodRateStart: 0.98379,
    babyFoodRateEnd: 0.001929,
    adultFoodRate: 0.001929,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Bloodstalker",
    diet: "bloodstalker",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000051
  }),
  new Species({
    name: "Brontosaurus",
    diet: "herbivore",
    babyFoodRateStart: 3.93516,
    babyFoodRateEnd: 0.007716,
    adultFoodRate: 0.007716,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Bulbdog",
    diet: "omnivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Carbonemys",
    diet: "herbivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.000012
  }),
  new Species({
    name: "Carcharodontosaurus",
    diet: "carnivore",
    babyFoodRateStart: 1.6198,
    babyFoodRateEnd: 0.002314,
    adultFoodRate: 0.006942,
    ageSpeed: 0.00000114
  }),
  new Species({
    name: "Carnotaurus",
    diet: "carnivore",
    babyFoodRateStart: 0.94452,
    babyFoodRateEnd: 0.001852,
    adultFoodRate: 0.001852,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Castoroides",
    diet: "herbivore",
    babyFoodRateStart: 1.18014,
    babyFoodRateEnd: 0.002314,
    adultFoodRate: 0.002314,
    ageSpeed: 0.0000045
  }),
  new Species({
    name: "Chalicotherium",
    diet: "herbivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.00000338
  }),
  new Species({
    name: "Compsognathus",
    diet: "carnivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.0000132
  }),
  new Species({
    name: "Crystal Wyvern",
    diet: "crystalwyvern",
    babyFoodRateStart: 0.0213675,
    babyFoodRateEnd: 0.000185,
    adultFoodRate: 0.000185,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Daeodon",
    diet: "carnivore",
    babyFoodRateStart: 0.4,
    babyFoodRateEnd: 0.01,
    adultFoodRate: 0.01,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Deinonychus",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Desmodus",
    diet: "bloodstalker",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000039
  }),
  new Species({
    name: "Dilophosaurus",
    diet: "carnivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.0000132
  }),
  new Species({
    name: "Dimetrodon",
    diet: "carnivore",
    babyFoodRateStart: 0.88536,
    babyFoodRateEnd: 0.001736,
    adultFoodRate: 0.001736,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Dimorphodon",
    diet: "carnivore",
    babyFoodRateStart: 0.66402,
    babyFoodRateEnd: 0.001302,
    adultFoodRate: 0.001302,
    ageSpeed: 0.0000111
  }),
  new Species({
    name: "Dinopithecus",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Diplocaulus",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Diplodocus",
    diet: "herbivore",
    babyFoodRateStart: 3.93516,
    babyFoodRateEnd: 0.007716,
    adultFoodRate: 0.007716,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Direbear",
    diet: "omnivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Direwolf",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Dodo",
    diet: "herbivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.000018
  }),
  new Species({
    name: "Doedicurus",
    diet: "herbivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.0000048
  }),
  new Species({
    name: "Dunkleosteus",
    diet: "carnivore",
    babyFoodRateStart: 0.94452,
    babyFoodRateEnd: 0.001852,
    adultFoodRate: 0.001852,
    ageSpeed: 0.00000338
  }),
  new Species({
    name: "Electrophorus",
    diet: "carnivore",
    babyFoodRateStart: 1.49379,
    babyFoodRateEnd: 0.002929,
    adultFoodRate: 0.002929,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Equus",
    diet: "herbivore",
    babyFoodRateStart: 0.98379,
    babyFoodRateEnd: 0.001929,
    adultFoodRate: 0.001929,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Featherlight",
    diet: "carnivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Ferox",
    diet: "carnivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Fjordhawk",
    diet: "omnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Gacha",
    diet: "omnivore",
    babyFoodRateStart: 5.1,
    babyFoodRateEnd: 0.01,
    adultFoodRate: 0.01,
    ageSpeed: 0.0000024
  }),
  new Species({
    name: "Gallimimus",
    diet: "herbivore",
    babyFoodRateStart: 0.98379,
    babyFoodRateEnd: 0.001929,
    adultFoodRate: 0.001929,
    ageSpeed: 0.0000105
  }),
  new Species({
    name: "Gasbag",
    diet: "herbivore",
    babyFoodRateStart: 1.05366,
    babyFoodRateEnd: 0.002066,
    adultFoodRate: 0.002066,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Giganotosaurus",
    diet: "carnivore",
    babyFoodRateStart: 2.0826,
    babyFoodRateEnd: 0.002314,
    adultFoodRate: 0.006942,
    ageSpeed: 0.00000114
  }),
  new Species({
    name: "Gigantopithecus",
    diet: "herbivore",
    babyFoodRateStart: 2.11956,
    babyFoodRateEnd: 0.004156,
    adultFoodRate: 0.004156,
    ageSpeed: 0.0000036
  }),
  new Species({
    name: "Glowtail",
    diet: "carnivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Hesperornis",
    diet: "carnivore",
    babyFoodRateStart: 0.70839,
    babyFoodRateEnd: 0.001389,
    adultFoodRate: 0.001389,
    ageSpeed: 0.0000099
  }),
  new Species({
    name: "Hyaenodon",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Ichthyornis",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Ichthyosaurus",
    diet: "carnivore",
    babyFoodRateStart: 0.98379,
    babyFoodRateEnd: 0.001929,
    adultFoodRate: 0.001929,
    ageSpeed: 0.0000048
  }),
  new Species({
    name: "Iguanodon",
    diet: "herbivore",
    babyFoodRateStart: 0.98379,
    babyFoodRateEnd: 0.001929,
    adultFoodRate: 0.001929,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Jerboa",
    diet: "herbivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.0000132
  }),
  new Species({
    name: "Kairuku",
    diet: "carnivore",
    babyFoodRateStart: 0.70839,
    babyFoodRateEnd: 0.001389,
    adultFoodRate: 0.001389,
    ageSpeed: 0.0000099
  }),
  new Species({
    name: "Kaprosuchus",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Kentrosaurus",
    diet: "herbivore",
    babyFoodRateStart: 2.72391,
    babyFoodRateEnd: 0.005341,
    adultFoodRate: 0.005341,
    ageSpeed: 0.0000054
  }),
  new Species({
    name: "Lymantria",
    diet: "herbivore",
    babyFoodRateStart: 0.94452,
    babyFoodRateEnd: 0.001852,
    adultFoodRate: 0.001852,
    ageSpeed: 0.000009
  }),
  new Species({
    name: "Lystrosaurus",
    diet: "herbivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.000018
  }),
  new Species({
    name: "Maewing",
    diet: "carnivore",
    babyFoodRateStart: 5.1,
    babyFoodRateEnd: 0.01,
    adultFoodRate: 0.01,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Magmasaur",
    diet: "magmasaur",
    babyFoodRateStart: 0.19635,
    babyFoodRateEnd: 0.000385,
    adultFoodRate: 0.000385,
    ageSpeed: 0.0000015
  }),
  new Species({
    name: "Mammoth",
    diet: "herbivore",
    babyFoodRateStart: 2.10783,
    babyFoodRateEnd: 0.004133,
    adultFoodRate: 0.004133,
    ageSpeed: 0.00000338
  }),
  new Species({
    name: "Managarmr",
    diet: "carnivore",
    babyFoodRateStart: 0.94452,
    babyFoodRateEnd: 0.001852,
    adultFoodRate: 0.001852,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Manta",
    diet: "carnivore",
    babyFoodRateStart: 0.98379,
    babyFoodRateEnd: 0.001929,
    adultFoodRate: 0.001929,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Mantis",
    diet: "carrion_",
    babyFoodRateStart: 1.18014,
    babyFoodRateEnd: 0.002314,
    adultFoodRate: 0.002314,
    ageSpeed: 0.0000051
  }),
  new Species({
    name: "Megachelon",
    diet: "omnivore",
    babyFoodRateStart: 5.1,
    babyFoodRateEnd: 0.01,
    adultFoodRate: 0.01,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Megalania",
    diet: "carnivore",
    babyFoodRateStart: 0.88536,
    babyFoodRateEnd: 0.001736,
    adultFoodRate: 0.001736,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Megaloceros",
    diet: "herbivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000039
  }),
  new Species({
    name: "Megalodon",
    diet: "carnivore",
    babyFoodRateStart: 0.94452,
    babyFoodRateEnd: 0.001852,
    adultFoodRate: 0.001852,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Megalosaurus",
    diet: "carnivore",
    babyFoodRateStart: 0.94452,
    babyFoodRateEnd: 0.001852,
    adultFoodRate: 0.001852,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Megatherium",
    diet: "omnivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Mesopithecus",
    diet: "herbivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.000009
  }),
  new Species({
    name: "Microraptor",
    diet: "microraptor",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.0000051
  }),
  new Species({
    name: "Morellatops",
    diet: "herbivore",
    babyFoodRateStart: 2.72391,
    babyFoodRateEnd: 0.005341,
    adultFoodRate: 0.005341,
    ageSpeed: 0.000009
  }),
  new Species({
    name: "Mosasaurus",
    diet: "carnivore",
    babyFoodRateStart: 2.55,
    babyFoodRateEnd: 0.005,
    adultFoodRate: 0.005,
    ageSpeed: 0.0000015
  }),
  new Species({
    name: "Moschops",
    diet: "omnivore",
    babyFoodRateStart: 0.88536,
    babyFoodRateEnd: 0.001736,
    adultFoodRate: 0.001736,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Onyc",
    diet: "carnivore",
    babyFoodRateStart: 1.47543,
    babyFoodRateEnd: 0.002893,
    adultFoodRate: 0.002893,
    ageSpeed: 0.0000099
  }),
  new Species({
    name: "Otter",
    diet: "piscivore",
    babyFoodRateStart: 1.18014,
    babyFoodRateEnd: 0.002314,
    adultFoodRate: 0.002314,
    ageSpeed: 0.0000132
  }),
  new Species({
    name: "Oviraptor",
    diet: "carnivore",
    babyFoodRateStart: 0.66402,
    babyFoodRateEnd: 0.001302,
    adultFoodRate: 0.001302,
    ageSpeed: 0.0000132
  }),
  new Species({
    name: "Ovis",
    diet: "herbivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Pachycephalosaurus",
    diet: "herbivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000105
  }),
  new Species({
    name: "Pachyrhinosaurus",
    diet: "herbivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Paraceratherium",
    diet: "herbivore",
    babyFoodRateStart: 1.785,
    babyFoodRateEnd: 0.0035,
    adultFoodRate: 0.0035,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Parasaurolophus",
    diet: "herbivore",
    babyFoodRateStart: 0.98379,
    babyFoodRateEnd: 0.001929,
    adultFoodRate: 0.001929,
    ageSpeed: 0.0000105
  }),
  new Species({
    name: "Pegomastax",
    diet: "herbivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.000009
  }),
  new Species({
    name: "Pelagornis",
    diet: "piscivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Phiomia",
    diet: "herbivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Plesiosaurus",
    diet: "carnivore",
    babyFoodRateStart: 1.96758,
    babyFoodRateEnd: 0.003858,
    adultFoodRate: 0.003858,
    ageSpeed: 0.0000024
  }),
  new Species({
    name: "Procoptodon",
    diet: "herbivore",
    babyFoodRateStart: 0.98379,
    babyFoodRateEnd: 0.001929,
    adultFoodRate: 0.001929,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Pteranodon",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Pulmonoscorpius",
    diet: "carrion_",
    babyFoodRateStart: 0.98379,
    babyFoodRateEnd: 0.001929,
    adultFoodRate: 0.001929,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Purlovia",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Quetzalcoatlus",
    diet: "carnivore",
    babyFoodRateStart: 1.785,
    babyFoodRateEnd: 0.0035,
    adultFoodRate: 0.0035,
    ageSpeed: 0.0000021
  }),
  new Species({
    name: "Raptor",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000075
  }),
  new Species({
    name: "Ravager",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Reaper",
    diet: "carnivore",
    babyFoodRateStart: 1.18014,
    babyFoodRateEnd: 0.002314,
    adultFoodRate: 0.002314,
    ageSpeed: 0.0000036
  }),
  new Species({
    name: "Rex",
    diet: "carnivore",
    babyFoodRateStart: 1.18014,
    babyFoodRateEnd: 0.002314,
    adultFoodRate: 0.002314,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Rock Drake",
    diet: "rockdrake",
    babyFoodRateStart: 0.09435,
    babyFoodRateEnd: 0.000185,
    adultFoodRate: 0.000185,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Roll Rat",
    diet: "herbivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.0000048
  }),
  new Species({
    name: "Sabertooth",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Sarcosuchus",
    diet: "carnivore",
    babyFoodRateStart: 0.80478,
    babyFoodRateEnd: 0.001578,
    adultFoodRate: 0.001578,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Shinehorn",
    diet: "herbivore",
    babyFoodRateStart: 0.44268,
    babyFoodRateEnd: 0.000868,
    adultFoodRate: 0.000868,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Shadowmane",
    diet: "carnivore",
    babyFoodRateStart: 0.59007,
    babyFoodRateEnd: 0.001157,
    adultFoodRate: 0.001157,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Sinomacrops",
    diet: "sinomacrops",
    babyFoodRateStart: 0.66402,
    babyFoodRateEnd: 0.001302,
    adultFoodRate: 0.001302,
    ageSpeed: 0.000018
  }),
  new Species({
    name: "Snow Owl",
    diet: "carnivore",
    babyFoodRateStart: 0.944,
    babyFoodRateEnd: 0.01,
    adultFoodRate: 0.01,
    ageSpeed: 0.0000051
  }),
  new Species({
    name: "Spinosaurus",
    diet: "carnivore",
    babyFoodRateStart: 1.05366,
    babyFoodRateEnd: 0.002066,
    adultFoodRate: 0.002066,
    ageSpeed: 0.0000039
  }),
  new Species({
    name: "Stegosaurus",
    diet: "herbivore",
    babyFoodRateStart: 2.72391,
    babyFoodRateEnd: 0.005341,
    adultFoodRate: 0.005341,
    ageSpeed: 0.0000054
  }),
  new Species({
    name: "Tapejara",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000051
  }),
  new Species({
    name: "Terror Bird",
    diet: "carnivore",
    babyFoodRateStart: 0.80478,
    babyFoodRateEnd: 0.001578,
    adultFoodRate: 0.001578,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Therizinosaurus",
    diet: "herbivore",
    babyFoodRateStart: 1.18014,
    babyFoodRateEnd: 0.002314,
    adultFoodRate: 0.002314,
    ageSpeed: 0.0000024
  }),
  new Species({
    name: "Thorny Dragon",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Thylacoleo",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000057
  }),
  new Species({
    name: "Triceratops",
    diet: "herbivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Troodon",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000132
  }),
  new Species({
    name: "Tropeognathus",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.0000051
  }),
  new Species({
    name: "Tusoteuthis",
    diet: "carnivore",
    babyFoodRateStart: 2.55,
    babyFoodRateEnd: 0.005,
    adultFoodRate: 0.005,
    ageSpeed: 0.0000015
  }),
  new Species({
    name: "Velonasaur",
    diet: "carnivore",
    babyFoodRateStart: 0.78693,
    babyFoodRateEnd: 0.001543,
    adultFoodRate: 0.001543,
    ageSpeed: 0.000006
  }),
  new Species({
    name: "Vulture",
    diet: "carrion",
    babyFoodRateStart: 0.66402,
    babyFoodRateEnd: 0.001302,
    adultFoodRate: 0.001302,
    ageSpeed: 0.0000111
  }),
  new Species({
    name: "Voidwyrm",
    diet: "carnivore",
    babyFoodRateStart: 0.007215,
    babyFoodRateEnd: 0.000185,
    adultFoodRate: 0.000185,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Woolly Rhino",
    diet: "herbivore",
    babyFoodRateStart: 1.60956,
    babyFoodRateEnd: 0.003156,
    adultFoodRate: 0.003156,
    ageSpeed: 0.0000048
  }),
  new Species({
    name: "Wyvern",
    diet: "wyvern",
    babyFoodRateStart: 0.07215,
    babyFoodRateEnd: 0.000185,
    adultFoodRate: 0.000185,
    ageSpeed: 0.000003
  }),
  new Species({
    name: "Yutyrannus",
    diet: "carnivore",
    babyFoodRateStart: 1.18014,
    babyFoodRateEnd: 0.002314,
    adultFoodRate: 0.002314,
    ageSpeed: 0.0000015
  })
];

export default {
    food,
    diets,
    troughTypes,
    species,
};
