import { Species, SpeciesData, Diet, DietData, Food, FoodData } from "./types";

let food = (<FoodData[]>[
  {
    name: "Raw Fish Meat",
    stackSize: 40,
    spoilSeconds: 20 * 60,
    weight: 0.1
  },
  {
    name: "Cooked Fish Meat",
    stackSize: 50,
    spoilSeconds: 30 * 60,
    weight: 0.1
  },
  {
    name: "Raw Meat",
    stackSize: 40,
    spoilSeconds: 10 * 60,
    weight: 0.1
  },
  {
    name: "Cooked Meat",
    stackSize: 50,
    spoilSeconds: 20 * 60,
    weight: 0.1
  },
  {
    name: "Spoiled Meat",
    stackSize: 100,
    spoilSeconds: 1 * 60 * 60,
    weight: 0.1
  },
  {
    name: "Mejoberry",
    stackSize: 100,
    spoilSeconds: 10 * 60,
    weight: 0.1
  },
  {
    name: "Berry",
    stackSize: 100,
    spoilSeconds: 10 * 60,
    weight: 0.1
  },
  {
    name: "Vegetables",
    stackSize: 100,
    spoilSeconds: 5 * 60,
    weight: 0.1
  },
  {
    name: "Rare Flower",
    stackSize: 100,
    spoilSeconds: 3 * 24 * 60 * 60,
    weight: 0.15
  },
  {
    name: "Kibble",
    stackSize: 100,
    spoilSeconds: 3 * 24 * 60 * 60,
    weight: 0.1
  },
  {
    name: "Wyvern Milk",
    stackSize: 1,
    spoilSeconds: 30 * 60,
    weight: 0.1
  },
  {
    name: "Mutagen",
    stackSize: 1,
    spoilSeconds: 30 * 60,
    weight: 0.1
  },
  {
    name: "Primal Crystal",
    stackSize: 1,
    spoilSeconds: 3 * 60 * 60,
    weight: 1
  },
  {
    name: "Ambergris",
    stackSize: 1,
    spoilSeconds: 20 * 60,
    weight: 5
  },
  {
    name: "Nameless Venom",
    stackSize: 1,
    spoilSeconds: 30 * 60,
    weight: 0.1
  },
  {
    name: "Blood Pack",
    stackSize: 100,
    spoilSeconds: 30 * 60,
    weight: 0.05
  },
  {
    name: "Chitin",
    stackSize: 100,
    spoilSeconds: null,
    weight: 0.01
  },
  {
    name: "Sulfur",
    stackSize: 100,
    spoilSeconds: null,
    weight: 0.05
  }
]).reduce((acc, current) => { acc[current.name] = Food.from(current); return acc; }, <{[key:string]:Food}>{});

let diets = (<DietData[]>[
  {
    name: "Herbivore",
    food: {
      "Berry": 20,
      "Mejoberry": 30,
      "Vegetables": 40,
      "Kibble": 60
    }
  },
  {
    name: "Carnivore",
    food: {
      "Raw Fish Meat": 25,
      "Cooked Fish Meat": 12.5,
      "Raw Meat": 50,
      "Cooked Meat": 25,
      "Kibble": 60
    }
  },
  {
    name: "Omnivore",
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
    name: "Piscivore",
    food: {
      "Raw Fish Meat": 25,
      "Cooked Fish Meat": 12.5
    }
  },
  {
    name: "Carrion",
    food: {
      "Raw Fish Meat": 5,
      "Spoiled Meat": 50,
      "Raw Meat": 10
    }
  },
  {
    name: "Archaeopteryx",
    food: {
      "Chitin": 50
    }
  },
  {
    name: "Daeodon",
    food: {
      "Raw Fish Meat": 25,
      "Cooked Fish Meat": 12.5,
      "Raw Meat": 50,
      "Cooked Meat": 25,
      "Kibble": 60
    }
  },
  {
    name: "Microraptor",
    food: {
      "Raw Fish Meat": 25,
      "Cooked Fish Meat": 12.5,
      "Raw Meat": 50,
      "Cooked Meat": 25,
      "Kibble": 60,
      "Rare Flower": 60
    }
  }
]).reduce((acc, current) => { acc[current.name] = Diet.from(current, food); return acc; }, <{[key:string]:Diet}>{})

