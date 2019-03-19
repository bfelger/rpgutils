////////////////////////////////////////////////////////////////////////////////
// rpgutils.js                                                                //
//----------------------------------------------------------------------------//
// JS library for dynamic generation of web content for TTRPG's               //
// 2019-03-19 - Brandon Felger                                                //
//----------------------------------------------------------------------------//
// This work is licensed under a Creative Commons Attribution 4.0 Internatio- //
// nal license (CC BY 4.0).                                                   //
// https://creativecommons.org/licenses/by/4.0/                               //
////////////////////////////////////////////////////////////////////////////////

/**
 * 
 */

'use strict';

// Constants and enums

/**
 * Enum of ability scores. For 6-element arrays representing ability scores, 
 * this is each ability score's respective postition in the array.
 * @enum {Object}
 */
const Ability = {
    STR: 0,
    DEX: 1,
    CON: 2,
    INT: 3,
    WIS: 4,
    CHA: 5
}

/**
 * Enum of ability scores weights. Used by WeightedAssignment to determine stat
 * priority.
 * @enum {Object}
 */
const Weight = {
    PRIME: 2,
    SECONDARY: 1,
    NORMAL: 0,
    DUMP: -1
}

/**
 * Represents a custom dice-pool of varying sizes of dice.
 */
class DicePool {
    /**
     * Creates the dice pool.
     */
    constructor() { 
        this.pool = [];
    }
    
////////////////////////////////////////////////////////////////////////////////
// Thanks to sindilevich for function:                                        //
// https://stackoverflow.com/a/42321673                                       //
//----------------------------------------------------------------------------//
// This work is licensed under a Creative Commons Attribution-ShareAlike 3.0  //
// Unported license (CC BY-SA 3.0).                                           //
// https://creativecommons.org/licenses/by-sa/3.0/                            //
////////////////////////////////////////////////////////////////////////////////
    static getRandomIntInclusive(min, max) {
        const randomBuffer = new Uint32Array(1);

        window.crypto.getRandomValues(randomBuffer);

        let randomNumber = randomBuffer[0] / (0xffffffff + 1);

        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(randomNumber * (max - min + 1)) + min;
    }
    
    /**
     * Roll one die, return the result. Does not use a pool, and does not require instantiation.
     * @param {int} sides - Number of sides on the die.
     */
    static rollOne(sides) {
        return DicePool.getRandomIntInclusive(1, sides);
    }
    
    /**
     * Add dice to the dice pool.
     * @param {int} amount - Number of dice to add.
     * @param {int} sides - Number of sides on the dice.
     */
    addDice(amount, sides) {
        if (this.pool.hasOwnProperty(sides))
            this.pool[sides] += amount;
        else
            this.pool[sides] = amount;
    }
    
    /**
     * Roll all dice and return the sum.
     * @returns {int} The sum total of all dice rolled.
     */
    rollSum() {
        var total = 0;
        var i;
        var sides;
        for (sides in this.pool) {
            for (i = 0; i < this.pool[sides]; i++) {
                total += DicePool.getRandomIntInclusive(1, sides);
            }
        }
        return total;
    }

    /**
     * Roll all dice and return each die result in an array.
     * @returns {int[]} An array with all dice results.
     */
    rollEach() {
        var result = [];
        var index = 0;
        var i;
        var sides;
        for (sides in this.pool) {
            for (i = 0; i < this.pool[sides]; i++) {    
                result[index++] = DicePool.getRandomIntInclusive(1, sides);
            }
        }
        return result;4
    }
    
    /**
     * Roll all dice and arrange them in descending order.
     * @returns {int[]} An array with all dice results, ordered.
     */
    rollEachDescending() {
        var result = this.rollEach();
        var j;
        for (j = 1; j < result.length; j++) {
            var key = result[j];
            var i = j - 1;
            while (i >= 0 && result[i] < key) {
                result[i + 1] = result[i];
                i = i - 1;
                result[i + 1] = key;
            }
        }
        
        return result;
    }
}

