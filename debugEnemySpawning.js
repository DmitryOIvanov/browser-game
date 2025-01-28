import Color from "./color.js";
import controls from "./controls.js";
import { enemySpawningInfo, getRandomPosWithMargins } from "./enemySpawning.js";
import BigExplosionParticle from "./particles/bigExplosionParticle.js";
import playField from "./playField.js";

const MAX_SPAWN_ATTEMPTS = 100;

const specificSpawnInfo = [
    {
        name: "SmallSquare",
        probWeight: 200,
        cooldown: 30
    },{
        name: "SmallCircle",
        probWeight: 200,
        cooldown: 30
    },{
        name: "SmallTriangle",
        probWeight: 200,
        cooldown: 30
    },{
        name: "MultiSquare",
        probWeight: 50,
        cooldown: 120
    },{
        name: "MultiCircle",
        probWeight: 50,
        cooldown: 120
    },{
        name: "MultiTriangle",
        probWeight: 50,
        cooldown: 120
    },{
        name: "ShieldedCircle",
        probWeight: 25,
        cooldown: 180
    },{
        name: "SimpleShooter",
        probWeight: 80,
        cooldown: 60
    },{
        name: "BombEnemy",
        probWeight: 30,
        cooldown: 60
    },{
        name: "LaserShooter",
        probWeight: 50,
        cooldown: 60
    },{
        name: "ThreeShooter",
        probWeight: 20,
        cooldown: 120
    },{
        name: "FlowerTower",
        probWeight: 10,
        cooldown: 300
    },{
        name: "HeavyTower",
        probWeight: 10,
        cooldown: 300
    },{
        name: "LaserTower",
        probWeight: 10,
        cooldown: 300
    }
];

const WEIGHT_SUM = specificSpawnInfo.reduce((curSum,nextEntry)=>(curSum+nextEntry.probWeight), 0);
const PLAYER_CLEARANCE = 300;

export default class DebugEnemySpawning {
    constructor(){
        this.concluded = false;
        this.spawnTimer = 0;
    }

    timeStep(amount){
        if(controls.pressed["KeyP"]){
            playField.addParticle(new BigExplosionParticle(300,300,100,300,60,Color.WHITE));
        }

        this.spawnTimer -= amount;
        while(this.spawnTimer <= 0){
            const randNum = WEIGHT_SUM*Math.random();
            let curProbSum = 0;
            for(let entry of specificSpawnInfo){
                curProbSum += entry.probWeight;
                if(randNum < curProbSum){
                    const generalInfo = enemySpawningInfo[entry.name];
                    const pos = getRandomPosWithMargins(generalInfo.rad,PLAYER_CLEARANCE);
                    generalInfo.spawn(pos.x, pos.y);
                    this.spawnTimer += entry.cooldown;
                    break;
                }
            }
        }
    }
}