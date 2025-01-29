import Color from "../color.js";
import { ctx } from "../drawing.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractBasicSquare from "./abstractBasicSquare.js";

const RAD = 12;
const LINE_THICK = 6;

const HIT_RAD = RAD + LINE_THICK/2;
const BASE_REST_TIME = 25;
const REST_TIME_VARIANCE = 20;
const BASE_MOVE_LEN = 200;
const MOVE_LEN_VARIANCE = 100;
const ACCEL_COEFF = 4;
const TARGET_TOLERANCE = HIT_RAD;
const MAX_HP = 5;
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
    evFriction: EV_FRICTION
};

export default class SmallSquare extends AbstractBasicSquare{
    static RAD = RAD;

    constructor(x,y,evx,evy,initDelay){
        super(x,y,evx,evy,initDelay,BASIC_PARAMS);
        this.defenseProfile = {hp: MAX_HP, expired: false};
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
    }

    getHit(){
        if(this.defenseProfile.expired){
            this.retired = true;
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, 2*RAD, 3*RAD, 6, Color.WHITE));
            return;
        }
        this.hitFlash = HIT_FLASH_TIME;
    }
}