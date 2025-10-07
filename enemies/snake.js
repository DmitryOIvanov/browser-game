import { CircleArea, SnakeArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import { ctx } from "../drawing.js";
import { normalizeAngle, normalizeAnglePMPI } from "../extraMath.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

const SEG_RAD = 18;
const DEAD_SEG_RAD = 12;
const SEG_MAX_HP = 10;
const TURN_BASE_TIME = 10;
const TURN_TIME_VAR = 20;
const TURN_RAD = 72;
const TURN_SPEED = 0.05;
const NUM_SEGS = 15;
const SEG_TIME_DIFF = 10;

const LINE_THICK = 6;
const HIT_FLASH_TIME = 2;

export default class Snake extends AbstractEnemy{
    static RAD = SEG_RAD;

    constructor(x,y,angle){
        super();

        this.lastX = x;
        this.lastY = y;
        this.lastAngle = angle;
        this.turnCountdown = 0;
        this.moveQueue = [];

        this.numSegsVisible = 0;
        this.area = new SnakeArea(NUM_SEGS, SEG_RAD);
        this.defenseProfiles = new Array(NUM_SEGS).fill(null).map(()=>createDefenseProfile(SEG_MAX_HP));
        this.hitFlash = new Array(NUM_SEGS).fill(0);
    }

    chooseNextMove(){
        const moveTime = TURN_BASE_TIME + TURN_TIME_VAR*Math.random();
        this.turnCountdown += moveTime;

        const dx = playField.player.x - this.lastX;
        const dy = playField.player.y - this.lastY;
        const newDir = normalizeAnglePMPI(Math.atan2(dy,dx) - this.lastAngle)>=0 ? 1 : -1;
        const initArcAngle = normalizeAngle(this.lastAngle - newDir*Math.PI/2);
        const move = {
            dir: newDir,
            initArcAngle: initArcAngle,
            centerX: this.lastX - TURN_RAD*Math.cos(initArcAngle),
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
        for(let i=0; i<NUM_SEGS; i++){
            this.hitFlash[i] -= dt;
            if(this.hitFlash[i] < 0) this.hitFlash[i] = 0;
        }

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
                this.area.segX[segIndex] = move.centerX + TURN_RAD*Math.cos(move.initArcAngle + angleChange);
                this.area.segY[segIndex] = move.centerY + TURN_RAD*Math.sin(move.initArcAngle + angleChange);

                segIndex++;
                if(this.numSegsVisible < segIndex){
                    this.area.segExistence[this.numSegsVisible] = true;
                    this.numSegsVisible++;
                }
                if(segIndex >= NUM_SEGS){
                    for(let i=0; i<moveIndex; i++){
                        this.moveQueue.shift();
                    }
                    break;
                }
                timeOffset -= SEG_TIME_DIFF;
            }
        }
    }

    draw(){
        ctx.lineWidth = LINE_THICK;
        for(let seg=0; seg<this.numSegsVisible; seg++){
            const rad = this.area.segExistence[seg] ? SEG_RAD : DEAD_SEG_RAD;
            if(!this.area.segExistence[seg]){
                ctx.strokeStyle = this.dangerColor.getStr();
            }else{
                ctx.strokeStyle = (this.hitFlash[seg]>0)?'#fff':this.baseColor.getStr();
            }
            ctx.beginPath();
            ctx.arc(this.area.segX[seg],this.area.segY[seg],rad,0,2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }

    getDefenseProfile(segID){
        return this.defenseProfiles[segID];
    }

    getHit(segID){
        this.hitFlash[segID] = HIT_FLASH_TIME;
        if(this.defenseProfiles[segID].expired){
            this.area.segExistence[segID] = false;
        }
    }
}