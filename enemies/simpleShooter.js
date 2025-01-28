import Color from "../color.js";
import { ctx } from "../drawing.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import BallEProj from "../projectiles/enemy/ballEProj.js";
import AbstractBasicShooter from "./abstractBasicShooter.js";

const RAD = 20;
const LINE_THICK = 6;
const PROJ_SPEED = 7;
const MAX_HP = 10;
const HIT_FLASH_TIME = 2;

const SUPERCLASS_PARAMS = {
    hitRad: RAD,
    moodTimeBase: 20,
    moodTimeVar: 40,
    turnSpeed: 0.05,
    moveSpeed: 3,
    outerOrbit: 300,
    innerOrbit: 200,
    fireTimeBase: 80,
    fireTimeVar: 40
};

export default class SimpleShooter extends AbstractBasicShooter{
    static RAD = RAD;

    constructor(x,y){
        super(x,y,SUPERCLASS_PARAMS);
        this.hitFlash = 0;
        this.hp = MAX_HP;
    }

    shoot(){
        playField.addEnemyProjectile(new BallEProj(
            this.x+0.5*RAD*Math.cos(this.facingAngle),
            this.y+0.5*RAD*Math.sin(this.facingAngle),
            PROJ_SPEED*Math.cos(this.facingAngle),
            PROJ_SPEED*Math.sin(this.facingAngle),
            6,6,this.dangerColor));
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        // if(this.mood == MOOD_CHASE) ctx.strokeStyle = '#f88';
        // if(this.mood == MOOD_ORBIT) ctx.strokeStyle = '#8f8';
        // if(this.mood == MOOD_FLEE) ctx.strokeStyle = '#88f';
        ctx.lineWidth = LINE_THICK;
        ctx.beginPath();
        ctx.arc(this.x,this.y,RAD,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.dangerColor.getStr();
        ctx.beginPath();
        ctx.arc(
            this.x+0.5*RAD*Math.cos(this.facingAngle),
            this.y+0.5*RAD*Math.sin(this.facingAngle),
            0.5*RAD,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
    }

    getHit(proj){
        this.hp -= 1;
        this.hitFlash = HIT_FLASH_TIME;
        if(this.hp <= 0){
            this.retired = true;
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, 1.5*RAD, 2*RAD, 6, Color.WHITE));
            return;
        }
    }
}