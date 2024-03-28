import Species from '../new-app/scripts/Types/Species';

describe('testing GetBabyFoodRate', () => {
  test('should be equal to babyFoodRateStart at 0%', () => {
    let species = new Species({name: 'test', ageSpeed: 1 / 60, babyFoodRateStart: 100, babyFoodRateEnd: 1, adultFoodRate: 2});
    let actual = species.GetBabyFoodRate(0);
    expect(actual).toBe(100);
  });
});