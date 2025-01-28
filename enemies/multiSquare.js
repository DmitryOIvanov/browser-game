import Color from "../color.js";
import { ctx } from "../drawing.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractBasicSquare from "./abstractBasicSquare.js";
import SmallSquare from "./smallSquare.js";

const RAD = 2*SmallSquare.RAD;
const LINE_THICK = 6;

const HIT_RAD = RAD + LINE_THICK/2;
const BASE_REST_TIME = 30;
const REST_TIME_VARIANCE = 40;
const BASE_MOVE_LEN = 160;
const MOVE_LEN_VARIANCE = 80;
const ACCEL_COEFF = 6;
const TARGET_TOLERANCE = HIT_RAD;
const MAX_HP = 10;
const EV_FRICTION = 0.2;
const HIT_FLASH_TIME = 2;

const BASIC_PARAMS = {
    hitRad: HIT_RAD,
    baseRestTime: BASE_REST_TIME,
    restTimeVariance: REST_TIME_VARIANCE,
    baseMoveLen: BASE_MOVE_LEN,
    moveLenVariance: MOVE_LEN_VARIANCE,
    accelCoeff: ACCEL_COEFF,
    targetTolerance: TARGET_TOLERANCE,
    maxHP: MAX_HP,
    evFriction: EV_FRICTION
};

export default class MultiSquare extends AbstractBasicSquare{
    static RAD = RAD;

    constructor(x,y,evx,evy,initDelay){
        super(x,y,evx,evy,initDelay,BASIC_PARAMS);
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        ctx.lineWidth = LINE_THICK;
        ctx.beginPath();
        ctx.moveTo(this.x - RAD, this.y - RAD);
        ctx.lineTo(this.x + RAD, this.y - RAD);
        ctx.lineTo(this.x + RAD, this.y + RAD);
        ctx.lineTo(this.x - RAD, this.y + RAD);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - RAD);
        ctx.lineTo(this.x, this.y + RAD);
        ctx.moveTo(this.x - RAD, this.y);
        ctx.lineTo(this.x + RAD, this.y);
        ctx.stroke();
    }

    getHit(proj){
        this.hp -= 1;
        this.hitFlash = HIT_FLASH_TIME;
        if(this.hp <= 0){
            this.retired = true;
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, RAD, 2*RAD, 10, Color.WHITE));
            const xOff = [1,-1,-1,1];
            const yOff = [1,1,-1,-1];
            for(let i=0; i<4; i++){
                playField.addEnemy(new SmallSquare(
                    this.x+SmallSquare.RAD*xOff[i],
                    this.y+SmallSquare.RAD*yOff[i],
                    xOff[i] * (3+Math.random()),
                    yOff[i] * (3+Math.random()),
                    30+30*Math.random()));
            }
            return;
        }
        // let dx = this.x - proj.x;
        // let dy = this.y - proj.y;
        // let distCoeff = SmallSquare.KNOCK_STRENGTH/Math.sqrt(dx*dx + dy*dy);
        // this.extraVX += dx*distCoeff;
        // this.extraVY += dy*distCoeff;
    }
}