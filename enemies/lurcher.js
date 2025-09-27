import { CircleArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import Color from "../color.js";
import { ctx } from "../drawing.js";
import { bounceBoundify, randomAngle } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractBasicCircle from "./abstractBasicCircle.js";
import AbstractEnemy from "./abstractEnemy.js";

const INNER_RAD = 7;
const MIN_RAD = 20;
const MAX_RAD = 35;
const CHARGE_TIME = 30;
const LURCH_TIME = 40;
const BASE_REST_TIME = 20;
const REST_TIME_VAR = 20;
const BASE_LURCH_DIST = 170;
const LURCH_DIST_VAR = 50;
const AIM_COEFF = 0.5;

const LINE_THICK = 6;
const MAX_HP = 10;
const HIT_FLASH_TIME = 2;

const STATE_REST = 0;
const STATE_CHARGE = 1;
const STATE_LURCH = 2;

export default class Lurcher extends AbstractEnemy{
    static RAD = MAX_RAD;

    constructor(x,y){
        super();
        this.x = x;
        this.y = y;
        this.defenseProfile = createDefenseProfile(MAX_HP);
        this.curRad = MIN_RAD;
        this.area = new CircleArea(this.x, this.y, this.curRad);
        this.state = STATE_LURCH;
        this.stateCountdown = 0;
        this.prevX = this.x; this.prevY = this.y; this.targetX = this.x; this.targetY = this.y;
    }

    findTarget(){
        const playerDist = Math.sqrt((playField.player.x-this.x)*(playField.player.x-this.x) + (playField.player.y-this.y)*(playField.player.y-this.y));
        const randR = AIM_COEFF*playerDist*Math.random();
        const randAngle = randomAngle();
        const aimPointX = playField.player.x-this.x + randR*Math.cos(randAngle);
        const aimPointY = playField.player.y-this.y + randR*Math.sin(randAngle);
        const aimPointDist = Math.sqrt(aimPointX*aimPointX + aimPointY*aimPointY);
        const lurchDist = BASE_LURCH_DIST + LURCH_DIST_VAR * Math.random();
        this.targetX = this.x + lurchDist * aimPointX/aimPointDist;
        this.targetY = this.y + lurchDist * aimPointY/aimPointDist;
    }

    advanceTowardsTarget(portion){
        this.x = this.prevX + portion*(this.targetX-this.prevX);
        this.x = bounceBoundify(this.x, playField.x, MIN_RAD);
        this.y = this.prevY + portion*(this.targetY-this.prevY);
        this.y = bounceBoundify(this.y, playField.y, MIN_RAD);
    }

    timeStep(dt){
        super.timeStep(dt);
        this.hitFlash -= dt;
        if(this.hitFlash < 0) this.hitFlash = 0;

        this.stateCountdown -= dt;
        if(this.stateCountdown < 0){
            if(this.state == STATE_REST){
                this.state = STATE_CHARGE;
                this.stateCountdown += CHARGE_TIME;
            }else if(this.state == STATE_CHARGE){
                this.state = STATE_LURCH;
                this.stateCountdown += LURCH_TIME;
                this.prevX = this.x;
                this.prevY = this.y;
                this.findTarget();
            }else if(this.state == STATE_LURCH){
                this.state = STATE_REST;
                this.stateCountdown += BASE_REST_TIME + REST_TIME_VAR * Math.random();
                this.curRad = MIN_RAD;
                this.advanceTowardsTarget(1);
            }
        }

        if(this.state == STATE_REST){
            this.curRad = MIN_RAD;
        }else if(this.state == STATE_CHARGE){
            const t = this.stateCountdown/CHARGE_TIME;
            this.curRad = MIN_RAD + (MAX_RAD-MIN_RAD)*(1-t)*(1-t);
        }else if(this.state == STATE_LURCH){
            const t = this.stateCountdown/LURCH_TIME;
            this.curRad = MIN_RAD + (MAX_RAD-MIN_RAD)*t*t;
            this.advanceTowardsTarget(1-t*t);
        }

        this.area.update(this.x, this.y, this.curRad);
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        ctx.lineWidth = LINE_THICK;
        ctx.beginPath();
        ctx.arc(this.x,this.y,this.curRad,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(this.x,this.y,INNER_RAD,0,2*Math.PI);
        ctx.closePath();
        ctx.stroke();
    }

    getHit(){
        if(this.defenseProfile.expired){
            this.retired = true;
            playField.addParticle(new ExplodingRingParticle(this.x, this.y, 1.5*Lurcher.RAD, 2*Lurcher.RAD, 6, Color.WHITE));
            return;
        }
        this.hitFlash = HIT_FLASH_TIME;
    }
}