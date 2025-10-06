import { CircleArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import { ctx } from "../drawing.js";
import { normalizeAnglePMPI } from "../extraMath.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

const SEG_RAD = 15;
const SEG_MAX_HP = 10;
const TURN_BASE_TIME = 30;
const TURN_TIME_VAR = 10;
const TURN_RAD = 50;
const TURN_SPEED = 0.05;
const NUM_SEGS = 10;
const SEG_TIME_DIFF = 10;

const LINE_THICK = 6;
const HIT_FLASH_TIME = 2;

export default class Snake extends AbstractEnemy{
    static RAD = SEG_RAD;

    constructor(x,y,angle){
        super();
        this.defenseProfile = createDefenseProfile(SEG_MAX_HP);
        this.area = new CircleArea(this.x, this.y, SEG_RAD);

        this.lastX = x;
        this.lastY = y;
        this.lastAngle = angle;
        this.turnCountdown = 0;
        this.moveQueue = [];

        this.numSegsVisible = 0;
        this.segX = new Array(NUM_SEGS);
        this.segY = new Array(NUM_SEGS);
    }

    chooseNextMove(){
        const moveTime = TURN_BASE_TIME + TURN_TIME_VAR*Math.random();
        this.turnCountdown += moveTime;

        const dx = playField.player.x - this.lastX;
        const dy = playField.player.y - this.lastY;
        const newDir = normalizeAnglePMPI(Math.atan2(dy,dx) - this.lastAngle)>=0 ? 1 : -1;
        const initArcAngle = this.lastAngle - newDir*Math.PI/2;
        const move = {
            dir: newDir,
            initArcAngle: initArcAngle,
            centerX: this.lastX + TURN_RAD*Math.cos(initArcAngle),
            centerY: this.lastY - TURN_RAD*Math.sin(initArcAngle),
            time: moveTime
        }
        this.moveQueue.push(move);
        const angleChange = move.dir*TURN_SPEED*move.time
        this.lastX = move.centerX + TURN_RAD*Math.cos(initArcAngle + angleChange);
        this.lastY = move.centerY + TURN_RAD*Math.sin(initArcAngle + angleChange);
        this.lastAngle += angleChange;
    }

    timeStep(dt){
        super.timeStep(dt);
        this.hitFlash -= dt;
        if(this.hitFlash < 0) this.hitFlash = 0;

        this.turnCountdown -= dt;
        while(this.turnCountdown <= 0){
            this.chooseNextMove();
        }
        
        let moveIndex = this.moveQueue.length;
        let segIndex = 0;
        let timeOffset = -this.turnCountdown;
        while(true){
            if(timeOffset < 0){
                moveIndex--;
                if(moveIndex < 0) break;
                timeOffset += this.moveQueue[moveIndex].time;
            }else{
                const move = this.moveQueue[moveIndex];
                const angleChange = move.dir*TURN_SPEED*timeOffset;
                this.segX[segIndex] = move.centerX + TURN_RAD*Math.cos(move.initArcAngle + angleChange);
                this.segY[segIndex] = move.centerY + TURN_RAD*Math.sin(move.initArcAngle + angleChange);

                segIndex++;
                this.numSegsVisible = segIndex;
                if(segIndex >= NUM_SEGS) break;
                timeOffset -= SEG_TIME_DIFF;
            }
        }
    }

    draw(){
        ctx.strokeStyle = (this.hitFlash>0)?'#fff':this.baseColor.getStr();
        ctx.lineWidth = LINE_THICK;
        for(let seg=0; seg<this.numSegsVisible; seg++){
            ctx.beginPath();
            ctx.arc(this.segX[seg],this.segY[seg],SEG_RAD,0,2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }

    getHit(){
        if(this.defenseProfile.expired){
            this.retired = true;
            // playField.addParticle(new ExplodingRingParticle(this.x, this.y, 1.5*Snake.RAD, 2*Snake.RAD, 6, Color.WHITE));
            return;
        }
        this.hitFlash = HIT_FLASH_TIME;
    }
}