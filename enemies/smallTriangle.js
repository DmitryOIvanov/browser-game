import { ctx } from "../drawing.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractBasicTriangle from "./abstractBasicTriangle.js";

const RAD = 12;
const LINE_THICK = 6;

const HIT_RAD = RAD + 0.5*Math.sqrt(3)*LINE_THICK;
const MAX_HP = 5;
const EV_FRICTION = 0.2;
const HIT_FLASH_TIME = 2;

const BASIC_PARAMS = {
    maxHP: MAX_HP,
    hitRad: HIT_RAD,
    evFriction: EV_FRICTION,
    offsetMove: 0.02,
    offsetDampen: 0.0013,
    offsetCloseDampen: 0.1,
    inwardRadius: 0.8,
    baseTurnSpeed: 0.02,
    turnSpeedBoost: 0.05,
    speed: 3.5
};

export default class SmallTriangle extends AbstractBasicTriangle{
    static RAD = RAD;

    constructor(x,y,evx,evy,initAngle){
        super(x,y,evx,evy,initAngle,BASIC_PARAMS);
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        ctx.lineWidth = LINE_THICK;
        ctx.beginPath();
        ctx.moveTo(this.area.p1x, this.area.p1y);
        ctx.lineTo(this.area.p2x, this.area.p2y);
        ctx.lineTo(this.area.p3x, this.area.p3y);
        ctx.closePath();
        ctx.stroke();
    }

    getHit(proj){
        this.hp -= 1;
        this.hitFlash = HIT_FLASH_TIME;
        if(this.hp <= 0){
            this.retired = true;
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, 2*RAD, 3*RAD, 6, '#fff'));
            return;
        }
        // let dx = this.x - proj.x;
        // let dy = this.y - proj.y;
        // let distCoeff = KNOCK_STRENGTH/Math.sqrt(dx*dx + dy*dy);
        // this.extraVX += dx*distCoeff;
        // this.extraVY += dy*distCoeff;
    }
}