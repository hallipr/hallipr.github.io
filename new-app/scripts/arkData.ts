import Species from "./Species";
import data from "../data/arkData.json"

export default {
  species: data.species as Species[],
  food: data.food,
}