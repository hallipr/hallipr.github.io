// Provides trough class for food calculations
import Species from "./Types/Species";

export default class Trough {
    Entries: troughEntry[];

    constructor() {
        this.Entries = [];
    }

    public addEntry(entry: troughEntry) {
        this.Entries.push(entry);
    }
}

export class troughEntry {
    public Species: Species;
    public Count: number;
    public CheckedAge: number;
    public CheckTime: Date;

    constructor(species: Species, count: number, checkedAge: number, checkedTime: Date) { 
        this.Species = species;
        this.Count = count;
        this.CheckedAge = checkedAge;
        this.CheckTime = checkedTime;
    }

    get CurrentAge(): number {
        let elapsedSeconds = (new Date().getTime() - this.CheckTime.getTime()) / 1000;
        return this.CheckedAge + elapsedSeconds / this.Species.ageSpeed;
    }
}