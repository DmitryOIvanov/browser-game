import { SnakeArea } from "../areas.js";
import { createDefenseProfile } from "../attackAndDefense.js";
import { ctx } from "../drawing.js";
import { normalizeAngle, normalizeAnglePMPI } from "../extraMath.js";
import playField from "../playField.js";
import AbstractEnemy from "./abstractEnemy.js";

const SEG_RAD = 15;
const SEG_MAX_HP = 10;
const TURN_BASE_TIME = 15;
const TURN_TIME_VAR = 12;
const TURN_RAD = 45;
const TURN_SPEED = 0.07;
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
        this.segArr = new Array(numSegs).fill(null).map((_,i)=>({
            defenseProfile: createDefenseProfile(SEG_MAX_HP)
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
        super.timeStep(dt);
        
        let head = null;
        let timeOffset = 0;
        let moveIndex = 0;
        for(let segIndex=0; segIndex<this.numSegs; segIndex++){
            const entry = this.segArr[segIndex];
            if(entry.defenseProfile.expired){
                head = null;
                if(head){
                    for(let i=0; i<moveIndex; i++) head.moves.shift();
                }
                continue;
            }
            if(!head){
                head = entry;
                head.timeOffset += dt;
                while(head.timeOffset >= head.moves.at(-1).time){
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
        }
        if(head){
            for(let i=0; i<moveIndex; i++) head.moves.shift();
        }

        // let moveIndex = this.moveQueue.length;
        // let segIndex = this.minSegIndex;
        // let timeOffset = -this.turnCountdown;
        // while(true){
        //     if(timeOffset < 0){
        //         moveIndex--;
        //         if(moveIndex < 0) break;
        //         timeOffset += this.moveQueue[moveIndex].time;
        //     }else{
        //         const move = this.moveQueue[moveIndex];
        //         const angleChange = move.dir*TURN_SPEED*timeOffset;
        //         this.sharedSegArr[segIndex].x = move.centerX + TURN_RAD*Math.cos(move.initArcAngle + angleChange);
        //         this.sharedSegArr[segIndex].y = move.centerY + TURN_RAD*Math.sin(move.initArcAngle + angleChange);

        //         segIndex++;
        //         this.numSegsVisible = segIndex;
        //         if(segIndex >= this.minSegIndex+this.numSegs || segIndex >= this.sharedSegArr.length){
        //             for(let i=0; i<moveIndex; i++){
        //                 this.moveQueue.shift();
        //             }
        //             break;
        //         }
        //         timeOffset -= SEG_TIME_DIFF;
        //     }
        // }
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
        this.segArr[segID].hitFlash = HIT_FLASH_TIME;
        if(this.segArr[segID].defenseProfile.expired){
            //
        }
    }
}

// Derived class with a nice constructor presented publicly
// export default class Snake extends CrudeSnake{
//     static RAD = SEG_RAD;

//     constructor(x,y,angle){
//         const InitializationMove = {
//             centerX: x + TURN_RAD*Math.cos(angle + 0.5*Math.PI),
//             centerY: y + TURN_RAD*Math.sin(angle + 0.5*Math.PI),
//             dir: 1,
//             initArcAngle: angle - 0.5*Math.PI,
//             time: 0
//         };

//         const segArr = new Array(DEFAULT_NUM_SEGS).fill(null).map(()=>({
//             x:0, y:0, //dummies
//             hitFlash: 0,
//             defenseProfile: createDefenseProfile(SEG_MAX_HP)
//         }));

//         super(
//             DEFAULT_NUM_SEGS,
//             0,
//             [InitializationMove],
//             segArr
//         );
//     }
// }