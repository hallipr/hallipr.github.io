import { round, timeToZero } from '../src/utils'
import { describe, it, expect } from '@jest/globals'

// unit test for the TroughEntry class
describe('utils', () => {
    describe('timeToZero', () => {
        it.each`
            time | initialRate | acceleration
            ${3} | ${7}        | ${5}
            ${3} | ${7}        | ${0}
            ${3} | ${0}        | ${5}
            ${0} | ${7}        | ${5}
            ${0} | ${7}        | ${0}
            ${0} | ${0}        | ${5}
            ${0} | ${0}        | ${0}
        `('should calculate for time=$time, initialRate=$initialRate, acceleration=$acceleration', ({time, initialRate, acceleration}) => {
            const total = (initialRate * 2 + acceleration * time) / 2 * time; 
            const actual = timeToZero(total, initialRate, -acceleration);
            
            expect(0+actual).toEqual(time);
        });
    })
      
    describe('round', () => {
        it.each`
            n    | expected
            ${0} | ${10}
            ${1} | ${10.4}
            ${2} | ${10.44}
            ${3} | ${10.444}
        `('should round down', ({n, expected}) => {
            const actual = round(10.4444, n);
            expect(actual).toBe(expected);
        });

        it.each`
            n    | expected
            ${0} | ${11}
            ${1} | ${10.6}
            ${2} | ${10.56}
            ${3} | ${10.556}
        `('should round up', ({n, expected}) => {
            const actual = round(10.5555, n);
            expect(actual).toBe(expected);
        });
    })
})