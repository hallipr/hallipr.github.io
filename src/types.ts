// Provides trough class for food calculations
import { DateTime, Duration } from 'luxon'
import * as utils from './utils'

export class Trough {
  id: number
  name: string
  multipliers: Multipliers
  type: TroughType = 'normal'
  entries: TroughEntry[] = []
  foodStacks: { food: Food, stacks: number }[] = []
  keyframes: TroughFrame[] = []

  constructor(id: number, name: string, multipliers: Multipliers) {
    this.id = id
    this.name = name
    this.multipliers = multipliers
    this.foodStacks = []
  }

  public addFood(food: Food) {
    this.foodStacks.push({ food, stacks: 0 });
  }

  public addCreature(speciesList: Species[]) {
    const species = speciesList[Math.floor(Math.random() * speciesList.length)]
    const id = this.entries.length

    this.entries.push(
      new TroughEntry(
        {
          id,
          species,
          multipliers: this.multipliers,
          checkTime: DateTime.now().minus({ hours: Math.random() * 4 }),
          checkedAge: Math.random() * species.adultAge,
          count: Math.floor(Math.random() * 100),
          maxWeight: species.defaultWeight
        }
      )
    )
  }

  calculateKeyframes(startTime: DateTime) {
    let foodPieces = this.foodStacks.reduce(
      (acc, { food, stacks: count }) => {
        const pieces = food.stackSize * count

        if (pieces > 0) {
          acc[food.name] = {
            pieces: pieces,
            spoilRate: food.spoilTime == null ? 0 : (1 / food.spoilTime.as('seconds')) * count,
          }
        }

        return acc
      },
      {} as { [key: string]: { pieces: number; spoilRate: number } }
    )

    let availableFood = Object.keys(foodPieces)

    let entries = this.entries.map(entry => {
      const nextFood = entry.getNextFood(startTime, availableFood)
      const calculatedAge = entry.getAgeAtTime(startTime)

      return {
        id: entry.id,
        species: entry.species,
        calculatedAge: calculatedAge,
        timeToAdult: entry.getSecondsBetweenAges(calculatedAge, entry.species.adultAge),
        food: nextFood?.food ?? null,
        rate: nextFood?.rate ?? 0,
        rateDecay: nextFood?.decay ?? 0,
      }
    })

    let frame: TroughFrame = {
      time: startTime,
      entries: entries,
      foodPieces: foodPieces,
    }

    this.keyframes.push(frame)

    // while there's still creatures eating, find the next significant event
    while (Object.values(frame.foodPieces).some(entry => entry.pieces > 0)) {
      // if all creatures are adults, the next significant event will be food depletion
      // otherwise, the next significant event may be a creature maturing

      const foodCalcs = Object.entries(frame.foodPieces).reduce(
        (acc, [key, frameFood]) => {
          const entriesEatingFood = frame.entries.filter(entry => entry.food?.name === key)
          const totalRate = entriesEatingFood.reduce((acc, entry) => acc + entry.rate, 0) + frameFood.spoilRate
          const totalDecay = entriesEatingFood.reduce((acc, entry) => acc + entry.rateDecay, 0)
          const timeToDeplete = utils.timeToZero(frameFood.pieces, totalRate, totalDecay)

          acc[key] = {
            pieces: frameFood.pieces,
            rate: totalRate,
            decay: totalDecay,
            timeToDeplete: timeToDeplete,
          }

          return acc
        },
        {} as { [key: string]: { pieces: number; rate: number; decay: number; timeToDeplete: number } }
      )

      // get the time to the next food depletion event
      let timeToNextFrame = Object.values(foodCalcs).reduce(
        (acc, value) => Math.min(acc, value.timeToDeplete),
        Infinity
      )

      // if any creatures are not adults, find the time to the next maturation or depletion event
      timeToNextFrame = frame.entries
        .filter(entry => entry.timeToAdult > 0)
        .reduce((acc, entry) => Math.min(acc, entry.timeToAdult), timeToNextFrame)

      const nextFrameTime = frame.time.plus({ seconds: timeToNextFrame })

      foodPieces = Object.entries(frame.foodPieces).reduce(
        (acc, [key, food]) => {
          const depletion = foodCalcs[key]

          const startingRate = depletion.rate
          const endingRate = depletion.rate - timeToNextFrame * depletion.decay
          const newPieces = Math.max(food.pieces - ((startingRate + endingRate) / 2) * timeToNextFrame, 0)

          if (newPieces > 0) {
            acc[key] = {
              pieces: newPieces,
              spoilRate: food.spoilRate,
            }
          }

          return acc
        },
        {} as { [key: string]: { pieces: number; spoilRate: number } }
      )

      availableFood = Object.keys(foodPieces)

      entries = this.entries.map(entry => {
        const nextFood = entry.getNextFood(nextFrameTime, availableFood)
        const calculatedAge = entry.getAgeAtTime(nextFrameTime)

        return {
          id: entry.id,
          species: entry.species,
          calculatedAge: calculatedAge,
          timeToAdult: entry.getSecondsBetweenAges(calculatedAge, entry.species.adultAge),
          food: nextFood?.food ?? null,
          rate: nextFood?.rate ?? 0,
          rateDecay: nextFood?.decay ?? 0,
        }
      })

      frame = {
        time: nextFrameTime,
        entries: entries,
        foodPieces: foodPieces,
      }

      this.keyframes.push(frame)
    }
  }
}

