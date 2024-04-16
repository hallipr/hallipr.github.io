// Provides trough class for food calculations
import { DateTime, Duration } from "luxon"

export class Trough {
  id: number
  name: string
  entries: TroughEntry[]
  foodStacks: { [key: string]: number }

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.entries = []
    this.foodStacks = {}
  }
}

export class TroughEntry {
  public id: number
  public species: Species
  public count: number = 0
  public checkedAge: number = 0
  public maxHealth: number = 0
  public maxFood: number = 0
  public checkTime: DateTime = DateTime.now()
  public multipliers: Multipliers;

  constructor(id: number, species: Species, multipliers: Multipliers) {
    this.id = id;
    this.species = species;
    this.multipliers = multipliers;
  }

  getNextEvent(fromTime: DateTime): { time: DateTime, event: string } | null {
    let fromAge = this.getAgeAtTime(fromTime);
    let timeToAdult = this.getTimeToAdult(fromAge);
    let timeToJuvenile = this.getTimeToJuvenile(fromAge);
    let juvenileAge = this.species.adultAge / 10;

    if (fromAge < juvenileAge) {
      return { time: fromTime.plus({ seconds: timeToJuvenile }), event: "Juvenile" };
    } else if (fromAge < this.species.adultAge) {
      return { time: fromTime.plus({ seconds: timeToAdult }), event: "Adult" };
    } else {
      return null;
    }
  }

  // returns the food type consumed, beginning rate and rate decay
  getNextFood(fromTime: DateTime<true>, troughFood: { name: string, count: number }[]): { food: Food, rate: number, decay: number } | null {
    let food = this.species.diet.food.find(f => troughFood.some(tf => tf.name === f.food.name));
    if (!food) return null;

    let fromAge = this.getAgeAtTime(fromTime);
    let foodRate = this.species.getFoodRate(fromAge, this.multipliers);
    let rateDecay = this.species.getFoodRateDecay(this.multipliers);

    return { food: food.food, rate: foodRate / food.foodPoints, decay: rateDecay / food.foodPoints };
  }

  getAgeAtTime(time: DateTime): number {
    let elapsed = time.diff(this.checkTime).as('seconds');
    return Math.min(this.checkedAge + elapsed * this.multipliers.maturation, this.species.adultAge)
  }

  getTimeToJuvenile(fromAge: number): number {
    let juvenileAge = this.species.adultAge / 10;
    return this.getTimeBetweenAges(fromAge, juvenileAge);
  }

  getTimeToAdult(fromAge: number): number {
    return this.getTimeBetweenAges(fromAge, this.species.adultAge);
  }

  getTimeBetweenAges(fromAge: number, toAge: number): number {
    return Math.max(toAge - fromAge, 0) / this.multipliers.maturation;
  }
}

export interface Multipliers {
  maturation: number,
  consumption: number,
}

export interface SpeciesData {
  name: string
  diet: string
  baseFoodRate: number
  babyFoodRate: number
  extraBabyFoodRate: number
  extraAdultFoodRate?: number
  ageSpeed: number
  ageSpeedMult: number
  defaultWeight: number
}

export class Species {
  name: string;
  diet: Diet;
  defaultWeight: number;
  adultAge: number;
  babyFoodRateStart: number;
  babyFoodRateEnd: number;
  adultFoodRate: number;

  constructor(data: { name: string; diet: Diet; defaultWeight: number; adultAge: number; babyFoodRateStart: number; babyFoodRateEnd: number; adultFoodRate: number }) {
    this.name = data.name;
    this.diet = data.diet;
    this.defaultWeight = data.defaultWeight;
    this.adultAge = data.adultAge;
    this.babyFoodRateStart = data.babyFoodRateStart;
    this.babyFoodRateEnd = data.babyFoodRateEnd;
    this.adultFoodRate = data.adultFoodRate;
  }

  static from(data: SpeciesData, diets: { [key: string]: Diet }) {
    return new Species({
      name: data.name,
      diet: diets[data.diet],
      defaultWeight: data.defaultWeight,
      adultAge: 1 / data.ageSpeed,
      babyFoodRateStart: data.baseFoodRate * data.babyFoodRate * data.extraBabyFoodRate,
      babyFoodRateEnd: data.baseFoodRate,
      adultFoodRate: data.baseFoodRate * (data.extraAdultFoodRate ?? 1),
    });
  }

  getAge(startAge: number, duration: number, multipliers: Multipliers): number {
    return Math.min(startAge + duration * multipliers.maturation, this.adultAge);
  }

  getFoodRate(age: number, multipliers: Multipliers): number {
    if (age >= 1.0) return this.adultFoodRate * multipliers.consumption;

    return (this.babyFoodRateStart + (this.babyFoodRateEnd - this.babyFoodRateStart) * age) * multipliers.consumption;
  };

  getFoodRateDecay(multipliers: Multipliers): number {
    return (this.babyFoodRateEnd - this.babyFoodRateStart) * multipliers.consumption / this.adultAge * multipliers.maturation;
  }

  getFoodPointsConsumed(startAge: number, duration: number, multipliers: Multipliers) {
    let endAge = this.getAge(startAge, duration, multipliers);
    let startRate = this.getFoodRate(startAge, multipliers);
    let endRate = this.getFoodRate(endAge, multipliers);

    return (startRate + endRate) * duration / 2;
  };
}

export interface FoodData {
  name: string
  stackSize: number
  spoilSeconds: number | null
  weight: number
}

export class Food {
  name: string
  stackSize: number;
  spoilTime: Duration | null;
  weight: number;

  constructor(data: {
    name: string,
    stackSize: number,
    spoilTime: Duration | null,
    weight: number
  }) {
    this.name = data.name
    this.stackSize = data.stackSize
    this.weight = data.weight
    this.spoilTime = data.spoilTime
  }

  static from(data: FoodData) {
    return new Food({
      name: data.name,
      stackSize: data.stackSize,
      spoilTime: data.spoilSeconds ? Duration.fromObject({ seconds: data.spoilSeconds }) : null,
      weight: data.weight,
    });
  }
}

export interface DietData {
  name: string
  food: {
    [key: string]: number
  }
}

export class Diet {
  name!: string;
  food!: { food: Food, foodPoints: number }[]

  constructor(data: { name: string, food: { food: Food, foodPoints: number }[] }) {
    this.name = data.name
    this.food = data.food
  }

  static from(data: DietData, foods: { [key: string]: Food }) {
    return new Diet({
      name: data.name,
      food: Object.keys(data.food).map(key => {
        return { food: foods[key], foodPoints: data.food[key] }
      })
    });
  }
}
