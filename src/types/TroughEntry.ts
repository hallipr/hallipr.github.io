import { DateTime, Duration } from 'luxon';
import Food from './Food';
import Species from './Species';
import type Multipliers from './Multipliers';


export default class TroughEntry {
  public id: number;
  public species: Species;
  public count: number = 0;
  public checkedAge: number = 0;
  public maxWeight: number = 0;
  public checkTime: DateTime;
  public multipliers: Multipliers;

  constructor({ id, species, multipliers, checkTime, checkedAge, count, maxWeight }: {
    id: number; species: Species; multipliers: Multipliers; checkTime: DateTime; checkedAge: number; count: number; maxWeight: number;
  }) {
    this.id = id;
    this.species = species;
    this.multipliers = multipliers;
    this.count = count;
    this.checkedAge = checkedAge;
    this.maxWeight = maxWeight;
    this.checkTime = checkTime;
  }

  public getTimeToAdult(fromTime: DateTime): Duration {
    const currentAge = this.getAgeAtTime(fromTime);
    return Duration.fromMillis(this.getSecondsBetweenAges(currentAge, 1) * 1000);
  }

  public getTimeToJuvenile(fromTime: DateTime): Duration {
    const currentAge = this.getAgeAtTime(fromTime);
    return Duration.fromMillis(this.getSecondsBetweenAges(currentAge, 0.1) * 1000);
  }

  public getFoodToAdult(fromTime: DateTime): number {
    const fromAge = this.getAgeAtTime(fromTime);

    return this.getFoodBetweenAges(fromAge, 1);
  }

  public getFoodToJuvenile(fromTime: DateTime): number {
    const fromAge = this.getAgeAtTime(fromTime);

    return this.getFoodBetweenAges(fromAge, 0.1);
  }

  getFoodBetweenAges(fromAge: number, toAge: number): number {
    if (fromAge >= toAge) {
      return 0;
    }

    const duration = this.getSecondsBetweenAges(fromAge, toAge);
    return this.species.getFoodPointsConsumed(fromAge, duration, this.multipliers);
  }

  getNextEvent(fromTime: DateTime): { time: DateTime; event: string; } | null {
    const fromAge = this.getAgeAtTime(fromTime);

    if (fromAge < 0.1) {
      return { time: fromTime.plus({ seconds: this.getSecondsBetweenAges(fromAge, 0.1) }), event: 'Juvenile' };
    } else if (fromAge < 1) {
      return { time: fromTime.plus({ seconds: this.getSecondsBetweenAges(fromAge, 1) }), event: 'Adult' };
    } else {
      return null;
    }
  }

  // returns the food type consumed, beginning rate and rate decay
  getNextFood(fromTime: DateTime<true>, foodOptions: string[]): { food: Food; pointsPerPiece: number, rate: number; decay: number; } | null {
    const food = this.species.diet.food.find(f => foodOptions.some(tf => tf === f.food.name));
    if (!food) return null;

    const fromAge = this.getAgeAtTime(fromTime);

    const foodRate = fromAge >= 1
      ? this.species.getAdultFoodRate(this.multipliers)
      : this.species.getBabyFoodRate(fromAge, this.multipliers);

    const rateDecay = fromAge >= 1
      ? 0
      : this.species.getFoodRateDecay(this.multipliers);

    // convert food point rates into food piece rates
    return { 
      food: food.food,
      pointsPerPiece: food.foodPoints,
      rate: foodRate / food.foodPoints,
      decay: rateDecay / food.foodPoints
    };
  }

  getAgeAtTime(time: DateTime): number {
    const elapsedSeconds = time.diff(this.checkTime).as('seconds');
    const elapsedAge = elapsedSeconds * this.multipliers.maturation / this.species.adultAge;
    return Math.min(this.checkedAge + elapsedAge, 1);
  }

  getSecondsBetweenAges(fromAge: number, toAge: number): number {
    return Math.max(toAge - fromAge, 0) * this.species.adultAge / this.multipliers.maturation;
  }
}
