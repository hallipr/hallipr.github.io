import { describe, it } from '@jest/globals'
import data from '../src/arkData'

describe('arkData', () => {
    it('should work', () => {
        expect(data.food['Raw Meat']).toBeDefined()
    })
})