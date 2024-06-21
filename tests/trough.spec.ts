import { Trough, TroughEntry, Multipliers, Diet, Species, TroughFrame } from '../src/types'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { DateTime } from 'luxon'
import data from '../src/arkData'

// unit test for the TroughEntry class
describe('Trough', () => {
  let trough: Trough = null!
  let multipliers: Multipliers = null!

  beforeEach(() => {
    multipliers = {
      maturation: 1,
      consumption: 1,
    };

    trough = new Trough(1, "trough", multipliers);
  })

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create an instance', () => {
    expect(trough).not.toBeNull()
  })

  describe('calculateKeyframes', () => {
    it('should produce initial, adult and food empty frames', () => {
      trough.foodStacks.push({ food: data.food["Vegetables"], stacks: 10000 })

      trough.entries.push(new TroughEntry(
        {
          id: 1,
          species: data.species["Dodo"],
          multipliers,
          checkTime: DateTime.fromSeconds(0),
          checkedAge: 0,
          count: 1,
          maxWeight: 100
        }
      ))

      trough.calculateKeyframes(DateTime.fromSeconds(0))

      console.log(JSON.stringify(trough.keyframes.map(getDebugFrame), null, '  '))

      // expect 3 keyframes: initial, adult, food empty
      expect(trough.keyframes.length).toBe(3)
    });
  })

  describe('calculateKeyframes', () => {
    it('should keep producing spoil frames after entries starve', () => {
      trough.foodStacks.push({ food: data.food["Vegetables"], stacks: 1 })
      trough.foodStacks.push({ food: data.food["Cooked Fish Meat"], stacks: 10 })

      trough.entries.push(new TroughEntry(
        {
          id: 1,
          species: data.species["Dodo"],
          multipliers,
          checkTime: DateTime.fromSeconds(0),
          checkedAge: 0,
          count: 1,
          maxWeight: 100
        }
      ))

      trough.calculateKeyframes(DateTime.fromSeconds(0))
      console.log(JSON.stringify(trough.keyframes.map(getDebugFrame), null, '  '))

      // expect 3 keyframes: initial, vegies empty, fish empty
      expect(trough.keyframes.length).toBe(4)
    });
  })
})

function getDebugSpecies(species: Species): any {
  return {
    name: species.name,
    diet: {
      name: species.diet.name,
      food: toDictionary(species.diet.food, x => x.food.name, x => x.foodPoints)
    }
  }
}

function getDebugFrame(frame: TroughFrame): any {
  return {
    time: frame.time.diff(DateTime.fromSeconds(0)).rescale().toHuman(),
    entries: frame.entries.map(e => ({
      id: e.id,
      species: e.species.name,
      age: e.calculatedAge,
      diet: e.species.diet.name,
      food: e.food?.name ?? '',
      rate: e.rate,
      rateDecay: e.rateDecay      
    })),
    foodPieces: toDictionary(Object.keys(frame.foodPieces), x => x, x => frame.foodPieces[x].pieces)
  }
}


function toDictionary<T, TValue>(source: Array<T>, keyAccessor: (item: T) => string | number, valueAccessor: (item: T) => TValue) {
  return source.reduce((a: { [key: string]: TValue }, c: T) => { a[keyAccessor(c)] = valueAccessor(c); return a; }, {})
}
