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

let poolCollection = {};
function emptyPools(){
    for(const name in poolCollection){
        poolCollection[name].discardRetiredEntries();
    }
}
function clearPools(){
    poolCollection = {};
}
function getPool(name){
    if(!poolCollection[name]){
        poolCollection[name] = new EnemyPool();
    }
    return poolCollection[name];
}

const PLAYER_CLEARANCE = 300;
class WeightedSpawnTask {
    constructor(readonlyParams){
        this.enemyPool = getPool(readonlyParams.pool);
        this.delayCoeff = readonlyParams.delayCoeff;

        this.spawnList = structuredClone(readonlyParams.enemies);
        this.groupIndex = 0;
        this.nextSpawn = this.popNextSpawn();

        this.timePassed = 0;
        this.concluded = false;
    }

    timeStep(amount){
        if(this.concluded) return;
        this.timePassed += amount;
        let timeToNext = this.getTimeToNext();
        while(this.timePassed >= timeToNext){
            const enemyInfo = enemySpawningInfo[this.nextSpawn.name];
            const pos = getRandomPosWithMargins(enemyInfo.rad,PLAYER_CLEARANCE);
            const newEnemyRef = enemyInfo.spawn(pos.x, pos.y);
            this.enemyPool.addEnemyEntry(newEnemyRef, this.nextSpawn.weight);

            this.nextSpawn = this.popNextSpawn();
            if(!this.nextSpawn){
                this.concluded = true;
                return;
            }
            this.timePassed -= timeToNext;
            timeToNext = this.getTimeToNext();
        }
    }

    popNextSpawn(){
        if(this.groupIndex >= this.spawnList.length) return null;
        let returnVal = null;
        if(this.spawnList[this.groupIndex].shuffle){
            const list = this.spawnList[this.groupIndex].shuffle;
            const totalEnemies = list.reduce((sum,entry)=>(sum+entry.num),0);
            const randIndex = Math.floor(Math.random()*totalEnemies);
            let curSum = list[0].num;
            let index = 0;
            while(curSum <= randIndex){
                index++;
                curSum += list[index].num;
            }
            returnVal = list[index];
            list[index].num--;
            if(totalEnemies <= 1) this.groupIndex++;
        }else{
            returnVal = this.spawnList[this.groupIndex];
            this.spawnList[this.groupIndex].num--;
            if(this.spawnList[this.groupIndex].num <= 0) this.groupIndex++;
        }
        return returnVal;
    }

    getTimeToNext(){
        const nextWeight = this.nextSpawn.weight;
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

const tasks = [
    {
        taskClass: WaitTimeTask,
        time: 60
    },{
        taskClass: WeightedSpawnTask,
        pool: "A",
        delayCoeff: 1,
        enemies:[
            {name:"MultiCircle",weight:3,num:20},
            {shuffle:[
                {name:"SmallSquare",weight:1,num:20},
                {name:"SmallTriangle",weight:1,num:20},
                {name:"SmallCircle",weight:1,num:20},
                {name:"SimpleShooter",weight:2,num:10},
            ]}
        ]
    },{
        taskClass: WaitForConditionTask,
        condition: ()=>(playField.isDangerFree())
    },{
        taskClass: WeightedSpawnTask,
        pool: "A",
        delayCoeff: 1,
        enemies:[
            {name:"MultiSquare",weight:1,num:20}
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
        clearPools();
        this.tasks = tasks;
        this.concluded = false;
        this.nextTaskIndex = 0;
        this.curTask = null;
        this.startNextTask();
    }

    timeStep(amount){
        if(this.concluded) return;
        emptyPools();
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