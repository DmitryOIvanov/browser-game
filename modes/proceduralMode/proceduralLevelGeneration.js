import { enemySpawningInfo, getRandomPosWithMargins } from "../../enemySpawning.js";
import playField from "../../playField.js";
import { AbstractWeightedSpawnTask } from "../../tasks.js";

function getTargetImpact(level) {
    return 20 * Math.pow(2, level);
}

function getDelayCoefficient(level) {
    return 10 * Math.pow(0.5, level);
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
    constructor(readonlyParams) {
        super();
        this.rng = readonlyParams.rng;
        this.level = readonlyParams.level;
        this.accumulatedImpact = 0;
    }

    spawnNext() {
        const enemy = getRandomEnemy(this.rng);
        const spawningInfo = enemySpawningInfo[enemy.name];
        if (!spawningInfo) throw new Error(`Could not find enemy '${enemy.name}'`);
        const pos = getRandomPosWithMargins(spawningInfo.rad, AbstractWeightedSpawnTask.PLAYER_CLEARANCE);
        playField.announceEnemyWeight(enemy.impact);
        spawningInfo.spawn(enemy.impact, pos.x, pos.y);

        this.accumulatedImpact += enemy.impact;
        if (this.accumulatedImpact >= getTargetImpact(this.level) - 0.5 * avgImpact) {
            this.concluded = true;
        }
    }

    getTimeToNext() {
        return playField.enemyWeight * getDelayCoefficient(this.level);
    }
}
