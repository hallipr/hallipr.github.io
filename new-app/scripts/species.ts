export default class Species {
    public Name: string;
    public Diet: string;
    public BaseFoodRate: number;
    public BabyFoodRate: number;
    public AgeSpeed: number;

    constructor(name: string, diet: string, baseFoodRate: number, babyFoodRate: number, ageSpeed: number) {
        this.Name = name;
        this.Diet = diet;
        this.BaseFoodRate = baseFoodRate;
        this.BabyFoodRate = babyFoodRate;
        this.AgeSpeed = ageSpeed;
    }
}