export function round(value: number, decimals: number) : number {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

export function timeToZero(amount: number, rateStart:number, rateEnd: number): number {
    return (rateStart-Math.sqrt(Math.pow(rateStart,2)-2*rateEnd*amount))/rateEnd
  }