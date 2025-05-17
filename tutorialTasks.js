import BgMessage from "./bgMessage.js";
import Color from "./color.js";
import controls from "./controls.js";
import { addToGlobalAlphaStack, canv, ctx, customStrokeRect, fillTextCenteredXY, popFromGlobalStack } from "./drawing.js";

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
        let alpha = 0.6 * this.startTime/MAX_START_TIME;
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
            customStrokeRect(x-RADIUS_X,y-RADIUS_Y,2*RADIUS_X,2*RADIUS_Y);
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

function rotateX(x,y,cos,sin){
    return x*cos - y*sin;
}

function rotateY(x,y,cos,sin){
    return x*sin + y*cos;
}

class Gear {
    constructor(x,y, innerRad, innerDepth, outerRad, outerDepth, numSpokes, SpokeThickness, rotSpeed){
        this.x = x;
        this.y = y;
        this.r1 = innerRad-innerDepth;
        this.r2 = innerRad;
        this.r3 = outerRad-outerDepth;
        this.r4 = outerRad;
        this.n = numSpokes;
        this.w = SpokeThickness*0.5;
        this.rotSpeed = rotSpeed;

        this.rot = 0.2435675;
    }

    timeStep(amount){
        this.rot += this.rotSpeed * amount;
    }

    draw(){
        ctx.beginPath();
        // Outermost shape
        ctx.arc(this.x,this.y,this.r4,0,2*Math.PI);
        ctx.closePath();
        // Central Hole
        ctx.arc(this.x,this.y,this.r1,0,2*Math.PI, true);
        ctx.closePath();
        // Empty Space between spokes
        for(let i=0; i<this.n; i++){
            const angle1 = this.rot + 2*Math.PI*i/this.n;
            const angle2 = this.rot + 2*Math.PI*(i+1)/this.n;
            const cos1 = Math.cos(angle1);
            const sin1 = Math.sin(angle1);
            const cos2 = Math.cos(angle2);
            const sin2 = Math.sin(angle2);
            const d2 = Math.sqrt(this.r2*this.r2 - this.w*this.w);
            const d3 = Math.sqrt(this.r3*this.r3 - this.w*this.w);
            const dAngle2 = Math.asin(this.w/this.r2);
            const dAngle3 = Math.asin(this.w/this.r3);
            ctx.moveTo(this.x+rotateX(d2,this.w,cos1,sin1),this.y+rotateY(d2,this.w,cos1,sin1));
            ctx.arc(this.x,this.y,this.r2,angle1+dAngle2,angle2-dAngle2,false);
            ctx.lineTo(this.x+rotateX(d3,-this.w,cos2,sin2),this.y+rotateY(d3,-this.w,cos2,sin2));
            ctx.arc(this.x,this.y,this.r3,angle2-dAngle3,angle1+dAngle3,true);
            ctx.closePath();
        }
        ctx.fill();
    }
}

const testGear = new Gear(300,300,30,15,100,20,6,10,1);

export class TutorialTask3 extends TutorialTask {
    constructor(params){
        super();
        this.satisfied = false;
    }

    getSatisfaction(){
        if(controls.held["Space"]){
            this.satisfied = true;
        }
        return this.satisfied;
    }

    drawRaw(){
        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#FFF";
        this.drawSpacebar();
        fillTextCenteredXY("Slow Time", 60, canv.width/2, canv.height/2 + 100);

        // ctx.beginPath();
        // ctx.moveTo(300,300);
        // ctx.lineTo(300,500);
        // ctx.lineTo(500,500);
        // ctx.lineTo(500,300);
        // ctx.closePath();
        // ctx.moveTo(350,350);
        // ctx.lineTo(450,350);
        // ctx.lineTo(450,450);
        // ctx.lineTo(350,450);
        // ctx.closePath();
        // ctx.fill();

        testGear.draw();
    }

    drawSpacebar(){
        const CENTER_X = canv.width/2;
        const CENTER_Y = canv.height/2 - 100;
        const WIDTH = 350;
        const HEIGHT = 70;
        ctx.lineWidth = 8;

        customStrokeRect(CENTER_X-0.5*WIDTH,CENTER_Y-0.5*HEIGHT,WIDTH,HEIGHT);
        fillTextCenteredXY("SPACE", 52, CENTER_X, CENTER_Y+6);
    }
}