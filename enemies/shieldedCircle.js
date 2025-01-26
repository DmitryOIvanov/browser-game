import { CircleArea, ShieldedCircleArea } from "../areas.js";
import { ctx } from "../drawing.js";
import { bounceBoundify, decToZero, normalizeAngle, normalizeAnglePMPI, posMod } from "../extraMath.js";
import ExplodingRingParticle from "../particles/explodingRingParticle.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

const OUT_RAD = 50;
const MID_RAD = 30;
const IN_RAD = 20;
const LINE_THICK = 6;
const CORE_MAX_HP = 20;
const SEGMENT_MAX_HP = 15;
const NUM_SEGMENTS = 6;
const MOVE_UPDATE_BASE_TIME = 10;
const MOVE_UPDATE_TIME_VAR = 40;
const ANGLE_CHANGE_SPEED = 0.05; // Rate at which whole enemy changes direction
const SPEED = 2.5; // Speed of enemy
const ROT_SPEED = 0.007; // Angular speed of segments orbiting core
const MAX_DECAY_TIME = 30;
const HIT_FLASH_TIME = 2;

export default class ShieldedCircle extends AbstractEnemy{
    static RAD = OUT_RAD;

    constructor(x,y){
        super();
        this.x = x; this.y = y;
        this.rot = 2*Math.PI*Math.random();
        this.rotDir = Math.random()>=0.5 ? 1:-1;
        this.hp = Array(NUM_SEGMENTS+1).fill(SEGMENT_MAX_HP);
        this.hp[NUM_SEGMENTS] = CORE_MAX_HP;
        this.hitFlash = Array(NUM_SEGMENTS+1).fill(0);
        this.decayTimers = Array(NUM_SEGMENTS).fill(0).map(()=>(Math.random()*MAX_DECAY_TIME));

        this.angleChangeDir = 1;
        this.moveAngle = 2*Math.PI*Math.random();
        this.angleUpdateTimer = 0;

        this.area = new ShieldedCircleArea(
            this.x,this.y,
            IN_RAD, MID_RAD, OUT_RAD,
            NUM_SEGMENTS,
            this.hp,
            this.rot
        );
        this.boundingArea = new CircleArea(this.x,this.y,OUT_RAD);

        this.boundingCoords = Array(4).fill(0);
        this.updateBoundingCoords();
    }

    updateBoundingCoords(){
        for(let i=0; i<4; i++){
            let closestIndex = posMod(
                Math.floor((0.25*i-0.5*this.rot/Math.PI)*NUM_SEGMENTS),
                NUM_SEGMENTS);
            if(this.hp[closestIndex]>0){
                this.boundingCoords[i] = OUT_RAD;
            }else{
                this.boundingCoords[i] = this.hp.reduce((acc,hp,j)=>{
                    if(j==NUM_SEGMENTS) return acc;
                    if(hp<=0 && this.hp[(j+1)%NUM_SEGMENTS]<=0) return acc;
                    const cos = Math.cos(2*Math.PI*(j+1)/NUM_SEGMENTS+this.rot-0.5*Math.PI*i)
                    return Math.max(acc, OUT_RAD*cos, MID_RAD*cos);
                }, this.hp[NUM_SEGMENTS]>0?IN_RAD:-OUT_RAD);
            }
        }
    }

    setHP(segID, amount){
        this.hitFlash[segID] = HIT_FLASH_TIME;
        this.hp[segID] = amount;
        if(this.hp[segID] <= 0){
            if(segID == NUM_SEGMENTS){
                playField.addParticle(new ExplodingRingParticle(this.x, this.y, 1.5*IN_RAD, 2.5*IN_RAD, 6, '#fff'));
            }else{
                let angle = 2*Math.PI*(segID+0.5)/NUM_SEGMENTS + this.rot;
                let dist = 0.5*(MID_RAD + OUT_RAD);
                playField.addParticle(new ExplodingRingParticle(this.x+dist*Math.cos(angle), this.y+dist*Math.sin(angle), 20, 35, 6, '#fff'));
            }
        }
    }

