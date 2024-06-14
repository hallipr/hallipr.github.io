import { describe, it, expect, beforeEach } from '@jest/globals'
import { DateTime, Duration } from 'luxon'
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

    entry = new TroughEntry({id: 1, species, multipliers, checkTime: DateTime.fromSeconds(0), checkedAge: 0, count: 1, maxWeight: 100})
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

      const actual = entry.getAgeAtTime(DateTime.fromSeconds(20))

      expect(actual).toBe(20)
    })

    it('should get age at 4x', () => {
      multipliers.maturation = 4

      const actual = entry.getAgeAtTime(DateTime.fromSeconds(20))

      expect(actual).toBe(80)
    })

    it('should calculate from age at check time', () => {
      entry.checkedAge = 105
      entry.checkTime = DateTime.fromSeconds(13)
      console.log(multipliers)
      const actual = entry.getAgeAtTime(DateTime.fromSeconds(172))

      // should return entry.checkedAge + (172 - 13) * 1
      expect(actual).toBe(264)
    });

    it('should max at adult age', () => {
      const actual = entry.getAgeAtTime(DateTime.fromSeconds(1020))
      expect(actual).toBe(species.adultAge)
    })
  })

  describe('getTimeToJuvenile', () => {
    it('should get time at 1x', () => {
      // adult age == 1000, juvenile age == 100
      let calcTime = DateTime.fromSeconds(40)
      let actual = entry.getTimeToJuvenile(calcTime)
      let expected = Duration.fromObject({ seconds: 60 })
      expect(actual.as('seconds')).toBe(expected.as('seconds'))
    })

    it('should get time at 4x', () => {
      multipliers.maturation = 4
      // adult age == 250, juvenile age == 25
      let calcTime = DateTime.fromSeconds(10)
      let actual = entry.getTimeToJuvenile(calcTime)
      let expected = Duration.fromObject({ seconds: 15 })
      expect(actual.as('seconds')).toBe(expected.as('seconds'))
    })
  })

  describe('getTimeToAdult', () => {
    it('should get time at 1x', () => {
      // adult age == 1000
      let calcTime = DateTime.fromSeconds(100)
      let actual = entry.getTimeToAdult(calcTime)
      let expected = Duration.fromObject({ seconds: 900 })
      expect(actual.as('seconds')).toBe(expected.as('seconds'))
    })

    it('should get time at 4x', () => {
      multipliers.maturation = 4
      // adult age == 250
      let calcTime = DateTime.fromSeconds(22)
      let actual = entry.getTimeToAdult(calcTime)
      let expected = Duration.fromObject({ seconds: 228 })
      expect(actual.as('seconds')).toBe(expected.as('seconds'))
    })
  })

  describe('getNextEvent', () => {
    it('should get next event', () => {
      // should return { 1:40:00, "juvenile" }
      const actual = entry.getNextEvent(DateTime.fromSeconds(80))

      expect(actual).toEqual({ time: DateTime.fromSeconds(100), event: "Juvenile" })
    })
  })

  describe('getNextFood', () => {
    // getNextFood returns the food type consumed, beginning rate and rate decay
    it('should select the highest preference food', () => {
      const fromTime = DateTime.fromSeconds(0);

      const actual = entry.getNextFood(fromTime, ["Raw Meat", "Berry", "Kibble"]);

      expect(actual).toEqual({ food: data.food["Berry"], rate: 0.1, decay: -0.00005 })
    })

    it('should use species specific diets', () => {
      const fromTime = DateTime.fromSeconds(0);
      species.diet = data.diets.Daeodon;

      const actual = entry.getNextFood(fromTime, ["Raw Meat", "Cooked Meat", "Berry", "Kibble"]);

      expect(actual).toEqual({ food: data.food["Raw Meat"], rate: 0.04, decay: -0.00002 })
    })
  })
})