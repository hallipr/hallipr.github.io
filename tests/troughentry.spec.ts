import { TroughEntry, Species, Multipliers } from '../src/types';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { DateTime } from 'luxon';

// unit test for the TroughEntry class
describe('TroughEntry', () => {
  let entry: TroughEntry = null!;
  let species: Species= null!;
  let time: DateTime= null!;
  let multipliers: Multipliers = {
    maturation: 1,
    consumption: 1,
  };

  beforeEach(() => {
    species = new Species({
      name: 'test',
      diet: 'herbivore',
      babyFoodRateStart: 0.1,
      babyFoodRateEnd: 0.2,
      adultFoodRate: 0.3,
      ageSpeed: 0.01,
    });

    time = DateTime.fromMillis(1000);

    entry = new TroughEntry({
      id: 1,
      species: species,
      count: 1,
      checkedAge: 0,
      maxHealth: 100,
      maxFood: 100,
      checkTime: time,
    });
  });

  it('should create an instance', () => {
    expect(entry).toBeTruthy();
  });
  
  describe('getCurrentAge', () => {
    it('should get current age', () => {
      let originalNow = DateTime.now;
      DateTime.now = jest.fn(() => time.plus({ seconds: 20 }));
      let actual = entry.getCurrentAge(multipliers);
      DateTime.now = originalNow;

      expect(actual).toBe(0.20);
    });
    
    it('should get age at time', () => {
      expect(entry.getAgeAtTime(time.plus({ seconds: 1 }), multipliers)).toBe(0.1);
    });
    
    it('should get time between ages', () => {
      expect(entry.getTimeBetweenAges(0, 1, multipliers)).toBe(10);
    });
    
    it('should get time to juvenile', () => {
      expect(entry.getTimeToJuvenile(0, multipliers)).toBe(1);
    });
    
    it('should get time to adult', () => {
      expect(entry.getTimeToAdult(0, multipliers)).toBe(10);
    });
  });
});