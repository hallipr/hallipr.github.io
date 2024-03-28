export default class Species {
    name!: string;
    diet!: string;
    babyFoodRateStart!: number;
    babyFoodRateEnd!: number;
    adultFoodRate!: number;
    ageSpeed!: number;

    constructor(partial: Partial<Species>) {
        Object.assign(this, partial);
    }

    GetBabyFoodRate(age: number) 
    { 
        if (age >= 1.0) return this.adultFoodRate;

        return this.babyFoodRateStart + (this.babyFoodRateEnd - this.babyFoodRateStart) * age
    };

    GetFoodPointsConsumed(startAge: number, duration: number) 
    { 
        let endAge = Math.min(startAge + duration * this.ageSpeed, 1.0);
        
        let startRate = this.GetBabyFoodRate(startAge);
        let endRate = this.GetBabyFoodRate(endAge);

        return (startRate + endRate) * duration / 2;
    };
}