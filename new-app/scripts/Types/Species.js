"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Species = /** @class */ (function () {
    function Species(partial) {
        Object.assign(this, partial);
    }
    Species.prototype.GetBabyFoodRate = function (age) {
        if (age >= 1.0)
            return this.adultFoodRate;
        return this.babyFoodRateStart + (this.babyFoodRateEnd - this.babyFoodRateStart) * age;
    };
    ;
    Species.prototype.GetFoodPointsConsumed = function (startAge, duration) {
        var endAge = Math.min(startAge + duration * this.ageSpeed, 1.0);
        var startRate = this.GetBabyFoodRate(startAge);
        var endRate = this.GetBabyFoodRate(endAge);
        return (startRate + endRate) * duration / 2;
    };
    ;
    return Species;
}());
exports.default = Species;
