import { Duration } from 'luxon';
import type FoodData from '../data/FoodData';


export default class Food {
  name: string;
  stackSize: number;
  spoilTime: Duration | null;
  weight: number;

  constructor(data: { name: string; stackSize: number; spoilTime: Duration | null; weight: number; }) {
    this.name = data.name;
    this.stackSize = data.stackSize;
    this.weight = data.weight;
    this.spoilTime = data.spoilTime;
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
