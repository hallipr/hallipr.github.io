import { DateTime } from 'luxon';
import * as utils from '../utils';
import TroughEntry from './TroughEntry';
import type Multipliers from './Multipliers';
import type { TroughType } from './TroughType';
import Food from './Food';
import Species from './Species';
import type TroughFrame from './TroughFrame';


export default class Trough {
  id: number;
  name: string;
  multipliers: Multipliers;
  type: TroughType = 'normal';
  entries: TroughEntry[] = [];
  foodStacks: { food: Food; stacks: number; }[] = [];
  keyframes: TroughFrame[] = [];

  constructor(id: number, name: string, multipliers: Multipliers) {
    this.id = id;
    this.name = name;
    this.multipliers = multipliers;
    this.foodStacks = [];
  }

  public addFood(food: Food) {
    this.foodStacks.push({ food, stacks: 0 });
  }

  public addCreature(speciesList: Species[]) {
    const species = speciesList[0];
    const id = this.entries.length;

    this.entries.push(
      new TroughEntry(
        {
          id,
          species,
          multipliers: this.multipliers,
          checkTime: DateTime.now(),
          checkedAge: 0,
          count: 0,
          maxWeight: species.defaultWeight
        }
      )
    );
  }

  calculateSpoilRate(food: Food) {
    if (null == food.spoilTime)
      return 0;

    const spoilSeconds = food.spoilTime.as('seconds');

    switch (this.type) {
      case 'tek': return 1 / spoilSeconds / 100;
      case 'normal': return 1 / spoilSeconds / 4;
      default: return 1 / spoilSeconds;
    }
  }

  calculateKeyframes(startTime: DateTime) {
    let foodPieces = this.foodStacks.reduce(
      (acc, { food, stacks: count }) => {
        const pieces = food.stackSize * count;
        const spoilateRate = this.calculateSpoilRate(food) * count;

        if (pieces > 0) {
          acc[food.name] = {
            pieces: pieces,
            spoilRate: spoilateRate,
          };
        }

        return acc;
      },
      {} as { [key: string]: { pieces: number; spoilRate: number; }; }
    );

    let availableFood = Object.keys(foodPieces);

    let entries = this.entries.map(entry => {
      const nextFood = entry.getNextFood(startTime, availableFood);
      const calculatedAge = entry.getAgeAtTime(startTime);

      return {
        id: entry.id,
        species: entry.species,
        calculatedAge: calculatedAge,
        timeToAdult: entry.getSecondsBetweenAges(calculatedAge, entry.species.adultAge),
        food: nextFood?.food ?? null,
        rate: (nextFood?.rate ?? 0),
        count: entry.count,
        rateDecay: nextFood?.decay ?? 0,
      };
    });

    let frame: TroughFrame = {
      time: startTime,
      entries: entries,
      foodPieces: foodPieces,
    };

    this.keyframes.push(frame);

    while (
      // while there's still creatures eating
      Object.values(frame.entries).some(entry => entry.food != null) ||
      // or there's food spoiling (some food doesn't spoil e.g. Chitin)
      Object.values(frame.foodPieces).some(food => food.spoilRate > 0 && food.pieces > 0)) {
      // find the next significant event
      // if all creatures are adults, the next significant event will be food depletion
      // otherwise, the next significant event may be a creature maturing
      const foodCalcs = Object.entries(frame.foodPieces).reduce(
        (acc, [key, frameFood]) => {
          const entriesEatingFood = frame.entries.filter(entry => entry.food?.name === key);
          const totalRate = entriesEatingFood.reduce((acc, entry) => acc + entry.rate * entry.count, frameFood.spoilRate);
          const totalDecay = entriesEatingFood.reduce((acc, entry) => acc + entry.rateDecay, 0);
          const timeToDeplete = utils.timeToZero(frameFood.pieces, totalRate, totalDecay);

          acc[key] = {
            pieces: frameFood.pieces,
            rate: totalRate,
            decay: totalDecay,
            timeToDeplete: timeToDeplete,
          };

          return acc;
        },
        {} as { [key: string]: { pieces: number; rate: number; decay: number; timeToDeplete: number; }; }
      );

      // get the time to the next food depletion event
      let timeToNextFrame = Object.values(foodCalcs).reduce(
        (acc, value) => Math.min(acc, value.timeToDeplete),
        Infinity
      );

      // if any creatures are not adults, find the time to the next maturation or depletion event
      timeToNextFrame = frame.entries
        .filter(entry => entry.timeToAdult > 0)
        .reduce((acc, entry) => Math.min(acc, entry.timeToAdult), timeToNextFrame);

      const nextFrameTime = frame.time.plus({ seconds: timeToNextFrame });

      foodPieces = Object.entries(frame.foodPieces).reduce(
        (acc, [key, food]) => {
          const depletion = foodCalcs[key];

          const startingRate = depletion.rate;
          const endingRate = depletion.rate - timeToNextFrame * depletion.decay;
          const newPieces = Math.max(food.pieces - ((startingRate + endingRate) / 2) * timeToNextFrame, 0);

          if (newPieces > 0) {
            acc[key] = {
              pieces: newPieces,
              spoilRate: food.spoilRate,
            };
          }

          return acc;
        },
        {} as { [key: string]: { pieces: number; spoilRate: number; }; }
      );

      availableFood = Object.keys(foodPieces);

      entries = this.entries.map(entry => {
        const nextFood = entry.getNextFood(nextFrameTime, availableFood);
        const calculatedAge = entry.getAgeAtTime(nextFrameTime);

        return {
          id: entry.id,
          species: entry.species,
          count: entry.count,
          calculatedAge: calculatedAge,
          timeToAdult: entry.getSecondsBetweenAges(calculatedAge, entry.species.adultAge),
          food: nextFood?.food ?? null,
          rate: nextFood?.rate ?? 0,
          rateDecay: nextFood?.decay ?? 0,
        };
      });

      frame = {
        time: nextFrameTime,
        entries: entries,
        foodPieces: foodPieces,
      };

      this.keyframes.push(frame);
    }
  }
}

