// Purpose: Contains utility functions for the application.

// Function to round a number to a specified number of decimal places.
export function round(value: number, decimals: number) : number {
    return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals);
}

// Function to calculate the time it takes for a value to reach zero given an initial rate of decay and deceleration.
export function timeToZero(value: number, initialRate: number, rateDecay: number) : number {
    if(rateDecay === 0) {
        return initialRate == 0 ? 0 : value / initialRate;
    }

    return (initialRate-Math.sqrt(Math.pow(initialRate,2) - 2 * rateDecay * value)) / rateDecay;
}