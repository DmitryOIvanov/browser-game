import { ctx } from "../drawing.js";
import { normalizedAtan2 } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractBasicCircle from "./abstractBasicCircle.js";
import SmallCircle from "./smallCircle.js";

const RAD = 2*SmallCircle.RAD;
const LINE_THICK = 6;
const MAX_HP = 10;
const HIT_RAD = RAD;
const EV_FRICTION = 0.2;
const ROT_SPEED = 0.1;
const HIT_FLASH_TIME = 2;

const BASIC_PARAMS = {
    hitRad: HIT_RAD,
    maxHP: MAX_HP,
    evFriction: EV_FRICTION,
    regularSpeed: 4
};

export default class MultiCircle extends AbstractBasicCircle{
    static RAD = RAD;

    constructor(x,y,evx,evy,initAngle){
        super(x,y,evx,evy,initAngle,BASIC_PARAMS);
        this.rot = 2*Math.PI*Math.random();
    }

    timeStep(amount){
        super.timeStep(amount);
        this.rot += amount*ROT_SPEED;
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        ctx.lineWidth = LINE_THICK;
        ctx.beginPath();
        ctx.arc(this.x,this.y,RAD,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(
            this.x-SmallCircle.RAD*Math.cos(this.rot),
            this.y-SmallCircle.RAD*Math.sin(this.rot),
            SmallCircle.RAD,this.rot+Math.PI,this.rot
        );
        ctx.arc(
            this.x+SmallCircle.RAD*Math.cos(this.rot),
            this.y+SmallCircle.RAD*Math.sin(this.rot),
            SmallCircle.RAD,this.rot+Math.PI,this.rot, true
        );
        ctx.stroke();
    }

    getHit(proj){
        this.hp -= 1;
        this.hitFlash = HIT_FLASH_TIME;
        if(this.hp <= 0){
            this.retired = true;
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, RAD, 2*RAD, 6, '#fff'));
            for(let i=-3; i<=3; i+=2){
                let newAngle = normalizedAtan2(this.vy, this.vx)+i*0.2+(Math.random()-0.5)*0.1;
                playField.addEnemy(new SmallCircle(
                    this.x+SmallCircle.RAD*Math.cos(newAngle),
                    this.y+SmallCircle.RAD*Math.sin(newAngle),
                    0,0,newAngle
                ));
            }
            return;
        }
    }
}