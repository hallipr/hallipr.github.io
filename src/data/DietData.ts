
export default interface DietData {
  name: string;
  food: {
    [key: string]: number;
  };
}