export interface TroughFrame {
  time: DateTime
  entries: {
    id: number
    species: Species
    calculatedAge: number
    timeToAdult: number
    food: Food | null
    rate: number
    rateDecay: number
  }[]
  foodPieces: { [key: string]: { pieces: number; spoilRate: number } }
}

export class TroughEntry {
  public id: number
  public species: Species
  public count: number = 0
  public checkedAge: number = 0
  public maxWeight: number = 0
  public checkTime: DateTime
  public multipliers: Multipliers

  constructor({ id, species, multipliers, checkTime, checkedAge, count, maxWeight }: {
    id: number, species: Species, multipliers: Multipliers, checkTime: DateTime, checkedAge: number, count: number, maxWeight: number
  }) {
    this.id = id
    this.species = species
    this.multipliers = multipliers
    this.count = count
    this.checkedAge = checkedAge
    this.maxWeight = maxWeight
    this.checkTime = checkTime
  }

  public getCheckedAgePercent(): number {
    return this.checkedAge * 100 / this.species.adultAge
  }

  public getAgePercentAtTime(fromTime: DateTime): number {
    return this.getAgeAtTime(fromTime) * 100 / this.species.adultAge
  }

  public getTimeToAdult(fromTime: DateTime): Duration {
    const adultAge = this.species.adultAge
    const currentAge = this.getAgeAtTime(fromTime)
    return Duration.fromMillis(this.getSecondsBetweenAges(currentAge, adultAge) * 1000)
  }

  public getTimeToJuvenile(fromTime: DateTime): Duration {
    const adultAge = this.species.adultAge
    const juvenileAge = adultAge * 0.10
    const currentAge = this.getAgeAtTime(fromTime)
    return Duration.fromMillis(this.getSecondsBetweenAges(currentAge, juvenileAge) * 1000)
  }

  public getFoodToAdult(fromTime: DateTime): number {
    return this.getTimeToAdult(fromTime).minutes
  }

  public getFoodToJuvenile(fromTime: DateTime): number {
    return this.getTimeToJuvenile(fromTime).seconds
  }

  getNextEvent(fromTime: DateTime): { time: DateTime; event: string } | null {
    const fromAge = this.getAgeAtTime(fromTime)
    const adultAge = this.species.adultAge
    const juvenileAge = adultAge * 0.10
    const secondsToAdult = this.getSecondsBetweenAges(fromAge, adultAge)
    const secondsToJuvenile = this.getSecondsBetweenAges(fromAge, juvenileAge)

    if (fromAge < juvenileAge) {
      return { time: fromTime.plus({ seconds: secondsToJuvenile }), event: 'Juvenile' }
    } else if (fromAge < this.species.adultAge) {
      return { time: fromTime.plus({ seconds: secondsToAdult }), event: 'Adult' }
    } else {
      return null
    }
  }

  // returns the food type consumed, beginning rate and rate decay
  getNextFood(fromTime: DateTime<true>, foodOptions: string[]): { food: Food; rate: number; decay: number } | null {
    const food = this.species.diet.food.find(f => foodOptions.some(tf => tf === f.food.name))
    if (!food) return null

    const fromAge = this.getAgeAtTime(fromTime)
    const foodRate = this.species.getFoodRate(fromAge, this.multipliers)
    const rateDecay = this.species.getFoodRateDecay(this.multipliers)

    return { food: food.food, rate: foodRate / food.foodPoints, decay: rateDecay / food.foodPoints }
  }

