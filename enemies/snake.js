import { CircleArea, SnakeArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import controls from "../controls.js";
import { ctx } from "../drawing.js";
import { normalizeAngle, normalizeAnglePMPI } from "../extraMath.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

const SEG_RAD = 15;
const DEAD_SEG_RAD = 12;
const SEG_MAX_HP = 10;
const TURN_BASE_TIME = 12;
const TURN_TIME_VAR = 15;
const TURN_RAD = 45;
const TURN_SPEED = 0.07;
const DEFAULT_NUM_SEGS = 30;
const SEG_TIME_DIFF = 10;

const LINE_THICK = 6;
const HIT_FLASH_TIME = 2;

// Dummy class with all the business logic but manual initialization of values only
class CrudeSnake extends AbstractEnemy {
    constructor(
        numSegs, // num segments including ones yet to show up
        minSegIndex, // starting point in shared arrays
        moveQueue, // moves, not shared but copied
        sharedSegArr // Shared segment data: x, y, defenseProfile, hitFlash
    ){
        super();

        // All dummy values
        this.numSegs = numSegs;
        this.minSegIndex = minSegIndex;
        this.turnCountdown = 0;
        this.moveQueue = moveQueue;
        this.sharedSegArr = sharedSegArr;
        this.area = new SnakeArea(numSegs, minSegIndex, SEG_RAD, sharedSegArr);
        this.numSegsVisible = 0;
    }

    chooseNextMove(){
        const moveTime = TURN_BASE_TIME + TURN_TIME_VAR*Math.random();
        this.turnCountdown += moveTime;

        const lastMove = this.moveQueue.at(-1);
        const lastMoveEndArcAngle = lastMove.initArcAngle + lastMove.dir*TURN_SPEED*lastMove.time;
        const lastX = lastMove.centerX + TURN_RAD*Math.cos(lastMoveEndArcAngle);
        const lastY = lastMove.centerY + TURN_RAD*Math.sin(lastMoveEndArcAngle);
        const lastAngle = lastMoveEndArcAngle + lastMove.dir*0.5*Math.PI;

        const dx = playField.player.x - lastX;
        const dy = playField.player.y - lastY;
        const newDir = normalizeAnglePMPI(Math.atan2(dy,dx) - lastAngle)>=0 ? 1 : -1;
        const initArcAngle = normalizeAngle(lastAngle - newDir*Math.PI*0.5);
        const move = {
            dir: newDir,
            initArcAngle: initArcAngle,
            centerX: lastX - TURN_RAD*Math.cos(initArcAngle),
            centerY: lastY - TURN_RAD*Math.sin(initArcAngle),
            time: moveTime
        }
        this.moveQueue.push(move);
    }

    timeStep(dt){
        super.timeStep(dt);
        // for(let i=0; i<this.numSegs; i++){
        //     this.hitFlash[i] -= dt;
        //     if(this.hitFlash[i] < 0) this.hitFlash[i] = 0;
        // }

        this.turnCountdown -= dt;
        while(this.turnCountdown <= 0){
            this.chooseNextMove();
        }
        
        let moveIndex = this.moveQueue.length;
        let segIndex = this.minSegIndex;
        let timeOffset = -this.turnCountdown;
        while(true){
            if(timeOffset < 0){
                moveIndex--;
                if(moveIndex < 0) break;
                timeOffset += this.moveQueue[moveIndex].time;
            }else{
                const move = this.moveQueue[moveIndex];
                const angleChange = move.dir*TURN_SPEED*timeOffset;
                this.sharedSegArr[segIndex].x = move.centerX + TURN_RAD*Math.cos(move.initArcAngle + angleChange);
                this.sharedSegArr[segIndex].y = move.centerY + TURN_RAD*Math.sin(move.initArcAngle + angleChange);

                segIndex++;
                this.numSegsVisible = segIndex;
                if(segIndex >= this.minSegIndex+this.numSegs || segIndex >= this.sharedSegArr.length){
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
        for(let i=0; i<this.numSegsVisible; i++){
            const sharedIndex = this.minSegIndex+i;
            ctx.strokeStyle = (this.sharedSegArr[sharedIndex].hitFlash > 0) ? '#fff' : this.baseColor.getStr();
            ctx.beginPath();
            ctx.arc(this.sharedSegArr[sharedIndex].x,this.sharedSegArr[sharedIndex].y,SEG_RAD,0,2*Math.PI);
            ctx.closePath();
            ctx.stroke();
        }
    }

    getDefenseProfile(segID){
        return this.sharedSegArr[segID].defenseProfile;
    }

    getHit(segID){
        const segEntry = this.sharedSegArr[segID];
        segEntry.hitFlash = HIT_FLASH_TIME;
        if(segEntry.defenseProfile.expired){
            //
        }
    }
}

// Derived class with a nice constructor presented publicly
export default class Snake extends CrudeSnake{
    static RAD = SEG_RAD;

    constructor(x,y,angle){
        const InitializationMove = {
            centerX: x + TURN_RAD*Math.cos(angle + 0.5*Math.PI),
            centerY: y + TURN_RAD*Math.sin(angle + 0.5*Math.PI),
            dir: 1,
            initArcAngle: angle - 0.5*Math.PI,
            time: 0
        };

        const segArr = new Array(DEFAULT_NUM_SEGS).fill(null).map(()=>({
            x:0, y:0, //dummies
            hitFlash: 0,
            defenseProfile: createDefenseProfile(SEG_MAX_HP)
        }));

        super(
            DEFAULT_NUM_SEGS,
            0,
            [InitializationMove],
            segArr
        );
    }
}