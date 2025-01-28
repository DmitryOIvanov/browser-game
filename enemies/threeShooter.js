import Color from "../color.js";
import { ctx } from "../drawing.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import BallEProj from "../projectiles/enemy/ballEProj.js";
import AbstractBasicShooter from "./abstractBasicShooter.js";

const RAD = 25;
const LINE_THICK = 6;
const PROJ_SPEED = 7;
const MAX_HP = 20;

const IRIS_PORTION = 0.62;
const IRIS_ROT_SPEED = 0.08;
const BULLET_SPREAD = 0.4;
const HIT_FLASH_TIME = 2;

const SUPERCLASS_PARAMS = {
    hitRad: RAD,
    moodTimeBase: 20,
    moodTimeVar: 50,
    turnSpeed: 0.04,
    moveSpeed: 2.5,
    outerOrbit: 350,
    innerOrbit: 250,
    fireTimeBase: 100,
    fireTimeVar: 50
};

export default class ThreeShooter extends AbstractBasicShooter{
    static RAD = RAD;

    constructor(x,y){
        super(x,y,SUPERCLASS_PARAMS);
        this.hitFlash = 0;
        this.hp = MAX_HP;
        this.irisRot = 2*Math.PI*Math.random();
        this.irisRotAmount = (Math.random<0.5?1:-1)*IRIS_ROT_SPEED;
    }

    timeStep(amount){
        super.timeStep(amount);
        this.irisRot += this.irisRotAmount*amount;
    }

    shoot(){
        const irisRad = IRIS_PORTION*RAD;
        const irisPosCoeff = (1-IRIS_PORTION)*RAD;
        const irisCenterX = this.x+irisPosCoeff*Math.cos(this.facingAngle);
        const irisCenterY = this.y+irisPosCoeff*Math.sin(this.facingAngle);
        for(let i=-1; i<=1; i++){
            const angle = this.facingAngle+BULLET_SPREAD*i
            playField.addEnemyProjectile(new BallEProj(
                irisCenterX, irisCenterY,
                PROJ_SPEED*Math.cos(angle),
                PROJ_SPEED*Math.sin(angle),
                6,6,this.dangerColor));
        }
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        ctx.lineWidth = LINE_THICK;
        ctx.beginPath();
        ctx.arc(this.x,this.y,RAD,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
        const irisRad = IRIS_PORTION*RAD;
        const irisPosCoeff = (1-IRIS_PORTION)*RAD;
        const irisCenterX = this.x+irisPosCoeff*Math.cos(this.facingAngle);
        const irisCenterY = this.y+irisPosCoeff*Math.sin(this.facingAngle);
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.dangerColor.getStr();
        ctx.beginPath();
        ctx.arc(irisCenterX,irisCenterY,irisRad,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.lineWidth = 5;
        for(let i=0; i<3; i++){
            ctx.beginPath();
            ctx.moveTo(irisCenterX,irisCenterY);
            const angle = this.irisRot+2*Math.PI*i/3;
            ctx.lineTo(
                irisCenterX+irisRad*Math.cos(angle),
                irisCenterY+irisRad*Math.sin(angle));
            ctx.stroke();
        }
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