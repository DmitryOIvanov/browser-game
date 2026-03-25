import { enemySpawningInfo, getRandomPosWithMargins } from "../../enemySpawning.js";
import playField from "../../playField.js";

const { AbstractWeightedSpawnTask } = require("../../tasks.js");

const targetImpacts = [10];

function getTargetImpact(level) {
    return 10 * Math.pow(2, level);
}

function getDelayCoefficient(level) {
    return 15 * Math.pow(0.5, level / 4);
}

const generalEnemyInfo = [
    { name: "SmallSquare", frequency: 1, impact: 1 },
    { name: "SmallTriangle", frequency: 1, impact: 1 },
    { name: "SmallCircle", frequency: 1, impact: 1 },
    { name: "MultiSquare", frequency: 0.5, impact: 4 },
    { name: "MultiTriangle", frequency: 0.5, impact: 4 },
    { name: "MultiCircle", frequency: 0.5, impact: 4 },
];

const frequencyTotal = generalEnemyInfo.reduce((sum, entry) => (sum + entry.frequency), 0);
const avgImpact = generalEnemyInfo.reduce((sum, entry) => (sum + entry.frequency * entry.impact), 0) / frequencyTotal;

function getRandomEnemy(rng) {
    const randValue = frequencyTotal * rng.next();
    let sum = 0;
    for (let i = 0; i < generalEnemyInfo.length; i++) {
        sum += generalEnemyInfo[i].frequency;
        if (randValue < sum) {
            return generalEnemyInfo[i];
        }
    }
    return generalEnemyInfo[0];
}

export class ProceduralWeightedSpawnTask extends AbstractWeightedSpawnTask {
    constructor(level, rng) {
        super();
        this.rng = rng;
        this.level = level;
        this.accumulatedImpact = 0;
    }

    spawnNext() {
        const enemy = getRandomEnemy(this.rng);
        const spawningInfo = enemySpawningInfo[enemy.name];
        if (!spawningInfo) throw new Error(`Could not find enemy '${enemy.name}'`);
        const pos = getRandomPosWithMargins(spawningInfo.rad, AbstractWeightedSpawnTask.PLAYER_CLEARANCE);
        playField.announceEnemyWeight(enemy.weight);
        spawningInfo.spawn(enemy.weight, pos.x, pos.y);

        this.accumulatedImpact += enemy.impact;
        if (this.accumulatedImpact >= getTargetImpact(this.level) - 0.5 * avgImpact) {
            this.concluded = true;
        }
    }

    getTimeToNext() {
        return playField.enemyWeight * getDelayCoefficient(this.level);
    }
}
