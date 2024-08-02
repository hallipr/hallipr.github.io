import Diet from '../types/Diet'
import Food from '../types/Food'
import Species from '../types/Species'
import { type TroughType } from '../types/TroughType'
import RawData from './RawData'

const food = RawData.food.reduce(
  (acc, current) => {
    acc[current.name] = Food.from(current)
    return acc
  },
  <{ [key: string]: Food }>{}
)

const diets = RawData.diets.reduce(
  (acc, current) => {
    acc[current.name] = Diet.from(current, food)
    return acc
  },
  <{ [key: string]: Diet }>{}
)

const species = RawData.species.reduce(
  (acc, current) => {
    acc[current.name] = Species.from(current, diets)
    return acc
  },
  <{ [key: string]: Species }>{}
)

const troughMultipliers: Record<TroughType, number> = {
  player: 1,
  normal: 4,
  tek: 100,
}

export default {
  food,
  diets,
  species,
  troughMultipliers,
}
