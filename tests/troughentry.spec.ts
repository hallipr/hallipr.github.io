import { describe, it, expect, beforeEach } from '@jest/globals'
import { DateTime } from 'luxon'
import { TroughEntry, Species, Multipliers } from '../src/types'
import data from '../src/arkData'

// unit test for the TroughEntry class
describe('TroughEntry', () => {
  let entry: TroughEntry = null!
  let species: Species= null!
  let multipliers: Multipliers = null!

  beforeEach(() => {
    multipliers = {
      maturation: 1,
      consumption: 1,
    };

    species = new Species({
      name: 'test',
      diet: data.diets.Herbivore,
      babyFoodRateStart: 2,
      babyFoodRateEnd: 1,
      adultFoodRate: 3,
      adultAge: 1000,
      defaultWeight: 100,
    })

    entry = new TroughEntry(1, species, multipliers)
    
    Object.assign(entry, {
      count: 1,
      checkedAge: 0,
      maxHealth: 100,
      maxFood: 100,
      checkTime: DateTime.fromSeconds(0),
    })
  })

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should create an instance', () => {
    expect(entry).toBeTruthy()
  })

  describe('getAgeAtTime', () => {
    it('should get age at 1x', () => {
      multipliers.maturation = 1

      let actual = entry.getAgeAtTime(DateTime.fromSeconds(20))

      expect(actual).toBe(20)
    })

    it('should get age at 4x', () => {
      multipliers.maturation = 4

      let actual = entry.getAgeAtTime(DateTime.fromSeconds(20))

      expect(actual).toBe(80)
    })

    it('should calculate from age at check time', () => {
      entry.checkedAge = 105
      entry.checkTime = DateTime.fromSeconds(13)
      console.log(multipliers)
      let actual = entry.getAgeAtTime(DateTime.fromSeconds(172))

      // should return entry.checkedAge + (172 - 13) * 1
      expect(actual).toBe(264)
    });

    it('should max at adult age', () => {
      let actual = entry.getAgeAtTime(DateTime.fromSeconds(1020))
      expect(actual).toBe(species.adultAge)
    })
  })

  describe('getTimeToJuvenile', () => {
    it('should get time at 1x', () => {
      // adult age == 1000, juvenile age == 100
      expect(entry.getTimeToJuvenile(40)).toBe(60)
    })

    it('should get time at 4x', () => {
      multipliers.maturation = 4
      // adult age == 1000, juvenile age == 100
      expect(entry.getTimeToJuvenile(40)).toBe(15)
    })
  })

  describe('getTimeToAdult', () => {
    it('should get time at 1x', () => {
      // adult age == 1000
      expect(entry.getTimeToAdult(0)).toBe(1000)
    })

    it('should get time at 4x', () => {
      multipliers.maturation = 4
      // adult age == 1000
      expect(entry.getTimeToAdult(0)).toBe(250)
    })
  })

  describe('getNextEvent', () => {
    it('should get next event', () => {
      // should return { 1:40:00, "juvenile" }
      let actual = entry.getNextEvent(DateTime.fromSeconds(80))

      expect(actual).toEqual({ time: DateTime.fromSeconds(100), event: "Juvenile" })
    })
  })

  describe('getNextFood', () => {
    // getNextFood returns the food type consumed, beginning rate and rate decay
    it('should select the highest preference food', () => {
      let fromTime = DateTime.fromSeconds(0);

      let actual = entry.getNextFood(fromTime, ["Raw Meat", "Berry", "Mejoberry"]);

      expect(actual).toEqual({ food: data.food["Berry"], rate: 0.1, decay: -0.00005 })
    })

    it('should use species specific diets', () => {
      let fromTime = DateTime.fromSeconds(0);
      species.diet = data.diets.Daeodon;

      let actual = entry.getNextFood(fromTime, ["Raw Meat", "Cooked Meat", "Berry", "Mejoberry"]);

      expect(actual).toEqual({ food: data.food["Raw Meat"], rate: 0.04, decay: -0.00002 })
    })
  })
})