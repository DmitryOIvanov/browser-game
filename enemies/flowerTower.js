import { ctx } from "../drawing.js";
import { normalizeAngle } from "../extraMath.js";
import playField from "../playField.js";
import BallEProj from "../projectiles/enemy/ballEProj.js";
import TowerBase from "./towerBase.js";

const MAX_HP = 75;
const HEAD_RAD = 40;
const IRIS_RAD = 8;
const NUM_SHOTS = 3;
const FIRE_RATE = 25;
const ROT_SPEED = 0.014;
//3.88322207745 / NUM_SHOTS / FIRE_RATE;
const PROJ_SPEED = 7;

export default class FlowerTower extends TowerBase{
    constructor(x,y){
        super(x,y,MAX_HP);
        this.shootTimer = (0.5+Math.random())*FIRE_RATE;
        this.rot = 2*Math.PI*Math.random();
    }

    timeStep(amount){
        super.timeStep(amount);
        this.rot = normalizeAngle(this.rot+ROT_SPEED*amount);
        this.shootTimer -= amount;
        if(this.shootTimer <= 0){
            for(let i=0; i<NUM_SHOTS; i++){
                const rad = HEAD_RAD - IRIS_RAD;
                const angle = this.rot + 2*Math.PI*i/NUM_SHOTS;
                const newProj = new BallEProj(
                    this.x+rad*Math.cos(angle),
                    this.y+rad*Math.sin(angle),
                    PROJ_SPEED*Math.cos(angle),
                    PROJ_SPEED*Math.sin(angle),
                    6,6,this.dangerColor);
                newProj.timeStep(-this.shootTimer);
                playField.addEnemyProjectile(newProj);
                
            }
            this.shootTimer += FIRE_RATE;
        }
    }

    draw(){
        super.draw();
        ctx.beginPath();
        ctx.arc(this.x,this.y,HEAD_RAD,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(this.x,this.y,15,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.dangerColor.getStr();
        for(let i=0; i<NUM_SHOTS; i++){
            const rad = HEAD_RAD - IRIS_RAD;
            const angle = this.rot + 2*Math.PI*i/NUM_SHOTS;
            ctx.beginPath();
            ctx.arc(
                this.x+rad*Math.cos(angle),
                this.y+rad*Math.sin(angle),
                IRIS_RAD,0,2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }
}