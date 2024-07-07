import type Multipliers from './Multipliers';
import type SpeciesData from '../data/SpeciesData';
import Diet from './Diet';

export default class Species {
  name: string;
  diet: Diet;
  defaultWeight: number;
  adultAge: number;
  babyFoodRateStart: number;
  babyFoodRateEnd: number;
  adultFoodRate: number;

  constructor({ name, diet, defaultWeight, adultAge, babyFoodRateStart, babyFoodRateEnd, adultFoodRate }: {
    name: string; diet: Diet; defaultWeight: number; adultAge: number; babyFoodRateStart: number; babyFoodRateEnd: number; adultFoodRate: number;
  }) {
    this.name = name;
    this.diet = diet;
    this.defaultWeight = defaultWeight;
    this.adultAge = adultAge;
    this.babyFoodRateStart = babyFoodRateStart;
    this.babyFoodRateEnd = babyFoodRateEnd;
    this.adultFoodRate = adultFoodRate;
  }

  static from(data: SpeciesData, diets: { [key: string]: Diet; }) {
    return new Species({
      name: data.name,
      diet: diets[data.diet],
      defaultWeight: data.defaultWeight,
      adultAge: 1 / (data.ageSpeed * data.ageSpeedMultiplier),
      babyFoodRateStart: data.baseFoodRate * data.babyFoodRate * data.extraBabyFoodRate,
      babyFoodRateEnd: data.baseFoodRate,
      adultFoodRate: data.baseFoodRate * (data.extraAdultFoodRate ?? 1),
    });
  }

  getUnboundedAge(startAge: number, duration: number, multipliers: Multipliers): number {
    const change = duration * multipliers.maturation / this.adultAge;
    return startAge + change;
  }

  getAdultFoodRate(multipliers: Multipliers) {
    return this.adultFoodRate * multipliers.consumption;
  }

  getBabyFoodRate(age: number, multipliers: Multipliers): number {
    const foodRate = this.babyFoodRateStart + (this.babyFoodRateEnd - this.babyFoodRateStart) * age;

    return foodRate * multipliers.consumption;
  }

  getFoodRateDecay(multipliers: Multipliers): number {
    const decayRange = this.babyFoodRateEnd - this.babyFoodRateStart;
    const decayPerSecond = decayRange / this.adultAge;

    return decayPerSecond * multipliers.consumption * multipliers.maturation;
  }

  getFoodPointsConsumed(startAge: number, duration: number, multipliers: Multipliers) {
    const secondsAsBaby = Math.min(Math.max(1 - startAge, 0) * this.adultAge, duration);
    const secondsAsAdult = duration - secondsAsBaby;

    const adultConsumed = secondsAsAdult * this.adultFoodRate * multipliers.consumption;

    const babyEndAge = Math.min(this.getUnboundedAge(startAge, duration, multipliers), 1);
    const startRate = this.getBabyFoodRate(startAge, multipliers);
    const endRate = this.getBabyFoodRate(babyEndAge, multipliers);

    const babyConsumed = (startRate + endRate) / 2 * secondsAsBaby;

    return babyConsumed + adultConsumed;
  }
}