  getAgeAtTime(time: DateTime): number {
    const elapsed = time.diff(this.checkTime).as('seconds')
    return Math.min(this.checkedAge + elapsed * this.multipliers.maturation, this.species.adultAge)
  }

  getSecondsBetweenAges(fromAge: number, toAge: number): number {
    return Math.max(toAge - fromAge, 0) / this.multipliers.maturation
  }
}

export interface Multipliers {
  maturation: number
  consumption: number
}

export interface SpeciesData {
  name: string
  diet: string
  baseFoodRate: number
  babyFoodRate: number
  extraBabyFoodRate: number
  extraAdultFoodRate?: number
  ageSpeed: number
  ageSpeedMultiplier: number
  defaultWeight: number
}

export class Species {
  name: string
  diet: Diet
  defaultWeight: number
  adultAge: number
  babyFoodRateStart: number
  babyFoodRateEnd: number
  adultFoodRate: number

  constructor({ name, diet, defaultWeight, adultAge, babyFoodRateStart, babyFoodRateEnd, adultFoodRate }: {
    name: string, diet: Diet, defaultWeight: number, adultAge: number, babyFoodRateStart: number, babyFoodRateEnd: number, adultFoodRate: number
  }) {
    this.name = name
    this.diet = diet
    this.defaultWeight = defaultWeight
    this.adultAge = adultAge
    this.babyFoodRateStart = babyFoodRateStart
    this.babyFoodRateEnd = babyFoodRateEnd
    this.adultFoodRate = adultFoodRate
  }

  static from(data: SpeciesData, diets: { [key: string]: Diet }) {
    return new Species({
      name: data.name,
      diet: diets[data.diet],
      defaultWeight: data.defaultWeight,
      adultAge: 1 / (data.ageSpeed * data.ageSpeedMultiplier),
      babyFoodRateStart: data.baseFoodRate * data.babyFoodRate * data.extraBabyFoodRate,
      babyFoodRateEnd: data.baseFoodRate,
      adultFoodRate: data.baseFoodRate * (data.extraAdultFoodRate ?? 1),
    })
  }

  getAge(startAge: number, duration: number, multipliers: Multipliers): number {
    return Math.min(startAge + duration * multipliers.maturation, this.adultAge)
  }

  getFoodRate(age: number, multipliers: Multipliers): number {
    if (age >= this.adultAge) return this.adultFoodRate * multipliers.consumption

    return (
      (this.babyFoodRateStart + ((this.babyFoodRateEnd - this.babyFoodRateStart) * age) / this.adultAge) *
      multipliers.consumption
    )
  }

  getFoodRateDecay(multipliers: Multipliers): number {
    return (
      (((this.babyFoodRateEnd - this.babyFoodRateStart) * multipliers.consumption) / this.adultAge) *
      multipliers.maturation
    )
  }

  getFoodPointsConsumed(startAge: number, duration: number, multipliers: Multipliers) {
    const endAge = this.getAge(startAge, duration, multipliers)
    const startRate = this.getFoodRate(startAge, multipliers)
    const endRate = this.getFoodRate(endAge, multipliers)

    return ((startRate + endRate) * duration) / 2
  }
}

export interface FoodData {
  name: string
  stackSize: number
  spoilSeconds: number | null
  weight: number
}

export class Food {
  name: string
  stackSize: number
  spoilTime: Duration | null
  weight: number

  constructor(data: { name: string; stackSize: number; spoilTime: Duration | null; weight: number }) {
    this.name = data.name
    this.stackSize = data.stackSize
    this.weight = data.weight
    this.spoilTime = data.spoilTime
  }

  static from(data: FoodData) {
    return new Food({
      name: data.name,
      stackSize: data.stackSize,
      spoilTime: data.spoilSeconds ? Duration.fromObject({ seconds: data.spoilSeconds }) : null,
      weight: data.weight,
    })
  }
}

export interface DietData {
  name: string
  food: {
    [key: string]: number
  }
}

export class Diet {
  name!: string
  food!: { food: Food; foodPoints: number }[]

  constructor(data: { name: string; food: { food: Food; foodPoints: number }[] }) {
    this.name = data.name
    this.food = data.food
  }

  static from(data: DietData, foods: { [key: string]: Food }) {
    return new Diet({
      name: data.name,
      food: Object.keys(data.food).map(key => {
        return { food: foods[key], foodPoints: data.food[key] }
      }),
    })
  }
}

export type TroughType = 'player' | 'normal' | 'tek'
