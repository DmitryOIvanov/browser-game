import BgMessage from "./bgMessage.js";
import Color from "./color.js";
import controls from "./controls.js";
import { addToGlobalAlphaStack, canv, ctx, fillTextCenteredXY, popFromGlobalStack } from "./drawing.js";

const MAX_START_TIME = 20;
const MAX_END_TIME = 40;

class TutorialTask {
    constructor(){
        this.satisfied = false;
        this.startTime = 0;
        this.endTime = MAX_END_TIME;
        this.retired = false;
    }

    timeStep(amount){
        if(this.retired) return;
        if(this.startTime < MAX_START_TIME){
            this.startTime += amount;
            if(this.startTime > MAX_START_TIME){
                this.startTime = MAX_START_TIME;
            }
        }else if(this.satisfied){
            this.endTime -= amount;
            if(this.endTime <= 0) this.retired = true;
        }else if(this.getSatisfaction()){
            this.satisfied = true;
        }
    }

    draw(){
        let alpha = 0.5 * this.startTime/MAX_START_TIME;
        if(this.satisfied) alpha = this.endTime/MAX_END_TIME;
        addToGlobalAlphaStack(alpha);
        this.drawRaw();  
        popFromGlobalStack();
    }

    getSatisfaction(){
        throw new Error("Tutorial Satisfaction not implemented");
    }

    drawRaw(){
        throw new Error("Tutorial (raw) drawing function not implemented");
    }
}

const KEY_OFFSETS_X = [0,-1,0,1];
const KEY_OFFSETS_Y = [-1,0,0,0];

export class TutorialTask1 extends TutorialTask {
    constructor(params){
        super();
        this.satisfied = false;
    }

    getSatisfaction(){
        if(controls.held["KeyW"] || controls.held["KeyA"] || controls.held["KeyS"] || controls.held["KeyD"]){
            this.satisfied = true;
        }
        return this.satisfied;
    }

    drawRaw(){
        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#FFF";
        this.drawWASD();
        fillTextCenteredXY("Move", 60, canv.width/2, canv.height/2 + 100);
    }

    drawWASD(){
        const CENTER_X = canv.width/2;
        const CENTER_Y = canv.height/2 - 100;
        const OFFSET_SIZE_X = 85;
        const OFFSET_SIZE_Y = 85;
        const RADIUS_X = 35;
        const RADIUS_Y = 35;
        ctx.lineWidth = 8;

        for(let i=0; i<4; i++){
            const x = CENTER_X + OFFSET_SIZE_X*KEY_OFFSETS_X[i];
            const y = CENTER_Y + OFFSET_SIZE_Y*KEY_OFFSETS_Y[i];
            ctx.strokeRect(x-RADIUS_X,y-RADIUS_Y,2*RADIUS_X,2*RADIUS_Y);
            fillTextCenteredXY("WASD".charAt(i), 52, x, y+6);
        }
    }
}

export class TutorialTask2 extends TutorialTask {
    constructor(params){
        super();
        this.satisfied = false;
    }

    getSatisfaction(){
        if(controls.mouse.leftHeld){
            this.satisfied = true;
        }
        return this.satisfied;
    }

    drawRaw(){
        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#FFF";
        this.drawMouse();
        fillTextCenteredXY("Aim & Shoot", 60, canv.width/2, canv.height/2 + 100);
    }

    drawMouse(){
        const CENTER_X = canv.width/2;
        const CENTER_Y = canv.height/2 - 130;
        const RADIUS = 40;
        const BAR_HEIGHT = 40;
        const BUTTON_OFFSET = 10;

        ctx.lineWidth = 8;

        ctx.beginPath();
        ctx.moveTo(CENTER_X-RADIUS, CENTER_Y+0.5*BAR_HEIGHT);
        ctx.lineTo(CENTER_X-RADIUS, CENTER_Y-0.5*BAR_HEIGHT);
        ctx.arc(CENTER_X, CENTER_Y-0.5*BAR_HEIGHT, RADIUS, Math.PI, 0);
        ctx.lineTo(CENTER_X+RADIUS, CENTER_Y+0.5*BAR_HEIGHT);
        ctx.arc(CENTER_X, CENTER_Y+0.5*BAR_HEIGHT, RADIUS, 0, Math.PI);
        ctx.moveTo(CENTER_X-RADIUS, CENTER_Y-BUTTON_OFFSET);
        ctx.lineTo(CENTER_X+RADIUS, CENTER_Y-BUTTON_OFFSET);
        ctx.moveTo(CENTER_X, CENTER_Y-BUTTON_OFFSET);
        ctx.lineTo(CENTER_X, CENTER_Y-0.5*BAR_HEIGHT-RADIUS);
        ctx.stroke();

        addToGlobalAlphaStack(0.5);
        ctx.beginPath();
        ctx.arc(CENTER_X, CENTER_Y-0.5*BAR_HEIGHT, RADIUS, Math.PI, 1.5*Math.PI);
        ctx.lineTo(CENTER_X, CENTER_Y-0.5*BAR_HEIGHT-RADIUS);
        ctx.lineTo(CENTER_X, CENTER_Y-BUTTON_OFFSET);
        ctx.lineTo(CENTER_X-RADIUS, CENTER_Y-BUTTON_OFFSET);
        ctx.closePath();
        ctx.fill();
        popFromGlobalStack();
    }
}