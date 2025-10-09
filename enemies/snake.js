import { SnakeArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import controls from "../controls.js";
import { ctx } from "../drawing.js";
import { normalizeAngle, normalizeAnglePMPI } from "../extraMath.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

const SEG_RAD = 15;
const SEG_MAX_HP = 10;
const TURN_BASE_TIME = 150;
const TURN_TIME_VAR = 120;
const TURN_RAD = 45;
const TURN_SPEED = 0.007;
const SEG_TIME_DIFF = 10;

const LINE_THICK = 6;
const HIT_FLASH_TIME = 2;

const movePositionCache = {};
function getPositionInMove(move, time){
    const arcAngle = move.initArcAngle + TURN_SPEED*move.dir*time;
    movePositionCache.x = move.centerX + TURN_RAD*Math.cos(arcAngle);
    movePositionCache.y = move.centerY + TURN_RAD*Math.sin(arcAngle);
    movePositionCache.tangentAngle = arcAngle + move.dir*0.5*Math.PI;
    return movePositionCache;
}

export default class Snake extends AbstractEnemy {
    static RAD = SEG_RAD;

    constructor(x, y, angle, numSegs){
        super();

        this.numSegs = numSegs;
        this.segArr = new Array(numSegs).fill(null).map(()=>({
            defenseProfile: createDefenseProfile(SEG_MAX_HP),
            hitFlash: 0
        }));
        this.segArr[0].moves = [
            {
                centerX: x + TURN_RAD*Math.cos(angle + 0.5*Math.PI),
                centerY: y + TURN_RAD*Math.sin(angle + 0.5*Math.PI),
                dir: 1,
                initArcAngle: angle - 0.5*Math.PI,
                time: 0
            }
        ];
        this.segArr[0].timeOffset = 0;
        this.area = new SnakeArea(numSegs, SEG_RAD);
        this.numSegsAlive = numSegs;
    }

    getNextMove(lastMove){
        const moveTime = TURN_BASE_TIME + TURN_TIME_VAR*Math.random();

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
        return move;
    }

    timeStep(dt){
        if(controls.pressed["KeyO"]){
            console.log(this.segArr);
        }

        super.timeStep(dt);
        
        let head = null;
        let timeOffset = 0;
        let moveIndex = 0;
        for(let segIndex=0; segIndex<this.numSegs; segIndex++){
            const entry = this.segArr[segIndex];
            if(entry.defenseProfile.expired){
                if(head){
                    for(let i=0; i<moveIndex; i++) head.moves.shift();
                }
                head = null;
                continue;
            }
            if(!head){
                head = entry;
                head.timeOffset += dt;
                while(head.timeOffset >= head.moves.at(-1).time){
                    head.timeOffset -= head.moves.at(-1).time;
                    head.moves.push(this.getNextMove(head.moves.at(-1)));
                }
                timeOffset = head.timeOffset;
                moveIndex = head.moves.length-1;
            }else{
                timeOffset -= SEG_TIME_DIFF;
            }
            while(timeOffset < 0){
                moveIndex--;
                if(moveIndex < 0) return; 
                timeOffset += head.moves[moveIndex].time;
            }
            this.area.arr[segIndex].exists = true;
            const pos = getPositionInMove(head.moves[moveIndex], timeOffset);
            this.area.arr[segIndex].x = pos.x;
            this.area.arr[segIndex].y = pos.y;

            entry.hitFlash -= dt;
            if(entry.hitFlash < 0) entry.hitFlash = 0;
        }
        if(head){
            for(let i=0; i<moveIndex; i++) head.moves.shift();
        }
    }

    draw(){
        ctx.lineWidth = LINE_THICK;
        for(let i=0; i<this.numSegs; i++){
            if(this.area.arr[i].exists){
                ctx.strokeStyle = (this.segArr[i].hitFlash > 0) ? '#fff' : this.baseColor.getStr();
                ctx.beginPath();
                ctx.arc(this.area.arr[i].x,this.area.arr[i].y,SEG_RAD,0,2*Math.PI);
                ctx.closePath();
                ctx.stroke();
            }
        }
    }

    getDefenseProfile(segID){
        return this.segArr[segID].defenseProfile;
    }

    getHit(segID){
        if(this.retired) return;
        this.segArr[segID].hitFlash = HIT_FLASH_TIME;
        if(this.segArr[segID].defenseProfile.expired){
            this.numSegsAlive--;
            if(this.numSegsAlive <= 0){
                this.retired = true;
                return;
            }
            this.area.arr[segID].exists = false;
            if(segID+1 < this.numSegs && !this.segArr[segID+1].defenseProfile.expired){
                const entry = this.segArr[segID+1];
                let headIndex = segID;
                while(headIndex-1 >= 0 && !this.segArr[headIndex-1].defenseProfile.expired) headIndex--;
                const head = this.segArr[headIndex];
                let lastMoveIndex = head.moves.length-1;
                let timeOffset = head.timeOffset - (segID+1 - headIndex)*SEG_TIME_DIFF;
                while(timeOffset < 0 && lastMoveIndex > 0){
                    timeOffset += head.moves[lastMoveIndex].time;
                    lastMoveIndex--;
                }
                entry.moves = head.moves.slice(0,lastMoveIndex+1);
                entry.moves[entry.moves.length-1] = structuredClone(entry.moves.at(-1));
                entry.moves[entry.moves.length-1].time = timeOffset;
                entry.timeOffset = timeOffset;
            }
        }
    }
}