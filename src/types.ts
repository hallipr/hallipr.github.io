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
  public checkTime!: DateTime

  constructor(partial: Partial<TroughEntry>) {
    Object.assign(this, partial)
  }

  getCurrentAge = (multipliers: Multipliers): number => {
    let elapsed = DateTime.now().diff(this.checkTime).as('seconds');
    return Math.min(this.checkedAge + elapsed * multipliers.maturation, this.species.adultAge)
  }

  getTimeToAge = (fromAge: number, toAge: number, multipliers: Multipliers): number => {
    return Math.max(toAge - fromAge, 0) / multipliers.maturation;
  }

  getTimeToJuvenile = (fromAge: number, multipliers: Multipliers): number => {
    let juvenileAge = this.species.adultAge / 10;
    return this.getTimeToAge(fromAge, juvenileAge, multipliers);
  }

  getTimeToAdult = (fromAge: number, multipliers: Multipliers): number => {
    return this.getTimeToAge(fromAge, this.species.adultAge, multipliers);
  }

  getCurrentTimeToA = (multipliers: Multipliers): number => {
    let currentAge = this.getCurrentAge(multipliers);
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

  GetAge(startAge: number, duration: number, multipliers: Multipliers)
  {
    return Math.min(startAge + duration * multipliers.maturation, this.adultAge);
  }

  GetBabyFoodRate(age: number) {
    if (age >= 1.0) return this.adultFoodRate;

    return this.babyFoodRateStart + (this.babyFoodRateEnd - this.babyFoodRateStart) * age
  };

  GetFoodPointsConsumed(startAge: number, duration: number, multipliers: Multipliers) {
    let endAge = this.GetAge(startAge, duration, multipliers);

    let startRate = this.GetBabyFoodRate(startAge);
    let endRate = this.GetBabyFoodRate(endAge);

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