/**
 * Holds ability scores and computes their modifiers. 
 */
class AbilityScores {
    constructor() {
        /**
         * Holds ability scores to make it easier to pass them to a validator 
         * for post-validation in schemes where raw values aren't a linear 
         * array (like grid method).
         */
        this.rawScores = [];
        
        for (var i = 0; i++; i < 6)
            this.rawScores = 10;
    }
    
    static getMod(score) {
        return Math.floor((score - 10) / 2);
    }
    
    static getModDisplay(score) {
        var mod = AbilityScores.getMod(score);
        return (mod > 0 ? "+" : "") + mod;
    }
    
    get str() { return this.rawScores[Ability.STR]; }
    get dex() { return this.rawScores[Ability.DEX]; }
    get con() { return this.rawScores[Ability.CON]; }
    get int() { return this.rawScores[Ability.INT]; }
    get wis() { return this.rawScores[Ability.WIS]; }
    get cha() { return this.rawScores[Ability.CHA]; }
    
    set str(newScore) { this.rawScores[Ability.STR] = newScore; }
    set dex(newScore) { this.rawScores[Ability.DEX] = newScore; }
    set con(newScore) { this.rawScores[Ability.CON] = newScore; }
    set int(newScore) { this.rawScores[Ability.INT] = newScore; }
    set wis(newScore) { this.rawScores[Ability.WIS] = newScore; }
    set cha(newScore) { this.rawScores[Ability.CHA] = newScore; }
    
    get strMod() { return AbilityScores.getMod(this.str); }
    get dexMod() { return AbilityScores.getMod(this.dex); }
    get conMod() { return AbilityScores.getMod(this.con); }
    get intMod() { return AbilityScores.getMod(this.int); }
    get wisMod() { return AbilityScores.getMod(this.wis); }
    get chaMod() { return AbilityScores.getMod(this.cha); }
    
    get strModDisplay() { return AbilityScores.getModDisplay(this.str); }
    get dexModDisplay() { return AbilityScores.getModDisplay(this.dex); }
    get conModDisplay() { return AbilityScores.getModDisplay(this.con); }
    get intModDisplay() { return AbilityScores.getModDisplay(this.int); }
    get wisModDisplay() { return AbilityScores.getModDisplay(this.wis); }
    get chaModDisplay() { return AbilityScores.getModDisplay(this.cha); }
}

/**
 * Base class for all generation methods.
 * Pretty useless on its own.
 */
class GenerationMethod {
    /**
     * Constructor that automatically calls generateNewScores.
     */
    constructor() {
        this.scores = [];
        this.generateNewScores();
    } 
    
    /**
     * If you override this method, this base class will call the descendent
     * method instead. This implementation is uninteresting, and serves 
     * merely as a placeholder.
     */
    generateNewScores() {
        this.scores = [10, 10, 10, 10, 10, 10];
    }
}

/**
 * Generates an "elite" standard array.
 */
class StandardArrayMethod extends GenerationMethod {
    constructor() {
        super();
    } 
    
    generateNewScores() {
        this.scores = [15, 14, 13, 12, 10, 8];
    }
}

/**
 * For each stat, roll 3d6 and total them.
 */
class Roll3d6Method extends GenerationMethod {
    constructor() {
        super(); 
    } 
    
    generateNewScores() {
        var pool = new DicePool();
        pool.addDice(3, 6);
        
        for (var i = 0; i < 6; i++)
            this.scores[i] = pool.rollSum();
    }
}

/**
 * For each stat, roll 4d6, drop the lowest, and total them.
 */
class Roll4d6Drop1Method extends GenerationMethod {
    constructor() {
        super();
    } 
    