    timeStep(amount){
        if(this.retired) return;
        super.timeStep(amount);
        this.hitFlash = this.hitFlash.map((val)=>(decToZero(val,amount)));

        this.rot = normalizeAngle(this.rot + ROT_SPEED * amount * this.rotDir);
        if(this.hp[NUM_SEGMENTS] <= 0){
            for(let i=0; i<NUM_SEGMENTS; i++){
                this.decayTimers[i] = decToZero(this.decayTimers[i], amount);
                if(this.decayTimers[i] <= 0 && this.hp[i] > 0){
                    this.setHP(i, 0);
                }
            }
        }
        this.retired = !this.hp.reduce((cur,hp)=>(cur || hp>0),false);
        if(this.retired) return;

        this.angleUpdateTimer -= amount;
        if(this.angleUpdateTimer <= 0){
            let dx = playField.player.x - this.x;
            let dy = playField.player.y - this.y;
            this.angleChangeDir = normalizeAnglePMPI(Math.atan2(dy,dx) - this.moveAngle)>=0? 1 : -1;
            this.angleUpdateTimer = MOVE_UPDATE_BASE_TIME + Math.random()*MOVE_UPDATE_TIME_VAR;
        }
        this.moveAngle = normalizeAngle(this.moveAngle + amount*this.angleChangeDir*ANGLE_CHANGE_SPEED);
        this.x += amount*SPEED * Math.cos(this.moveAngle);
        if(this.x < this.boundingCoords[2]){
            this.x = bounceBoundify(this.x, playField.x, this.boundingCoords[2]);
            this.moveAngle = normalizeAngle(Math.PI-this.moveAngle);
            this.angleChangeDir *= -1;
        }else if(this.x > playField.x-this.boundingCoords[0]){
            this.x = bounceBoundify(this.x, playField.x, this.boundingCoords[0]);
            this.moveAngle = normalizeAngle(Math.PI-this.moveAngle);
            this.angleChangeDir *= -1;
        }
        this.y += amount*SPEED * Math.sin(this.moveAngle);
        if(this.y < this.boundingCoords[3]){
            this.y = bounceBoundify(this.y, playField.y, this.boundingCoords[3]);
            this.moveAngle = 2*Math.PI-this.moveAngle;
            this.angleChangeDir *= -1;
        }else if(this.y > playField.y-this.boundingCoords[1]){
            this.y = bounceBoundify(this.y, playField.y, this.boundingCoords[1]);
            this.moveAngle = 2*Math.PI-this.moveAngle;
            this.angleChangeDir *= -1;
        }

        this.area.update(
            this.x,this.y,
            IN_RAD, MID_RAD, OUT_RAD,
            NUM_SEGMENTS,
            this.hp,
            this.rot
        );
        this.boundingArea.update(this.x,this.y,OUT_RAD);
        this.updateBoundingCoords();
    }

    draw(){
        if(this.retired) return;
        ctx.lineWidth = LINE_THICK;
        ctx.strokeStyle = this.hitFlash[NUM_SEGMENTS]>0?'#fff':this.baseColor.getStr();
        if(this.hp[NUM_SEGMENTS] > 0){
            ctx.beginPath();
            ctx.arc(this.x,this.y,IN_RAD,0,2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
        for(let i=0; i<NUM_SEGMENTS; i++){
            ctx.strokeStyle = this.hitFlash[i]>0?'#fff':this.baseColor.getStr();
            let angle1 = this.rot + 2*Math.PI*i/NUM_SEGMENTS;
            let angle2 = this.rot + 2*Math.PI*(i+1)/NUM_SEGMENTS;
            if(this.hp[i] > 0){
                ctx.beginPath();
                ctx.arc(this.x,this.y,OUT_RAD,angle1,angle2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(this.x,this.y,MID_RAD,angle1,angle2);
                ctx.stroke();
            }
        }
        for(let i=0; i<NUM_SEGMENTS; i++){
            let angle2 = this.rot + 2*Math.PI*(i+1)/NUM_SEGMENTS;
            let nextI = (i+1)%NUM_SEGMENTS;
            ctx.strokeStyle = (this.hitFlash[i]>0 || this.hitFlash[nextI]>0)?'#fff':this.baseColor.getStr();
            let rad1 = MID_RAD-LINE_THICK*0.5;
            let rad2 = OUT_RAD+LINE_THICK*0.5;
            if(this.hp[i] > 0 || this.hp[nextI] > 0){
                ctx.beginPath();
                ctx.moveTo(this.x+rad1*Math.cos(angle2),this.y+rad1*Math.sin(angle2));
                ctx.lineTo(this.x+rad2*Math.cos(angle2),this.y+rad2*Math.sin(angle2));
                ctx.stroke();
            }
        }

        // --- Bounding box test ---
        // ctx.lineWidth = 1;
        // ctx.strokeStyle = '#fff';
        // ctx.beginPath();
        // ctx.rect(
        //     this.x-this.boundingCoords[2],
        //     this.y-this.boundingCoords[3],
        //     this.boundingCoords[2]+this.boundingCoords[0],
        //     this.boundingCoords[3]+this.boundingCoords[1]);
        // ctx.stroke();
    }

    getHit(proj, segID){
        if(this.retired) return;
        this.setHP(segID, decToZero(this.hp[segID],1));
    }
}