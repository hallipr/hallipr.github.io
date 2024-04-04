// Provides trough class for food calculations
import { DateTime } from "luxon"

export class Trough {
  creatures: TroughEntry[]
  foodStacks: { [key: string]: number } = {}
  id!: number
  name!: string

  constructor(props: Partial<Trough>) {
    Object.assign(this, props)
    this.creatures ??= []
  }

  public addEntry(entry: TroughEntry) {
    this.creatures.push(entry)
  }
}

export class TroughEntry {
  public id!: number
  public species!: Species
  public count!: number
  public checkedAge!: number
  public maxHealth!: number
  public maxFood!: number
  public checkTime!: DateTime

  constructor(partial: Partial<TroughEntry>) {
    Object.assign(this, partial)
  }

  getCurrentAge = (multipliers: Multipliers): number => {
    return this.getAgeAtTime(DateTime.now(), multipliers);
  }

  getAgeAtTime = (time: DateTime, multipliers: Multipliers): number => {
    let elapsed = time.diff(this.checkTime).as('seconds');
    return Math.min(this.checkedAge + elapsed * multipliers.maturation, this.species.adultAge)
  }

  getTimeBetweenAges = (fromAge: number, toAge: number, multipliers: Multipliers): number => {
    return Math.max(toAge - fromAge, 0) / multipliers.maturation;
  }

  getTimeToJuvenile = (fromAge: number, multipliers: Multipliers): number => {
    let juvenileAge = this.species.adultAge / 10;
    return this.getTimeBetweenAges(fromAge, juvenileAge, multipliers);
  }

  getTimeToAdult = (fromAge: number, multipliers: Multipliers): number => {
    return this.getTimeBetweenAges(fromAge, this.species.adultAge, multipliers);
  }

  getTimeToEatFood  = (fromAge: number, foodPoints: number, multipliers: Multipliers): number => {
    
  }

  getNextEvent = (startTime: DateTime, multipliers: Multipliers, starveStartTime?: number): { time: number, event: string } => {
    let ageAtStart = this.getAgeAtTime(startTime, multipliers);
    let starveTime = starveStartTime ? 
    let juvenileAge = this.species.adultAge / 10;
    return Math.max(juvenileAge - currentAge, 0);
  }
}

export interface Multipliers {
  maturation: number,
  consumption: number,
}

export class Species {
  name!: string;
  diet!: string;
  babyFoodRateStart!: number;
  babyFoodRateEnd!: number;
  adultFoodRate!: number;
  adultAge!: number;

  constructor(partial: Partial<Species>) {
    Object.assign(this, partial);
  }

  getAge(startAge: number, duration: number, multipliers: Multipliers): number
  {
    return Math.min(startAge + duration * multipliers.maturation, this.adultAge);
  }

  getFoodRate(age: number, multipliers: Multipliers): number {
    if (age >= 1.0) return this.adultFoodRate * multipliers.consumption;

    return (this.babyFoodRateStart + (this.babyFoodRateEnd - this.babyFoodRateStart) * age) * multipliers.consumption;
  };

  getFoodRateDecay(): number {
    return (this.babyFoodRateEnd - this.babyFoodRateStart) / this.adultAge;
  }

  getFoodPointsConsumed(startAge: number, duration: number, multipliers: Multipliers) {
    let endAge = this.getAge(startAge, duration, multipliers);
    let startRate = this.getFoodRate(startAge, multipliers);
    let endRate = this.getFoodRate(endAge, multipliers);

    return (startRate + endRate) * duration / 2;
  };
}

export interface Food {
  name: string;
  stackSize: number;
  spoilTime: number | null;
  weight: number;
}

export interface Diet {
  name: string;
  food: { [key: string]: number }
}