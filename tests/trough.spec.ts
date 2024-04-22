import { Trough, TroughEntry, Species, Multipliers } from '../src/types'
import { describe, it, expect, beforeEach } from '@jest/globals'
import { DateTime } from 'luxon'
import data from '../src/arkData'

// unit test for the TroughEntry class
describe('Trough', () => {
    let trough: Trough = null!
    let entry: TroughEntry = null!
    let multipliers: Multipliers = null!
  
    beforeEach(() => {
      multipliers = {
        maturation: 1,
        consumption: 1,
      };

      trough = new Trough(1, "trough");

      entry = new TroughEntry(1, data.species["Dodo"], multipliers)
      Object.assign(entry, {
        count: 1,
        checkedAge: 0,
        maxHealth: 100,
        maxFood: 100,
        checkTime: DateTime.fromSeconds(0),
      })
      
      trough.entries.push(entry);
    })

    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should create an instance', () => {
      expect(trough).toBeTruthy()
    })

    describe('calculate', () => {
      it('should calculate food consumption', () => {
        let actual = trough.calculate()
      });
    })
})