import SmallSquare from "./enemies/smallSquare.js";
import SmallCircle from "./enemies/smallCircle.js";
import SmallTriangle from "./enemies/smallTriangle.js";
import MultiSquare from "./enemies/multiSquare.js";
import playField from "./playField.js";
import MultiCircle from "./enemies/multiCircle.js";
import MultiTriangle from "./enemies/multiTriangle.js";
import ShieldedCircle from "./enemies/shieldedCircle.js";
import SimpleShooter from "./enemies/simpleShooter.js";
import BombEnemy from "./enemies/bombEnemy.js";
import LaserShooter from "./enemies/laserShooter.js";
import ThreeShooter from "./enemies/threeShooter.js";
import TowerBase from "./enemies/towerBase.js";
import FlowerTower from "./enemies/flowerTower.js";
import HeavyTower from "./enemies/heavyTower.js";
import LaserTower from "./enemies/laserTower.js";
import BasicSpawnerParticle from "./particles/basicSpawnerParticle.js";

export const enemySpawningInfo = {
    "SmallSquare":{
        rad: SmallSquare.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,3*SmallSquare.RAD,10,"white",()=>{
                return playField.addEnemy(new SmallSquare(x,y,0,0,20+20*Math.random()));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "SmallCircle":{
        rad: SmallCircle.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,3*SmallCircle.RAD,10,"white",()=>{
                return playField.addEnemy(new SmallCircle(x,y,0,0,2*Math.PI*Math.random()));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "SmallTriangle":{
        rad: SmallTriangle.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,3*SmallTriangle.RAD,10,"white",()=>{
                return playField.addEnemy(new SmallTriangle(x,y,0,0,2*Math.PI*Math.random()));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "MultiSquare":{
        rad: MultiSquare.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,2.5*MultiSquare.RAD,10,"white",()=>{
                playField.addEnemy(new MultiSquare(x,y,0,0,40+20*Math.random()));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "MultiCircle":{
        rad: MultiCircle.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,2*MultiCircle.RAD,10,"white",()=>{
                playField.addEnemy(new MultiCircle(x,y,0,0,2*Math.PI*Math.random()));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "MultiTriangle":{
        rad: MultiTriangle.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,2.5*MultiTriangle.RAD,10,"white",()=>{
                playField.addEnemy(new MultiTriangle(x,y,0,0,2*Math.PI*Math.random()));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "ShieldedCircle":{
        rad: ShieldedCircle.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,1.5*ShieldedCircle.RAD,10,"white",()=>{
                playField.addEnemy(new ShieldedCircle(x,y));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "SimpleShooter":{
        rad: SimpleShooter.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,1.5*SimpleShooter.RAD,10,"white",()=>{
                return playField.addEnemy(new SimpleShooter(x,y));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "BombEnemy":{
        rad: BombEnemy.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,1.5*BombEnemy.RAD,10,"white",()=>{
                playField.addEnemy(new BombEnemy(x,y));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "LaserShooter":{
        rad: LaserShooter.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,1.5*LaserShooter.RAD,10,"white",()=>{
                playField.addEnemy(new LaserShooter(x,y));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "ThreeShooter":{
        rad: ThreeShooter.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,1.5*ThreeShooter.RAD,10,"white",()=>{
                playField.addEnemy(new ThreeShooter(x,y));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "FlowerTower":{
        rad: TowerBase.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,1.5*TowerBase.RAD,10,"white",()=>{
                playField.addEnemy(new FlowerTower(x,y));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "HeavyTower":{
        rad: TowerBase.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,1.5*TowerBase.RAD,10,"white",()=>{
                playField.addEnemy(new HeavyTower(x,y));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
    "LaserTower":{
        rad: TowerBase.RAD,
        spawn: (x,y) => {
            const spawner = new BasicSpawnerParticle(x,y,1.5*TowerBase.RAD,10,"white",()=>{
                playField.addEnemy(new LaserTower(x,y));
            });
            playField.addParticle(spawner);
            return spawner.getEnemyRef();
        }
    },
};

const MAX_SPAWN_ATTEMPTS = 100;
export function getRandomPosWithMargins(wallMargin, playerMargin){
    let x = 0;
    let y = 0;
    for(let i=0; i<MAX_SPAWN_ATTEMPTS; i++){
        x = wallMargin + (playField.x-2*wallMargin)*Math.random();
        y = wallMargin + (playField.y-2*wallMargin)*Math.random();
        if((x-playField.player.x)*(x-playField.player.x) + (y-playField.player.y)*(y-playField.player.y) >= playerMargin*playerMargin){
            return {x:x,y:y};
        }
    }
    return {x:x,y:y};
}