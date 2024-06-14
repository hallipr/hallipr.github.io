import { Trough, TroughEntry, Multipliers } from '../src/types'
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
      console.log(JSON.stringify(trough.keyframes))

      // expect 3 keyframes: initial, adult, food empty
      expect(trough.keyframes.length).toBe(2)
    });
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
      console.log(JSON.stringify(trough.keyframes))

      // expect 3 keyframes: initial, adult, food empty
      expect(trough.keyframes.length).toBe(2)
    });
  })
})