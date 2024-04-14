import { Species, Diet, Food } from "./types";

let food: Food[] = [
  new Food({
    name: "Raw Fish Meat",
    stackSize: 40,
    spoilSeconds: 20 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Cooked Fish Meat",
    stackSize: 50,
    spoilSeconds: 30 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Raw Meat",
    stackSize: 40,
    spoilSeconds: 10 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Cooked Meat",
    stackSize: 50,
    spoilSeconds: 20 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Spoiled Meat",
    stackSize: 100,
    spoilSeconds: 1 * 60 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Mejoberry",
    stackSize: 100,
    spoilSeconds: 10 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Berry",
    stackSize: 100,
    spoilSeconds: 10 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Vegetables",
    stackSize: 100,
    spoilSeconds: 5 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Rare Flower",
    stackSize: 100,
    spoilSeconds: 3 * 24 * 60 * 60,
    weight: 0.15
  }),
  new Food({
    name: "Kibble",
    stackSize: 100,
    spoilSeconds: 3 * 24 * 60 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Wyvern Milk",
    stackSize: 1,
    spoilSeconds: 30 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Mutagen",
    stackSize: 1,
    spoilSeconds: 30 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Primal Crystal",
    stackSize: 1,
    spoilSeconds: 3 * 60 * 60,
    weight: 1
  }),
  new Food({
    name: "Ambergris",
    stackSize: 1,
    spoilSeconds: 20 * 60,
    weight: 5
  }),
  new Food({
    name: "Nameless Venom",
    stackSize: 1,
    spoilSeconds: 30 * 60,
    weight: 0.1
  }),
  new Food({
    name: "Blood Pack",
    stackSize: 100,
    spoilSeconds: 30 * 60,
    weight: 0.05
  }),
  new Food({
    name: "Chitin",
    stackSize: 100,
    spoilSeconds: null,
    weight: 0.01
  }),
  new Food({
    name: "Sulfur",
    stackSize: 100,
    spoilSeconds: null,
    weight: 0.05
  })
];

