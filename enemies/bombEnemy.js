import { CircleArea } from "../areas.js";
import { ctx } from "../drawing.js";
import { bounceBoundify, convergeToAngle, decToZero, isInBounds, normalizeAngle, normalizedAtan2 } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import BallEProj from "../projectiles/enemy/ballEProj.js";
import AbstractEnemy from "./abstractEnemy.js";

const RAD = 24;
const LINE_THICK = 6;
const MAX_HP = 10;
const HIT_FLASH_TIME = 2;

const SPEED = 4;
const TURN_SPEED = 0.01;
const ROT_SPEED = 0.05;
const NUM_BULLETS = 7;
const PROJ_SPEED = 7;

export default class BombEnemy extends AbstractEnemy{
    static RAD = RAD;

    constructor(x,y){
        super();
        this.x=x; this.y=y;
        this.hitFlash = 0;
        this.hp = MAX_HP;
        this.area = new CircleArea(this.x,this.y,RAD);
        this.moveAngle = 2*Math.PI*Math.random();
        this.rot = 2*Math.PI*Math.random();
        this.rotAmount = ROT_SPEED*(Math.random()>=0.5 ? 1:-1);
    }

    timeStep(amount){
        super.timeStep(amount);
        this.hitFlash = decToZero(this.hitFlash, amount);
        this.rot = normalizeAngle(this.rot+amount*this.rotAmount);

        let dx = playField.player.x - this.x;
        let dy = playField.player.y - this.y;
        let targetAngle = normalizedAtan2(dy, dx);
        this.moveAngle = convergeToAngle(this.moveAngle, targetAngle, TURN_SPEED*amount);

        this.x += amount*SPEED*Math.cos(this.moveAngle);
        this.y += amount*SPEED*Math.sin(this.moveAngle);
        if(!isInBounds(this.x, playField.x, RAD)){
            this.x = bounceBoundify(this.x, playField.x, RAD);
            this.moveAngle = normalizeAngle(Math.PI-this.moveAngle);
        }
        if(!isInBounds(this.y, playField.y, RAD)){
            this.y = bounceBoundify(this.y, playField.y, RAD);
            this.moveAngle = 2*Math.PI-this.moveAngle;
        }
        this.area.update(this.x,this.y,RAD);
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        ctx.lineWidth = LINE_THICK;
        ctx.beginPath();
        ctx.arc(this.x,this.y,RAD,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.dangerColor.getStr();
        ctx.lineWidth = 4;
        ctx.beginPath();
        let outerMag = RAD*0.6;
        let innerMag = RAD*0.3;
        for(let i=0; i<5; i++){
            let angle = 0.4*Math.PI*i + this.rot;
            if(i==0){
                ctx.moveTo(this.x+outerMag*Math.cos(angle),this.y+outerMag*Math.sin(angle));
            }else{
                ctx.lineTo(this.x+outerMag*Math.cos(angle),this.y+outerMag*Math.sin(angle));
            }
            ctx.lineTo(this.x+innerMag*Math.cos(angle+0.2*Math.PI),this.y+innerMag*Math.sin(angle+0.2*Math.PI));
        }
        ctx.closePath();
        ctx.stroke();
    }

    getHit(proj){
        this.hp -= 1;
        this.hitFlash = HIT_FLASH_TIME;
        if(this.hp <= 0){
            this.retired = true;
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, 2*RAD, 4*RAD, 6, '#fff'));
            for(let i=0; i<NUM_BULLETS; i++){
                const angle = this.rot + 2*Math.PI*i/NUM_BULLETS;
                playField.addEnemyProjectile(new BallEProj(
                    this.x,this.y,
                    PROJ_SPEED*Math.cos(angle),
                    PROJ_SPEED*Math.sin(angle),
                    6,6,this.dangerColor));
            }
            return;
        }
    }
}