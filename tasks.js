import BgMessage from "./bgMessage.js";
import { enemySpawningInfo, getRandomPosWithMargins } from "./enemySpawning.js";
import playField from "./playField.js";
import { TaskPerformer } from "./taskBasedManager.js";

const PLAYER_CLEARANCE = 300;
export class WeightedSpawnTask {
    constructor(readonlyParams) {
        this.delayCoeff = readonlyParams.delayCoeff;

        this.spawnList = structuredClone(readonlyParams.enemies);
        this.groupIndex = 0;
        this.nextSpawn = this.popNextSpawn();

        this.timePassed = 0;
        this.concluded = false;
    }

    timeStep(amount) {
        if (this.concluded) return;
        this.timePassed += amount;
        let timeToNext = this.getTimeToNext();
        while (this.timePassed >= timeToNext) {
            const enemyInfo = enemySpawningInfo[this.nextSpawn.name];
            const pos = getRandomPosWithMargins(enemyInfo.rad, PLAYER_CLEARANCE);
            playField.announceEnemyWeight(this.nextSpawn.weight);
            enemyInfo.spawn(this.nextSpawn.weight, pos.x, pos.y);

            this.nextSpawn = this.popNextSpawn();
            if (!this.nextSpawn) {
                this.concluded = true;
                return;
            }
            this.timePassed -= timeToNext;
            timeToNext = this.getTimeToNext();
        }
    }

    popNextSpawn() {
        if (this.groupIndex >= this.spawnList.length) return null;
        let returnVal = null;
        if (this.spawnList[this.groupIndex].shuffle) {
            const list = this.spawnList[this.groupIndex].shuffle;
            const totalEnemies = list.reduce((sum, entry) => (sum + entry.num), 0);
            const randIndex = Math.floor(Math.random() * totalEnemies);
            let curSum = list[0].num;
            let index = 0;
            while (curSum <= randIndex) {
                index++;
                curSum += list[index].num;
            }
            returnVal = list[index];
            list[index].num--;
            if (totalEnemies <= 1) this.groupIndex++;
        } else {
            returnVal = this.spawnList[this.groupIndex];
            this.spawnList[this.groupIndex].num--;
            if (this.spawnList[this.groupIndex].num <= 0) this.groupIndex++;
        }
        return returnVal;
    }

    getTimeToNext() {
        return playField.enemyWeight * this.delayCoeff;
    }
}

export class WaitForConditionTask {
    constructor(readonlyParams) {
        this.condition = readonlyParams.condition;
        this.concluded = false;
    }

    timeStep(amount) { this.concluded = this.condition(); }
}

export class WaitTimeTask {
    constructor(readonlyParams) {
        this.targetTime = readonlyParams.time;
        this.timePassed = 0;
        this.concluded = false;
    }

    timeStep(amount) {
        this.timePassed += amount;
        this.concluded = this.timePassed >= this.targetTime;
    }
}

export class MessageTask {
    constructor(readonlyParams) {
        this.messageObject = new BgMessage(readonlyParams);
        this.msgAdded = false;
        this.concluded = false;
    }

    timeStep(amount) {
        if (!this.msgAdded) {
            playField.addBackgroundParticle(this.messageObject);
            this.msgAdded = true;
        }
        if (this.messageObject.retired) this.concluded = true;
    }
}

export class CreateStaticBgParticleTask {
    constructor(readonlyParams) {
        playField.addTrackedBackgroundParticle(
            new readonlyParams.particleClass(readonlyParams),
            readonlyParams.id
        );
        this.concluded = true;
    }
}

export class DeleteStaticBgParticleTask {
    constructor(readonlyParams) {
        playField.deleteTrackedBackgroundParticle(readonlyParams.id);
        this.concluded = true;
    }
}

export class CreateBgParticleAndWaitForRetirementTask {
    constructor(readonlyParams) {
        this.particle = new readonlyParams.particleClass(readonlyParams);
        this.particleAdded = false;
        this.concluded = false;
    }

    timeStep(amount) {
        if (!this.particleAdded) {
            playField.addBackgroundParticle(this.particle);
            this.particleAdded = true;
        }
        if (this.particle.retired) {
            this.concluded = true;
        }
    }
}

export class RunBgParticleMethodTask {
    constructor(readonlyParams) {
        playField.getTrackedBackgroundParticle(readonlyParams.id)[readonlyParams.method](readonlyParams);
        this.concluded = true;
    }
}

export class WaitForBgParticleRetirementTask {
    constructor(readonlyParams) {
        this.particle = playField.getTrackedBackgroundParticle(readonlyParams.id);
        this.concluded = this.particle.retired;
    }

    timeStep(amount) {
        this.concluded = this.particle.retired;
    }
}

export class PerformTasksTask {
    constructor(readonlyParams) {
        this.performer = new TaskPerformer(readonlyParams.tasks);
        this.concluded = false;
    }

    timeStep(dt) {
        if (this.concluded) return;
        this.performer.timeStep(dt);
        if (this.performer.concluded) this.concluded = true;
    }
}
