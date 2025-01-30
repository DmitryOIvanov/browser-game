import { createDefenseProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import { ctx } from "../drawing.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractBasicCircle from "./abstractBasicCircle.js";

const RAD = 15;
const LINE_THICK = 6;
const MAX_HP = 5;
const HIT_RAD = RAD;
const EV_FRICTION = 0.2;
const HIT_FLASH_TIME = 2;
const BASIC_PARAMS = {
    hitRad: HIT_RAD,
    evFriction: EV_FRICTION,
    regularSpeed: 6
};

export default class SmallCircle extends AbstractBasicCircle{
    static RAD = RAD;

    constructor(x,y,evx,evy,initAngle){
        super(x,y,evx,evy,initAngle,BASIC_PARAMS);
        this.defenseProfile = createDefenseProfile(MAX_HP);
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        ctx.lineWidth = LINE_THICK;
        ctx.beginPath();
        ctx.arc(this.x,this.y,RAD,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
    }

    getHit(proj){
        if(this.defenseProfile.expired){
            this.retired = true;
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, 2*RAD, 3*RAD, 6, Color.WHITE));
            return;
        }
        this.hitFlash = HIT_FLASH_TIME;
    }
}