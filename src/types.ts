// Provides trough class for food calculations
import { DateTime, Duration } from "luxon"

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

  getNextEvent = (multipliers: Multipliers): { time: DateTime, event: string } => {
    let currentAge = this.getCurrentAge(multipliers);
    let timeToAdult = this.getTimeToAdult(currentAge, multipliers);
    let timeToJuvenile = this.getTimeToJuvenile(currentAge, multipliers);

    if (currentAge < 0.10) {
      return { time: this.checkTime.plus({ seconds: timeToJuvenile }), event: "Juvenile" };
    } else if (currentAge < this.species.adultAge) {
      return { time: this.checkTime.plus({ seconds: timeToAdult }), event: "Adult" };
    } else {
      return { time: DateTime.now(), event: "Death" };
    }
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
}

export interface Multipliers {
  maturation: number,
  consumption: number,
}

export class Species {
  name!: string;
  diet!: string;
  baseFoodRate!: number;
  babyFoodRate!: number;
  extraBabyFoodRate!: number;
  extraAdultFoodRate!: number;
  ageSpeed!: number;
  ageSpeedMult!: number;

  adultAge!: number;
  babyFoodRateStart!: number;
  babyFoodRateEnd!: number;
  adultFoodRate!: number;

  constructor(partial: Partial<Species>) {
    Object.assign(this, partial);

    this.adultAge = 1 / this.ageSpeed;
    this.babyFoodRateStart = this.baseFoodRate * this.babyFoodRate * this.extraBabyFoodRate;
    this.babyFoodRateEnd = this.baseFoodRate;
    this.adultFoodRate = this.baseFoodRate * this.extraAdultFoodRate;
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

export class Food {
  name!: string
  stackSize!: number;
  spoilTime!: Duration | null;
  weight!: number;

  constructor(partial: Partial<Food>) {
    Object.assign(this, partial)
  }
}

export class Diet {
  name!: string;
  food!: { [key: string]: number }

  constructor(partial: Partial<Diet>) {
    Object.assign(this, partial)
  }
}