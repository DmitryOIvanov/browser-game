import { createDefenseProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import { ctx } from "../drawing.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractBasicTriangle from "./abstractBasicTriangle.js";
import SmallTriangle from "./smallTriangle.js";

const LINE_THICK = 6;
const RAD = 2*SmallTriangle.RAD + LINE_THICK;

const HIT_RAD = RAD + 0.5*Math.sqrt(3)*LINE_THICK;
const MAX_HP = 10;
const EV_FRICTION = 0.2;
const HIT_FLASH_TIME = 2;

const BASIC_PARAMS = {
    hitRad: HIT_RAD,
    evFriction: EV_FRICTION,
    offsetMove: 0.02,
    offsetDampen: 0.0013,
    offsetCloseDampen: 0.1,
    inwardRadius: 0.8,
    baseTurnSpeed: 0.01,
    turnSpeedBoost: 0.03,
    speed: 2.5
};

export default class MultiTriangle extends AbstractBasicTriangle{
    static RAD = RAD;

    constructor(x,y,evx,evy,initAngle){
        super(x,y,evx,evy,initAngle,BASIC_PARAMS);
        this.defenseProfile = createDefenseProfile(MAX_HP);
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

        ctx.beginPath();
        ctx.moveTo(0.5*(this.area.p1x+this.area.p2x), 0.5*(this.area.p1y+this.area.p2y));
        ctx.lineTo(0.5*(this.area.p2x+this.area.p3x), 0.5*(this.area.p2y+this.area.p3y));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5*(this.area.p2x+this.area.p3x), 0.5*(this.area.p2y+this.area.p3y));
        ctx.lineTo(0.5*(this.area.p3x+this.area.p1x), 0.5*(this.area.p3y+this.area.p1y));
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0.5*(this.area.p3x+this.area.p1x), 0.5*(this.area.p3y+this.area.p1y));
        ctx.lineTo(0.5*(this.area.p1x+this.area.p2x), 0.5*(this.area.p1y+this.area.p2y));
        ctx.stroke();
    }

    getHit(){
        if(this.defenseProfile.expired){
            this.retired = true;
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, RAD, 2*RAD, 6, Color.WHITE));
            playField.addEnemy(new SmallTriangle(this.x,this.y,0,0,this.angle));
            for(let i=0; i<3; i++){
                let launchAngle = this.angle+2*Math.PI*i/3
                playField.addEnemy(new SmallTriangle(
                    this.x+SmallTriangle.RAD*Math.cos(launchAngle),
                    this.y+SmallTriangle.RAD*Math.sin(launchAngle),
                    (5+Math.random())*Math.cos(launchAngle),
                    (5+Math.random())*Math.sin(launchAngle),
                    this.angle
                ));
            }
            return;
        }
        this.hitFlash = HIT_FLASH_TIME;
    }
}