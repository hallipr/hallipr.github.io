
export default interface SpeciesData {
  name: string;
  diet: string;
  baseFoodRate: number;
  babyFoodRate: number;
  extraBabyFoodRate: number;
  extraAdultFoodRate?: number;
  ageSpeed: number;
  ageSpeedMultiplier: number;
  defaultWeight: number;
}
