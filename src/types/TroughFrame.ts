import { DateTime } from 'luxon';
import Food from './Food';
import Species from './Species';

export default interface TroughFrame {
  time: DateTime;
  entries: {
    id: number;
    species: Species;
    count: number;
    calculatedAge: number;
    timeToAdult: number;
    food: Food | null;
    rate: number;
    rateDecay: number;
  }[];
  foodPieces: { [key: string]: { pieces: number; spoilRate: number; }; };
}