let troughTypes: Record<string, number> = {
  player: 1,
  normal: 4,
  tek: 100
};

let species = (<SpeciesData[]>[
  {
      name: "Allosaurus",
      diet: "Carnivore",
      baseFoodRate: 0.001852,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 380
  },
  {
      name: "Amargasaurus",
      diet: "Herbivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 475
  },
  {
      name: "Andrewsarchus",
      diet: "Omnivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.6,
      defaultWeight: 500
  },
  {
      name: "Anglerfish",
      diet: "Carnivore",
      baseFoodRate: 0.001852,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 350
  },
  {
      name: "Ankylosaurus",
      diet: "Herbivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 250
  },
  {
      name: "Araneo",
      diet: "Carrion",
      baseFoodRate: 0.001736,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3.7,
      defaultWeight: 100
  },
  {
      name: "Archaeopteryx",
      diet: "Archaeopteryx",
      baseFoodRate: 0.001302,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 6,
      defaultWeight: 30
  },
  {
      name: "Argentavis",
      diet: "Carnivore",
      baseFoodRate: 0.001852,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.7,
      defaultWeight: 400
  },
  {
      name: "Arthropluera",
      diet: "Carrion",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.8,
      defaultWeight: 100
  },
  {
      name: "Astrodelphis",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.7,
      defaultWeight: 280
  },
  {
      name: "Baryonyx",
      diet: "Piscivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 325
  },
  {
      name: "Basilosaurus",
      diet: "Carnivore",
      baseFoodRate: 0.002929,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 0.8,
      defaultWeight: 700
  },
  {
      name: "Beelzebufo",
      diet: "Carnivore",
      baseFoodRate: 0.001929,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 160
  },
  {
      name: "Bloodstalker",
      diet: "Bloodstalker",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.7,
      defaultWeight: 350
  },
  {
      name: "Brontosaurus",
      diet: "Herbivore",
      baseFoodRate: 0.007716,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 1600
  },
  {
      name: "Bulbdog",
      diet: "Omnivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 120
  },
  {
      name: "Carbonemys",
      diet: "Herbivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 4,
      defaultWeight: 270
  },
  {
      name: "Carcharodontosaurus",
      diet: "Carnivore",
      baseFoodRate: 0.002314,
      babyFoodRate: 35,
      extraBabyFoodRate: 20,
      extraAdultFoodRate: 3,
      ageSpeed: 0.000003,
      ageSpeedMult: 0.3795,
      defaultWeight: 650
  },
  {
      name: "Carnotaurus",
      diet: "Carnivore",
      baseFoodRate: 0.001852,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 300
  },
  {
      name: "Castoroides",
      diet: "Herbivore",
      baseFoodRate: 0.002314,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.5,
      defaultWeight: 300
  },
  {
      name: "Chalicotherium",
      diet: "Herbivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.125,
      defaultWeight: 400
  },
  {
      name: "Compsognathus",
      diet: "Carnivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 4.4,
      defaultWeight: 25
  },
  {
      name: "Crystal Wyvern",
      diet: "crystalwyvern",
      baseFoodRate: 0.000185,
      babyFoodRate: 19.25,
      extraBabyFoodRate: 6,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 300
  },
  {
      name: "Daeodon",
      diet: "Daeodon",
      baseFoodRate: 0.01,
      babyFoodRate: 5,
      extraBabyFoodRate: 8,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 400
  },
  {
      name: "Deinonychus",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 140
  },
  {
      name: "Desmodus",
      diet: "Bloodstalker",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.3,
      defaultWeight: 350
  },
  {
      name: "Dilophosaurus",
      diet: "Carnivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 4.4,
      defaultWeight: 45
  },
  {
      name: "Dimetrodon",
      diet: "Carnivore",
      baseFoodRate: 0.001736,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 250
  },
  {
      name: "Dimorphodon",
      diet: "Carnivore",
      baseFoodRate: 0.001302,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3.7,
      defaultWeight: 50
  },
  {
      name: "Dinopithecus",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 350
  },
  {
      name: "Diplocaulus",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 150
  },
  {
      name: "Diplodocus",
      diet: "Herbivore",
      baseFoodRate: 0.007716,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 800
  },
  {
      name: "Direbear",
      diet: "Omnivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 650
  },
  {
      name: "Direwolf",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 170
  },
  {
      name: "Dodo",
      diet: "Herbivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 6,
      defaultWeight: 50
  },
  {
      name: "Doedicurus",
      diet: "Herbivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.6,
      defaultWeight: 250
  },
  {
      name: "Dunkleosteus",
      diet: "Carnivore",
      baseFoodRate: 0.001852,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.125,
      defaultWeight: 910
  },
  {
      name: "Electrophorus",
      diet: "Carnivore",
      baseFoodRate: 0.002929,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 150
  },
  {
      name: "Equus",
      diet: "Herbivore",
      baseFoodRate: 0.001929,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 350
  },
  {
      name: "Featherlight",
      diet: "Carnivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 70
  },
  {
      name: "Ferox",
      diet: "Carnivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 55
  },
  {
      name: "Fjordhawk",
      diet: "Omnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 65
  },
  {
      name: "Gacha",
      diet: "Omnivore",
      baseFoodRate: 0.01,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 0.8,
      defaultWeight: 380
  },
  {
      name: "Gallimimus",
      diet: "Herbivore",
      baseFoodRate: 0.001929,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3.5,
      defaultWeight: 270
  },
  {
      name: "Gasbag",
      diet: "Herbivore",
      baseFoodRate: 0.002066,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 3000
  },
  {
      name: "Giganotosaurus",
      diet: "Carnivore",
      baseFoodRate: 0.002314,
      babyFoodRate: 45,
      extraBabyFoodRate: 20,
      extraAdultFoodRate: 3,
      ageSpeed: 0.000003,
      ageSpeedMult: 0.3795,
      defaultWeight: 700
  },
  {
      name: "Gigantopithecus",
      diet: "Herbivore",
      baseFoodRate: 0.004156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.2,
      defaultWeight: 220
  },
  {
      name: "Gigantoraptor",
      diet: "Carnivore",
      baseFoodRate: 0.002314,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 380
  },
  {
      name: "Glowtail",
      diet: "Carnivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 70
  },
  {
      name: "Hesperornis",
      diet: "Carnivore",
      baseFoodRate: 0.001389,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3.3,
      defaultWeight: 70
  },
  {
      name: "Hyaenodon",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 170
  },
  {
      name: "Ichthyornis",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 55
  },
  {
      name: "Ichthyosaurus",
      diet: "Carnivore",
      baseFoodRate: 0.001929,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.6,
      defaultWeight: 250
  },
  {
      name: "Iguanodon",
      diet: "Herbivore",
      baseFoodRate: 0.001929,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 375
  },
  {
      name: "Jerboa",
      diet: "Herbivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 4.4,
      defaultWeight: 120
  },
  {
      name: "Kairuku",
      diet: "Carnivore",
      baseFoodRate: 0.001389,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3.3,
      defaultWeight: 70
  },
  {
      name: "Kaprosuchus",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 140
  },
  {
      name: "Kentrosaurus",
      diet: "Herbivore",
      baseFoodRate: 0.005341,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.8,
      defaultWeight: 500
  },
  {
      name: "Lymantria",
      diet: "Herbivore",
      baseFoodRate: 0.001852,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3,
      defaultWeight: 175
  },
  {
      name: "Lystrosaurus",
      diet: "Herbivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 6,
      defaultWeight: 90
  },
  {
      name: "Maewing",
      diet: "Carnivore",
      baseFoodRate: 0.01,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 400
  },
  {
      name: "Magmasaur",
      diet: "magmasaur",
      baseFoodRate: 0.000385,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 0.5,
      defaultWeight: 550
  },
  {
      name: "Mammoth",
      diet: "Herbivore",
      baseFoodRate: 0.004133,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.125,
      defaultWeight: 500
  },
  {
      name: "Managarmr",
      diet: "Carnivore",
      baseFoodRate: 0.001852,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 300
  },
  {
      name: "Manta",
      diet: "Carnivore",
      baseFoodRate: 0.001929,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 200
  },
  {
      name: "Mantis",
      diet: "carrion_",
      baseFoodRate: 0.002314,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.7,
      defaultWeight: 220
  },
  {
      name: "Megachelon",
      diet: "Omnivore",
      baseFoodRate: 0.01,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 2500
  },
  {
      name: "Megalania",
      diet: "Carnivore",
      baseFoodRate: 0.001736,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 400
  },
  {
      name: "Megaloceros",
      diet: "Herbivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.3,
      defaultWeight: 220
  },
  {
      name: "Megalodon",
      diet: "Carnivore",
      baseFoodRate: 0.001852,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 250
  },
  {
      name: "Megalosaurus",
      diet: "Carnivore",
      baseFoodRate: 0.001852,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 300
  },
  {
      name: "Megatherium",
      diet: "Omnivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 725
  },
  {
      name: "Mesopithecus",
      diet: "Herbivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3,
      defaultWeight: 70
  },
  {
      name: "Microraptor",
      diet: "Microraptor",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.7,
      defaultWeight: 45
  },
  {
      name: "Morellatops",
      diet: "Herbivore",
      baseFoodRate: 0.005341,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3,
      defaultWeight: 440
  },
  {
      name: "Mosasaurus",
      diet: "Carnivore",
      baseFoodRate: 0.005,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 0.5,
      defaultWeight: 1300
  },
  {
      name: "Moschops",
      diet: "Omnivore",
      baseFoodRate: 0.001736,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 200
  },
  {
      name: "Onyc",
      diet: "Carnivore",
      baseFoodRate: 0.002893,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3.3,
      defaultWeight: 50
  },
  {
      name: "Otter",
      diet: "Piscivore",
      baseFoodRate: 0.002314,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 4.4,
      defaultWeight: 30
  },
  {
      name: "Oviraptor",
      diet: "Carnivore",
      baseFoodRate: 0.001302,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 4.4,
      defaultWeight: 100
  },
  {
      name: "Ovis",
      diet: "Herbivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 90
  },
  {
      name: "Pachycephalosaurus",
      diet: "Herbivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3.5,
      defaultWeight: 150
  },
  {
      name: "Pachyrhinosaurus",
      diet: "Herbivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 365
  },
  {
      name: "Paraceratherium",
      diet: "Herbivore",
      baseFoodRate: 0.0035,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 850
  },
  {
      name: "Parasaurolophus",
      diet: "Herbivore",
      baseFoodRate: 0.001929,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3.5,
      defaultWeight: 480
  },
  {
      name: "Pegomastax",
      diet: "Herbivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3,
      defaultWeight: 55
  },
  {
      name: "Pelagornis",
      diet: "Piscivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 150
  },
  {
      name: "Phiomia",
      diet: "Herbivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 200
  },
  {
      name: "Plesiosaurus",
      diet: "Carnivore",
      baseFoodRate: 0.003858,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 0.8,
      defaultWeight: 800
  },
  {
      name: "Procoptodon",
      diet: "Herbivore",
      baseFoodRate: 0.001929,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 550
  },
  {
      name: "Pteranodon",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 120
  },
  {
      name: "Pulmonoscorpius",
      diet: "carrion_",
      baseFoodRate: 0.001929,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 200
  },
  {
      name: "Purlovia",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 400
  },
  {
      name: "Quetzalcoatlus",
      diet: "Carnivore",
      baseFoodRate: 0.0035,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 0.7,
      defaultWeight: 800
  },
  {
      name: "Raptor",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2.5,
      defaultWeight: 140
  },
  {
      name: "Ravager",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 500
  },
  {
      name: "Reaper",
      diet: "Carnivore",
      baseFoodRate: 0.002314,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.2,
      defaultWeight: 415
  },
  {
      name: "Rex",
      diet: "Carnivore",
      baseFoodRate: 0.002314,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 500
  },
  {
      name: "Rock Drake",
      diet: "rockdrake",
      baseFoodRate: 0.000185,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 400
  },
  {
      name: "Roll Rat",
      diet: "Herbivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.6,
      defaultWeight: 400
  },
  {
      name: "Sabertooth",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 200
  },
  {
      name: "Sarcosuchus",
      diet: "Carnivore",
      baseFoodRate: 0.001578,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 300
  },
  {
      name: "Shinehorn",
      diet: "Herbivore",
      baseFoodRate: 0.000868,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 100
  },
  {
      name: "Shadowmane",
      diet: "Carnivore",
      baseFoodRate: 0.001157,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 425
  },
  {
      name: "Sinomacrops",
      diet: "sinomacrops",
      baseFoodRate: 0.001302,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 6,
      defaultWeight: 80
  },
  {
      name: "Snow Owl",
      diet: "Carnivore",
      baseFoodRate: 0.01,
      babyFoodRate: 4.72,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.7,
      defaultWeight: 375
  },
  {
      name: "Spinosaurus",
      diet: "Carnivore",
      baseFoodRate: 0.002066,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.3,
      defaultWeight: 350
  },
  {
      name: "Stegosaurus",
      diet: "Herbivore",
      baseFoodRate: 0.005341,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.8,
      defaultWeight: 500
  },
  {
      name: "Tapejara",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.7,
      defaultWeight: 280
  },
  {
      name: "Terror Bird",
      diet: "Carnivore",
      baseFoodRate: 0.001578,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 120
  },
  {
      name: "Therizinosaurus",
      diet: "Herbivore",
      baseFoodRate: 0.002314,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 0.8,
      defaultWeight: 365
  },
  {
      name: "Thorny Dragon",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 300
  },
  {
      name: "Thylacoleo",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.9,
      defaultWeight: 400
  },
  {
      name: "Triceratops",
      diet: "Herbivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 365
  },
  {
      name: "Troodon",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 4.4,
      defaultWeight: 140
  },
  {
      name: "Tropeognathus",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.7,
      defaultWeight: 340
  },
  {
      name: "Tusoteuthis",
      diet: "Carnivore",
      baseFoodRate: 0.005,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 0.5,
      defaultWeight: 800
  },
  {
      name: "Velonasaur",
      diet: "Carnivore",
      baseFoodRate: 0.001543,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 2,
      defaultWeight: 325
  },
  {
      name: "Vulture",
      diet: "Carrion",
      baseFoodRate: 0.001302,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 3.7,
      defaultWeight: 50
  },
  {
      name: "Voidwyrm",
      diet: "Carnivore",
      baseFoodRate: 0.000185,
      babyFoodRate: 13,
      extraBabyFoodRate: 3,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 400
  },
  {
      name: "Woolly Rhino",
      diet: "Herbivore",
      baseFoodRate: 0.003156,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 1.6,
      defaultWeight: 750
  },
  {
      name: "Wyvern",
      diet: "wyvern",
      baseFoodRate: 0.000185,
      babyFoodRate: 13,
      extraBabyFoodRate: 30,
      ageSpeed: 0.000003,
      ageSpeedMult: 1,
      defaultWeight: 400
  },
  {
      name: "Yutyrannus",
      diet: "Carnivore",
      baseFoodRate: 0.002314,
      babyFoodRate: 25.5,
      extraBabyFoodRate: 20,
      ageSpeed: 0.000003,
      ageSpeedMult: 0.5,
      defaultWeight: 500
    }
]).reduce((acc, current) => { acc[current.name] = Species.from(current, diets); return acc; }, <{[key:string]:Species}>{});

export default {
  food,
  diets,
  troughTypes,
  species,
};