    generateNewScores() {
        var pool = new DicePool();
        pool.addDice(4, 6);
        for (var i = 0; i < 6; i++) {
            // Roll 4, arranging them from greatest to least.
            // Discard the lowest; sum the rest..
            var dice = pool.rollEachDescending();
            this.scores[i] = dice[0] + dice[1] + dice[3];
        }
    }
}

/**
 * Base class for all ability score validators.
 */
class ScoreValidator {
    constructor() {
        
    }
    
    validate(scores) {
        return true;
    }
}

/**
 * Given a lower threshold and a limit on occurances, this class will
 * reject any data-set with a number of scores below the threshold 
 * past the given limit.
 */
class LowScoreValidator extends ScoreValidator {
    /**
     * @param {int} lowScore The lowest number allowed without restriction.
     * @param {int} maxAllowed The most occurances of numbers lower than lowScore
     *     allowed before the scores are marked invalid.
     */
    constructor(lowScore, maxAllowed) {
        super();
        
        this.lowScore = lowScore;
        this.maxAllowed = maxAllowed;
    }
    
    validate(scores) {
        console.log("LowScoreValidator: " + scores);
        var i;
        var found = 0;
        for (i = 0; i < scores.length; i++) {
            if (scores[i] < this.lowScore) {
                found++;
                if (found > this.maxAllowed) {
                    console.log("Scores are too low.");
                    return false;
                }
            }
        }
        return true;
    }
}

/**
 * Same as LowScoreValidator, but in reverse. Rejects based on
 * rolls OVER the threshold.
 */
class HighScoreValidator extends ScoreValidator {    /**
     * @param {int} highScore The highest number allowed without restriction.
     * @param {int} maxAllowed The most occurances of numbers higher than higScore
     *     allowed before the scores are marked invalid.
     */
    constructor(highScore, maxAllowed) {
        super();
        
        this.highScore = highScore;
        this.maxAllowed = maxAllowed;
    }
    
    validate(scores) {
        console.log("HighScoreValidator: " + scores);
        var i;
        var found = 0;
        for (i = 0; i < scores.length; i++) {
            if (scores[i] > this.highScore) {
                found++;
                if (found > this.maxAllowed) {
                    console.log("Scores are too high.");
                    return false;
                }
            }
        }
        return true;
    }
}

/**
 * Base class for ability score assignment. This particular implementation 
 * merely copies the raw values from the generation method over to ability
 * scores.
 */
class ScoreAssignment {
    constructor() { 
        this.abilityScores = new AbilityScores();
        this.method = new GenerationMethod();
        this.preValidators = [];
        this.postValidators = [];
        this.maxRetries = 10;
    }
    
    /**
     * Add a score validator to be run on the raw scores before they are assigned.
     * @param {ScoreValidator} validator Pre-assignment validator. Validates raw scores.
     */
    addPreValidator(validator) {
        this.preValidators.push(validator)
    }
    
    /**
     * Add a score validator to be run on the AbilityScores object after scores
     * are assigned. Useful for generation methods that use a larger pool of numbers
     * than 6 (such as a grid method).
     * @param {ScoreValidator} validator Post-assignment validator. 
     *     Validates AbilityScores object after all scores are assigned.
     */
    addPostValidator(validator) {
        this.postValidators.push(validator)
    }
    
