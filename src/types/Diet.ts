import type DietData from '../data/DietData';
import Food from './Food';


export default class Diet {
  name!: string;
  food!: { food: Food; foodPoints: number; }[];

  constructor(data: { name: string; food: { food: Food; foodPoints: number; }[]; }) {
    this.name = data.name;
    this.food = data.food;
  }

  static from(data: DietData, foods: { [key: string]: Food; }) {
    return new Diet({
      name: data.name,
      food: Object.keys(data.food).map(key => {
        return { food: foods[key], foodPoints: data.food[key] };
      }),
    });
  }
}
