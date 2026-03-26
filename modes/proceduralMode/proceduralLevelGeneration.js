import { enemySpawningInfo, getRandomPosWithMargins } from "../../enemySpawning.js";
import playField from "../../playField.js";
import { AbstractWeightedSpawnTask } from "../../tasks.js";

function getTargetImpact(level) {
    return 20 * Math.pow(2, level);
}

function getDelayCoefficient(level) {
    return 10 * Math.pow(0.5, level);
}

const proceduralEnemyInfo = [
    { name: "SmallSquare", frequency: 1, impact: 1, level: 0 },
    { name: "SmallTriangle", frequency: 1, impact: 1, level: 0 },
    { name: "SmallCircle", frequency: 1, impact: 1, level: 0 },
    { name: "MultiSquare", frequency: 0.5, impact: 4, level: 0 },
    { name: "MultiTriangle", frequency: 0.5, impact: 4, level: 0 },
    { name: "MultiCircle", frequency: 0.5, impact: 4, level: 0 },
    { name: "ShieldedCircle", frequency: 0.2, impact: 5, level: 0 },
    { name: "Snake", frequency: 0.1, impact: 10, level: 0 },
];

export class ProceduralWeightedSpawnTask extends AbstractWeightedSpawnTask {
    constructor(readonlyParams) {
        super();
        this.rng = readonlyParams.rng;
        this.level = readonlyParams.level;
        this.accumulatedImpact = 0;

        this.frequencyTotal = 0;
        this.impactTotal = 0;
        this.modifiedFrequencies = new Array(proceduralEnemyInfo.length);
        for (let i = 0; i < proceduralEnemyInfo.length; i++) {
            const entry = proceduralEnemyInfo[i];
            if (entry.level <= this.level) {
                const modifiedFreq = entry.frequency / (this.rng.next() + 0.0001);
                this.modifiedFrequencies[i] = modifiedFreq;
                this.frequencyTotal += modifiedFreq;
                this.impactTotal += modifiedFreq * entry.impact;
            }
        }
        this.averageImpact = this.impactTotal / this.frequencyTotal;
    }

    pickEemy() {
        const randValue = this.frequencyTotal * this.rng.next();
        let sum = 0;
        for (let i = 0; i < proceduralEnemyInfo.length; i++) {
            const entry = proceduralEnemyInfo[i];
            if (entry.level <= this.level) {
                sum += this.modifiedFrequencies[i];
                if (randValue < sum) {
                    return entry;
                }
            }
        }
        return proceduralEnemyInfo[0];
    }

    spawnNext() {
        const enemy = this.pickEemy();
        const spawningInfo = enemySpawningInfo[enemy.name];
        if (!spawningInfo) throw new Error(`Could not find enemy '${enemy.name}'`);
        const pos = getRandomPosWithMargins(spawningInfo.rad, AbstractWeightedSpawnTask.PLAYER_CLEARANCE);
        playField.announceEnemyWeight(enemy.impact);
        spawningInfo.spawn(enemy.impact, pos.x, pos.y);

        this.accumulatedImpact += enemy.impact;
        if (this.accumulatedImpact >= getTargetImpact(this.level) - 0.5 * this.averageImpact) {
            this.concluded = true;
        }
    }

    getTimeToNext() {
        return playField.enemyWeight * getDelayCoefficient(this.level);
    }
}