let diets: Diet[] = [
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

let troughTypes: Record<string, number> = {
  player: 1,
  normal: 4,
  tek: 100
};

let species: Species[] = [
  new Species({
    name: "Allosaurus",
    diet: "carnivore",
    baseFoodRate: 0.001852,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 380
  }),
  new Species({
    name: "Amargasaurus",
    diet: "herbivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 475
  }),
  new Species({
    name: "Andrewsarchus",
    diet: "omnivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.6,
    weight: 500
  }),
  new Species({
    name: "Anglerfish",
    diet: "carnivore",
    baseFoodRate: 0.001852,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 350
  }),
  new Species({
    name: "Ankylosaurus",
    diet: "herbivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 250
  }),
  new Species({
    name: "Araneo",
    diet: "carrion",
    baseFoodRate: 0.001736,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3.7,
    weight: 100
  }),
  new Species({
    name: "Archaeopteryx",
    diet: "archaeopteryx",
    baseFoodRate: 0.001302,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 6,
    weight: 30
  }),
  new Species({
    name: "Argentavis",
    diet: "carnivore",
    baseFoodRate: 0.001852,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.7,
    weight: 400
  }),
  new Species({
    name: "Arthropluera",
    diet: "carrion",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.8,
    weight: 100
  }),
  new Species({
    name: "Astrodelphis",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.7,
    weight: 280
  }),
  new Species({
    name: "Baryonyx",
    diet: "piscivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 325
  }),
  new Species({
    name: "Basilosaurus",
    diet: "carnivore",
    baseFoodRate: 0.002929,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 0.8,
    weight: 700
  }),
  new Species({
    name: "Beelzebufo",
    diet: "carnivore",
    baseFoodRate: 0.001929,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 160
  }),
  new Species({
    name: "Bloodstalker",
    diet: "bloodstalker",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.7,
    weight: 350
  }),
  new Species({
    name: "Brontosaurus",
    diet: "herbivore",
    baseFoodRate: 0.007716,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 1600
  }),
  new Species({
    name: "Bulbdog",
    diet: "omnivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 120
  }),
  new Species({
    name: "Carbonemys",
    diet: "herbivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 4,
    weight: 270
  }),
  new Species({
    name: "Carcharodontosaurus",
    diet: "carnivore",
    baseFoodRate: 0.002314,
    babyFoodRate: 35,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 0.3795,
    weight: 650
  }),
  new Species({
    name: "Carnotaurus",
    diet: "carnivore",
    baseFoodRate: 0.001852,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 300
  }),
  new Species({
    name: "Castoroides",
    diet: "herbivore",
    baseFoodRate: 0.002314,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.5,
    weight: 300
  }),
  new Species({
    name: "Chalicotherium",
    diet: "herbivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.125,
    weight: 400
  }),
  new Species({
    name: "Compsognathus",
    diet: "carnivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 4.4,
    weight: 25
  }),
  new Species({
    name: "Crystal Wyvern",
    diet: "crystalwyvern",
    baseFoodRate: 0.000185,
    babyFoodRate: 19.25,
    extraBabyFoodRate: 6,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 300
  }),
  new Species({
    name: "Daeodon",
    diet: "carnivore",
    baseFoodRate: 0.01,
    babyFoodRate: 5,
    extraBabyFoodRate: 8,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 400
  }),
  new Species({
    name: "Deinonychus",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 140
  }),
  new Species({
    name: "Desmodus",
    diet: "bloodstalker",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.3,
    weight: 350
  }),
  new Species({
    name: "Dilophosaurus",
    diet: "carnivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 4.4,
    weight: 45
  }),
  new Species({
    name: "Dimetrodon",
    diet: "carnivore",
    baseFoodRate: 0.001736,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 250
  }),
  new Species({
    name: "Dimorphodon",
    diet: "carnivore",
    baseFoodRate: 0.001302,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3.7,
    weight: 50
  }),
  new Species({
    name: "Dinopithecus",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 350
  }),
  new Species({
    name: "Diplocaulus",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 150
  }),
  new Species({
    name: "Diplodocus",
    diet: "herbivore",
    baseFoodRate: 0.007716,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 800
  }),
  new Species({
    name: "Direbear",
    diet: "omnivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 650
  }),
  new Species({
    name: "Direwolf",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 170
  }),
  new Species({
    name: "Dodo",
    diet: "herbivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 6,
    weight: 50
  }),
  new Species({
    name: "Doedicurus",
    diet: "herbivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.6,
    weight: 250
  }),
  new Species({
    name: "Dunkleosteus",
    diet: "carnivore",
    baseFoodRate: 0.001852,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.125,
    weight: 910
  }),
  new Species({
    name: "Electrophorus",
    diet: "carnivore",
    baseFoodRate: 0.002929,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 150
  }),
  new Species({
    name: "Equus",
    diet: "herbivore",
    baseFoodRate: 0.001929,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 350
  }),
  new Species({
    name: "Featherlight",
    diet: "carnivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 70
  }),
  new Species({
    name: "Ferox",
    diet: "carnivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 55
  }),
  new Species({
    name: "Fjordhawk",
    diet: "omnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 65
  }),
  new Species({
    name: "Gacha",
    diet: "omnivore",
    baseFoodRate: 0.01,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 0.8,
    weight: 380
  }),
  new Species({
    name: "Gallimimus",
    diet: "herbivore",
    baseFoodRate: 0.001929,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3.5,
    weight: 270
  }),
  new Species({
    name: "Gasbag",
    diet: "herbivore",
    baseFoodRate: 0.002066,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 3000
  }),
  new Species({
    name: "Giganotosaurus",
    diet: "carnivore",
    baseFoodRate: 0.002314,
    babyFoodRate: 45,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 0.3795,
    weight: 700
  }),
  new Species({
    name: "Gigantopithecus",
    diet: "herbivore",
    baseFoodRate: 0.004156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.2,
    weight: 220
  }),
  new Species({
    name: "Gigantoraptor",
    diet: "carnivore",
    baseFoodRate: 0.002314,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 380
  }),
  new Species({
    name: "Glowtail",
    diet: "carnivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 70
  }),
  new Species({
    name: "Hesperornis",
    diet: "carnivore",
    baseFoodRate: 0.001389,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3.3,
    weight: 70
  }),
  new Species({
    name: "Hyaenodon",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 170
  }),
  new Species({
    name: "Ichthyornis",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 55
  }),
  new Species({
    name: "Ichthyosaurus",
    diet: "carnivore",
    baseFoodRate: 0.001929,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.6,
    weight: 250
  }),
  new Species({
    name: "Iguanodon",
    diet: "herbivore",
    baseFoodRate: 0.001929,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 375
  }),
  new Species({
    name: "Jerboa",
    diet: "herbivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 4.4,
    weight: 120
  }),
  new Species({
    name: "Kairuku",
    diet: "carnivore",
    baseFoodRate: 0.001389,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3.3,
    weight: 70
  }),
  new Species({
    name: "Kaprosuchus",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 140
  }),
  new Species({
    name: "Kentrosaurus",
    diet: "herbivore",
    baseFoodRate: 0.005341,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.8,
    weight: 500
  }),
  new Species({
    name: "Lymantria",
    diet: "herbivore",
    baseFoodRate: 0.001852,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3,
    weight: 175
  }),
  new Species({
    name: "Lystrosaurus",
    diet: "herbivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 6,
    weight: 90
  }),
  new Species({
    name: "Maewing",
    diet: "carnivore",
    baseFoodRate: 0.01,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 400
  }),
  new Species({
    name: "Magmasaur",
    diet: "magmasaur",
    baseFoodRate: 0.000385,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 0.5,
    weight: 550
  }),
  new Species({
    name: "Mammoth",
    diet: "herbivore",
    baseFoodRate: 0.004133,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.125,
    weight: 500
  }),
  new Species({
    name: "Managarmr",
    diet: "carnivore",
    baseFoodRate: 0.001852,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 300
  }),
  new Species({
    name: "Manta",
    diet: "carnivore",
    baseFoodRate: 0.001929,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 200
  }),
  new Species({
    name: "Mantis",
    diet: "carrion_",
    baseFoodRate: 0.002314,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.7,
    weight: 220
  }),
  new Species({
    name: "Megachelon",
    diet: "omnivore",
    baseFoodRate: 0.01,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 2500
  }),
  new Species({
    name: "Megalania",
    diet: "carnivore",
    baseFoodRate: 0.001736,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 400
  }),
  new Species({
    name: "Megaloceros",
    diet: "herbivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.3,
    weight: 220
  }),
  new Species({
    name: "Megalodon",
    diet: "carnivore",
    baseFoodRate: 0.001852,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 250
  }),
  new Species({
    name: "Megalosaurus",
    diet: "carnivore",
    baseFoodRate: 0.001852,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 300
  }),
  new Species({
    name: "Megatherium",
    diet: "omnivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 725
  }),
  new Species({
    name: "Mesopithecus",
    diet: "herbivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3,
    weight: 70
  }),
  new Species({
    name: "Microraptor",
    diet: "microraptor",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.7,
    weight: 45
  }),
  new Species({
    name: "Morellatops",
    diet: "herbivore",
    baseFoodRate: 0.005341,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3,
    weight: 440
  }),
  new Species({
    name: "Mosasaurus",
    diet: "carnivore",
    baseFoodRate: 0.005,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 0.5,
    weight: 1300
  }),
  new Species({
    name: "Moschops",
    diet: "omnivore",
    baseFoodRate: 0.001736,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 200
  }),
  new Species({
    name: "Onyc",
    diet: "carnivore",
    baseFoodRate: 0.002893,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3.3,
    weight: 50
  }),
  new Species({
    name: "Otter",
    diet: "piscivore",
    baseFoodRate: 0.002314,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 4.4,
    weight: 30
  }),
  new Species({
    name: "Oviraptor",
    diet: "carnivore",
    baseFoodRate: 0.001302,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 4.4,
    weight: 100
  }),
  new Species({
    name: "Ovis",
    diet: "herbivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 90
  }),
  new Species({
    name: "Pachycephalosaurus",
    diet: "herbivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3.5,
    weight: 150
  }),
  new Species({
    name: "Pachyrhinosaurus",
    diet: "herbivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 365
  }),
  new Species({
    name: "Paraceratherium",
    diet: "herbivore",
    baseFoodRate: 0.0035,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 850
  }),
  new Species({
    name: "Parasaurolophus",
    diet: "herbivore",
    baseFoodRate: 0.001929,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3.5,
    weight: 480
  }),
  new Species({
    name: "Pegomastax",
    diet: "herbivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3,
    weight: 55
  }),
  new Species({
    name: "Pelagornis",
    diet: "piscivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 150
  }),
  new Species({
    name: "Phiomia",
    diet: "herbivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 200
  }),
  new Species({
    name: "Plesiosaurus",
    diet: "carnivore",
    baseFoodRate: 0.003858,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 0.8,
    weight: 800
  }),
  new Species({
    name: "Procoptodon",
    diet: "herbivore",
    baseFoodRate: 0.001929,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 550
  }),
  new Species({
    name: "Pteranodon",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 120
  }),
  new Species({
    name: "Pulmonoscorpius",
    diet: "carrion_",
    baseFoodRate: 0.001929,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 200
  }),
  new Species({
    name: "Purlovia",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 400
  }),
  new Species({
    name: "Quetzalcoatlus",
    diet: "carnivore",
    baseFoodRate: 0.0035,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 0.7,
    weight: 800
  }),
  new Species({
    name: "Raptor",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2.5,
    weight: 140
  }),
  new Species({
    name: "Ravager",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 500
  }),
  new Species({
    name: "Reaper",
    diet: "carnivore",
    baseFoodRate: 0.002314,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.2,
    weight: 415
  }),
  new Species({
    name: "Rex",
    diet: "carnivore",
    baseFoodRate: 0.002314,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 500
  }),
  new Species({
    name: "Rock Drake",
    diet: "rockdrake",
    baseFoodRate: 0.000185,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 400
  }),
  new Species({
    name: "Roll Rat",
    diet: "herbivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.6,
    weight: 400
  }),
  new Species({
    name: "Sabertooth",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 200
  }),
  new Species({
    name: "Sarcosuchus",
    diet: "carnivore",
    baseFoodRate: 0.001578,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 300
  }),
  new Species({
    name: "Shinehorn",
    diet: "herbivore",
    baseFoodRate: 0.000868,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 100
  }),
  new Species({
    name: "Shadowmane",
    diet: "carnivore",
    baseFoodRate: 0.001157,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 425
  }),
  new Species({
    name: "Sinomacrops",
    diet: "sinomacrops",
    baseFoodRate: 0.001302,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 6,
    weight: 80
  }),
  new Species({
    name: "Snow Owl",
    diet: "carnivore",
    baseFoodRate: 0.01,
    babyFoodRate: 4.72,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.7,
    weight: 375
  }),
  new Species({
    name: "Spinosaurus",
    diet: "carnivore",
    baseFoodRate: 0.002066,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.3,
    weight: 350
  }),
  new Species({
    name: "Stegosaurus",
    diet: "herbivore",
    baseFoodRate: 0.005341,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.8,
    weight: 500
  }),
  new Species({
    name: "Tapejara",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.7,
    weight: 280
  }),
  new Species({
    name: "Terror Bird",
    diet: "carnivore",
    baseFoodRate: 0.001578,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 120
  }),
  new Species({
    name: "Therizinosaurus",
    diet: "herbivore",
    baseFoodRate: 0.002314,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 0.8,
    weight: 365
  }),
  new Species({
    name: "Thorny Dragon",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 300
  }),
  new Species({
    name: "Thylacoleo",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.9,
    weight: 400
  }),
  new Species({
    name: "Triceratops",
    diet: "herbivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 365
  }),
  new Species({
    name: "Troodon",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 4.4,
    weight: 140
  }),
  new Species({
    name: "Tropeognathus",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.7,
    weight: 340
  }),
  new Species({
    name: "Tusoteuthis",
    diet: "carnivore",
    baseFoodRate: 0.005,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 0.5,
    weight: 800
  }),
  new Species({
    name: "Velonasaur",
    diet: "carnivore",
    baseFoodRate: 0.001543,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 2,
    weight: 325
  }),
  new Species({
    name: "Vulture",
    diet: "carrion",
    baseFoodRate: 0.001302,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 3.7,
    weight: 50
  }),
  new Species({
    name: "Voidwyrm",
    diet: "carnivore",
    baseFoodRate: 0.000185,
    babyFoodRate: 13,
    extraBabyFoodRate: 3,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 400
  }),
  new Species({
    name: "Woolly Rhino",
    diet: "herbivore",
    baseFoodRate: 0.003156,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 1.6,
    weight: 750
  }),
  new Species({
    name: "Wyvern",
    diet: "wyvern",
    baseFoodRate: 0.000185,
    babyFoodRate: 13,
    extraBabyFoodRate: 30,
    ageSpeed: 0.000003,
    ageSpeedMult: 1,
    weight: 400
  }),
  new Species({
    name: "Yutyrannus",
    diet: "carnivore",
    baseFoodRate: 0.002314,
    babyFoodRate: 25.5,
    extraBabyFoodRate: 20,
    ageSpeed: 0.000003,
    ageSpeedMult: 0.5,
    weight: 500
  })
];

export default {
  food,
  diets,
  troughTypes,
  species,
};
