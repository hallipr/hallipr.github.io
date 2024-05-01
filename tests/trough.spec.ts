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

      trough = new Trough(1, "trough");      
    })

    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should create an instance', () => {
      expect(trough).not.toBeNull()
    })

    describe('calculateKeyframes', () => {
      it('should produce initial, adult and food empty frames', () => {
        trough.foodStacks.push({ food: data.food["Vegetables"], count: 1000})
        
        trough.entries.push(new TroughEntry(1, data.species["Dodo"], multipliers, 1, 0, 100, DateTime.fromSeconds(0)))

        trough.calculateKeyframes(DateTime.fromSeconds(0));
        
        expect(trough.keyframes.length).toBe(3)
      });
    })
})