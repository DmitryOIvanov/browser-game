import { enemySpawningInfo, getRandomPosWithMargins } from "./enemySpawning.js";
import playField from "./playField.js";

class EnemyPool {
    constructor(){
        this.totalWeight = 0;
        this.enemyEntries = [];
    }

    addEnemyEntry(enemyRef, weight){
        this.totalWeight += weight;
        this.enemyEntries.push({
            enemyRef: enemyRef,
            weight: weight
        });
    }

    discardRetiredEntries(){
        for(let i=0; i<this.enemyEntries.length; i++){
            const enemy = this.enemyEntries[i].enemyRef.enemy;
            if(enemy && enemy.retired){
                this.totalWeight -= this.enemyEntries[i].weight;
                this.enemyEntries[i] = this.enemyEntries[this.enemyEntries.length-1];
                this.enemyEntries.pop();
            }
        }
    }
}

const PLAYER_CLEARANCE = 300;
class WeightedSpawnTask {
    constructor(readonlyParams){
        this.enemyPool = readonlyParams.enemyPool;
        this.delayCoeff = readonlyParams.delayCoeff;
        this.spawnList = [];
        for(let entry of readonlyParams.enemies){
            for(let i=0; i<entry.num; i++){
                this.spawnList.push({name:entry.name, weight:entry.weight});
            }
        }
        shuffleArray(this.spawnList);
        this.spawnIndex = 0;

        this.timePassed = 0;
        this.concluded = false;
    }

    timeStep(amount){
        if(this.concluded) return;
        this.timePassed += amount;
        let timeToNext = this.getTimeToNext();
        while(this.timePassed >= timeToNext){
            const spawnListEntry = this.spawnList[this.spawnIndex];
            const enemyInfo = enemySpawningInfo[spawnListEntry.name];
            const pos = getRandomPosWithMargins(enemyInfo.rad,PLAYER_CLEARANCE);
            const newEnemyRef = enemyInfo.spawn(pos.x, pos.y);
            this.enemyPool.addEnemyEntry(newEnemyRef, spawnListEntry.weight);

            this.spawnIndex++;
            if(this.spawnIndex >= this.spawnList.length){
                this.concluded = true;
                return;
            }
            this.timePassed -= timeToNext;
            timeToNext = this.getTimeToNext();
        }
    }

    getTimeToNext(){
        const nextWeight = this.spawnList[this.spawnIndex].weight;
        return this.enemyPool.totalWeight * nextWeight * nextWeight * this.delayCoeff;
    }
}

class WaitForConditionTask {
    constructor(readonlyParams){
        this.condition = readonlyParams.condition;
        this.concluded = false;
    }

    timeStep(amount){this.concluded = this.condition();}
}

class WaitTimeTask {
    constructor(readonlyParams){
        this.targetTime = readonlyParams.time;
        this.timePassed = 0;
        this.concluded = false;
    }

    timeStep(amount){
        this.timePassed += amount;
        this.concluded = this.timePassed >= this.targetTime;
    }
}

const enemyPoolA = new EnemyPool();

const tasks = [
    {
        taskClass: WaitTimeTask,
        time: 60
    },{
        taskClass: WeightedSpawnTask,
        enemyPool: enemyPoolA,
        delayCoeff: 1,
        enemies:[
            {name:"SmallSquare",weight:1,num:20},
            {name:"SmallTriangle",weight:1,num:20},
            {name:"SmallCircle",weight:1,num:20},
            {name:"SimpleShooter",weight:2,num:10},
        ]
    },{
        taskClass: WaitForConditionTask,
        condition: ()=>(playField.isDangerFree())
    },{
        taskClass: WaitTimeTask,
        time: 60
    }
];

export default class EnemyRoundManager {
    constructor(){
        this.tasks = tasks;
        this.concluded = false;
        this.nextTaskIndex = 0;
        this.curTask = null;
        this.startNextTask();
    }

    timeStep(amount){
        if(this.concluded) return;
        enemyPoolA.discardRetiredEntries();
        this.curTask.timeStep(amount);
        if(this.curTask.concluded){
            if(this.nextTaskIndex<this.tasks.length){
                this.startNextTask();
            }else{
                this.concluded = true;
            }
        }
    }

    startNextTask(){
        const taskInfo = this.tasks[this.nextTaskIndex];
        const taskClass = taskInfo.taskClass;
        this.curTask = new taskClass(taskInfo);
        this.nextTaskIndex++;
    }
}

function shuffleArray(arr){
    for(let i=1; i<arr.length; i++){
        const randIndex = Math.floor(Math.random()*(i+1));
        const temp = arr[randIndex];
        arr[randIndex] = arr[i];
        arr[i] = temp;
    }
}