    /**
     * This method validates raw scores (generating new ones, if needed), and assigns them.
     * Runs all pre-and-post validations.
     */
    generateAndAssign() {
        var retries = 0;
        var valid;
        
        do {
            console.log("Got new scores. Pre-validating: " + this.method.scores);
            valid = true;
            for (var i = 0; i < this.preValidators.length; i++) {
                // Didn't use Object.keys().forEach() because we would lose "this"
                // and not be able to reference this.method.
                if (!this.preValidators[i].validate(this.method.scores)) {
                    console.log("Failed pre-validation.");
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                console.log("Scores are valid (according to pre-validation).");
                console.log("Assigning scores.");
                this.assignScores();
                
                console.log("Scores assigned. Post-validating: " + this.abilityScores.rawScores);
                for (var i = 0; i < this.postValidators.length; i++) {
                    // Didn't use Object.keys().forEach() because we would lose "this"
                    // and not be able to reference this.method.
                    if (!this.postValidators[i].validate(this.abilityScores.rawScores)) {
                        console.log("Failed post-validation.");
                        valid = false;
                        break;
                    }
                }
            }
            
            if (!valid) {
                console.log("Invalid. Re-running method to generate new scores.");
                this.method.generateNewScores();
                retries++;
            }
        } while (!valid && retries < this.maxRetries);
        
        if (!valid) {
            console.log("Failed more than " + this.maxRetries + " times. Bailing and returning what we have.")
        }
    }
    
    /**
     * Override this with your prefered assignment method.
     */
    assignScores() {
        console.log("Simple base assignment")
        for (var i = 0; i < 6; i++) {
            this.abilityScores.rawScores[i] = this.method.scores[i];
        }
    }
}

/**
 * Given weights for each ability score, this ScoreAssignment subclass will 
 * assign weights by the given preference. If more than one stat has the same
 * priority, it will fill them in random order.
 */
class WeightedAssignment extends ScoreAssignment {
    constructor() {
        super();
        
        this.weights = [
            Weight.NORMAL,
            Weight.NORMAL,
            Weight.NORMAL,
            Weight.NORMAL,
            Weight.NORMAL,
            Weight.NORMAL
        ];
    }
    
    /**
     * Set all weights at once, using values in the Weight enum.
     * @param {number[]} Array of 6 numbers representing stat weights, in order
     */
    setWeights(weights) {
        this.weights = weights;
    }
    
    /**
     * Set individual weights, using the Ability and Weight enums.
     * @param {number} Ability enum value
     * @param {number} Weight enum value
     */
    setWeight(ability, weight) {
        this.weights[ability] = weight;
    }
    
    /**
     * Override of base method. Arranges stats into priority buckets, and fills
     * them in order.
     */
    assignScores() {
        var primeStats = [];
        var secondaryStats = [];
        var normalStats = [];
        var dumpStats = [];
        
        for (var i = 0; i < 6; i++) {
            switch (this.weights[i]) {
                case Weight.PRIME:
                    primeStats.push(i);
                    break;
                
                case Weight.SECONDARY:
                    secondaryStats.push(i);
                    break;
                    
                case Weight.NORMAL:
                    normalStats.push(i);
                    break;
                    
                case Weight.DUMP:
                    dumpStats.push(i);
                    break;
            }
        }
        
        console.log("Assigning prime stats.");
        this.assignAbility(primeStats);
        
        console.log("Assigning secondary stats.");
        this.assignAbility(secondaryStats);
        
        console.log("Assigning normal stats.");
        this.assignAbility(normalStats);
        
        console.log("Assigning dump stats.");
        this.assignAbility(dumpStats);
    }
    
    assignAbility(stats) {
        while (stats.length > 0) {
            if (stats.length >= 2) {
                var i = DicePool.rollOne(stats.length) - 1;
                this.abilityScores.rawScores[stats[i]] = this.getHighestScore();
                
                console.log("Assigned " + this.abilityScores.rawScores[i] + " to " + stats[i]);
                
                stats.splice(i, 1);
            } else if (stats.length == 1) {
                this.abilityScores.rawScores[stats[0]] = this.getHighestScore();
                
                console.log("Assigned " + this.abilityScores.rawScores[stats[0]] + " to " + stats[0]);
                
                stats.splice(0, 1);
            }
        }
    }
    
    getHighestScore() {
        var highest = 0;
        
        for (var i = 0; i < 6; i++) {
            if (this.method.scores[i] > this.method.scores[highest]) {
                highest = i;
            }
        }
        
        var score = this.method.scores[highest];
        this.method.scores[highest] = -100;
        
        return score;
    }
}
