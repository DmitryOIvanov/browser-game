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
    constructor(x,y, innerRad, innerDepth, outerRad, outerDepth, numSpokes, SpokeThickness, numTeeth, toothHeight, toothLowerWidth, toothUpperWidth, rotSpeed, initRot){
        this.x = x;
        this.y = y;
        this.r1 = innerRad-innerDepth;
        this.r2 = innerRad;
        this.r3 = outerRad-outerDepth;
        this.r4 = outerRad;
        this.numSpokes = numSpokes;
        this.sw = SpokeThickness*0.5;
        this.numTeeth = numTeeth;
        this.th = toothHeight;
        this.tlw = toothLowerWidth;
        this.tuw = toothUpperWidth;
        this.rotSpeed = rotSpeed;

        this.rot = initRot;
    }

    timeStep(amount){
        this.rot += this.rotSpeed * amount;
    }

    draw(){
        ctx.beginPath();
        // Outermost shape
        // ctx.arc(this.x,this.y,this.r4,0,2*Math.PI);
        const dl = Math.sqrt(this.r4*this.r4 - this.tlw*this.tlw);
        const du = Math.sqrt((this.r4+this.th)*(this.r4+this.th) - this.tuw*this.tuw);
        for(let i=0; i<this.numTeeth; i++){
            const angle = this.rot + 2*Math.PI*i/this.numTeeth;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            if(i==0){
                ctx.moveTo(this.x+rotateX(dl,-this.tlw,cos,sin),this.y+rotateY(dl,-this.tlw,cos,sin));
            }else{
                ctx.lineTo(this.x+rotateX(dl,-this.tlw,cos,sin),this.y+rotateY(dl,-this.tlw,cos,sin));
            }
            ctx.lineTo(this.x+rotateX(du,-this.tuw,cos,sin),this.y+rotateY(du,-this.tuw,cos,sin));
            ctx.lineTo(this.x+rotateX(du,this.tuw,cos,sin),this.y+rotateY(du,this.tuw,cos,sin));
            ctx.lineTo(this.x+rotateX(dl,this.tlw,cos,sin),this.y+rotateY(dl,this.tlw,cos,sin));
        }
        ctx.closePath();
        // Central Hole
        ctx.arc(this.x,this.y,this.r1,0,2*Math.PI, true);
        ctx.closePath();
        // Empty Space between spokes
        const d2 = Math.sqrt(this.r2*this.r2 - this.sw*this.sw);
        const d3 = Math.sqrt(this.r3*this.r3 - this.sw*this.sw);
        const dAngle2 = Math.asin(this.sw/this.r2);
        const dAngle3 = Math.asin(this.sw/this.r3);
        for(let i=0; i<this.numSpokes; i++){
            const angle1 = this.rot + 2*Math.PI*i/this.numSpokes;
            const angle2 = this.rot + 2*Math.PI*(i+1)/this.numSpokes;
            const cos1 = Math.cos(angle1);
            const sin1 = Math.sin(angle1);
            const cos2 = Math.cos(angle2);
            const sin2 = Math.sin(angle2);
            ctx.moveTo(this.x+rotateX(d2,this.sw,cos1,sin1),this.y+rotateY(d2,this.sw,cos1,sin1));
            ctx.arc(this.x,this.y,this.r2,angle1+dAngle2,angle2-dAngle2,false);
            ctx.lineTo(this.x+rotateX(d3,-this.sw,cos2,sin2),this.y+rotateY(d3,-this.sw,cos2,sin2));
            ctx.arc(this.x,this.y,this.r3,angle2-dAngle3,angle1+dAngle3,true);
            ctx.closePath();
        }
        ctx.fill();
    }
}

class TutorialGearBackground {
    constructor(){
        const SPEED_COEFF = 0.001;
        this.gears = [
            new Gear(
                80, // Center X
                640, // Center Y
                70, // Inner Ring Radius
                40, // Inner Ring Depth
                360, // Outer Ring Radius
                40, // Outer Depth Radius
                6, // # of Spokes
                35, // Spoke Thickness
                72, // # of teeth
                20, // Tooth Height
                10, // Tooth Inner Thickness
                3, // Tooth Outer Thickness
                5*SPEED_COEFF, // Speed (& Direction)
                0 // Initial Angle
            ),new Gear(
                80+204, // Center X
                640-430, // Center Y
                40, // Inner Ring Radius
                20, // Inner Ring Depth
                90, // Outer Ring Radius
                20, // Outer Depth Radius
                4, // # of Spokes
                20, // Spoke Thickness
                18, // # of teeth
                20, // Tooth Height
                10, // Tooth Inner Thickness
                3, // Tooth Outer Thickness
                -20*SPEED_COEFF, // Speed (& Direction)
                -0.025+0.175 // Initial Angle
            ),new Gear(
                80+57, // Center X
                640-687, // Center Y
                40, // Inner Ring Radius
                20, // Inner Ring Depth
                180, // Outer Ring Radius
                20, // Outer Depth Radius
                4, // # of Spokes
                20, // Spoke Thickness
                36, // # of teeth
                20, // Tooth Height
                10, // Tooth Inner Thickness
                3, // Tooth Outer Thickness
                10*SPEED_COEFF, // Speed (& Direction)
                -0.025+0.175 // Initial Angle
            ),new Gear(
                1280, // Center X
                0, // Center Y
                40, // Inner Ring Radius
                20, // Inner Ring Depth
                450, // Outer Ring Radius
                20, // Outer Depth Radius
                4, // # of Spokes
                20, // Spoke Thickness
                90, // # of teeth
                20, // Tooth Height
                10, // Tooth Inner Thickness
                3, // Tooth Outer Thickness
                4*SPEED_COEFF, // Speed (& Direction)
                -0.025+0.175 // Initial Angle
            ),new Gear(
                1280-450-90-26, // Center X
                0, // Center Y
                40, // Inner Ring Radius
                20, // Inner Ring Depth
                90, // Outer Ring Radius
                20, // Outer Depth Radius
                4, // # of Spokes
                20, // Spoke Thickness
                18, // # of teeth
                20, // Tooth Height
                10, // Tooth Inner Thickness
                3, // Tooth Outer Thickness
                -20*SPEED_COEFF, // Speed (& Direction)
                -0.025+0.175 // Initial Angle
            ),new Gear(
                1058, // Center X
                720-100, // Center Y
                40, // Inner Ring Radius
                20, // Inner Ring Depth
                180, // Outer Ring Radius
                20, // Outer Depth Radius
                4, // # of Spokes
                20, // Spoke Thickness
                36, // # of teeth
                20, // Tooth Height
                10, // Tooth Inner Thickness
                3, // Tooth Outer Thickness
                -10*SPEED_COEFF, // Speed (& Direction)
                -0.025+0.175 // Initial Angle
            ),
            // new Gear(300,300,30,15,100,20,6,10,24,16,8,3,0.01),
        ];
    }

    timeStep(amount){
        for(const gear of this.gears){
            gear.timeStep(amount);
        }
    }

    draw(){
        for(const gear of this.gears){
            gear.draw();
        }
    }
}

export class TutorialTask3 extends TutorialTask {
    constructor(params){
        super();
        this.gears = new TutorialGearBackground();
        this.satisfied = false;
    }

    timeStep(amount){
        super.timeStep(amount);
        this.gears.timeStep(amount);
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

        addToGlobalAlphaStack(0.2);
        this.gears.draw();
        popFromGlobalStack();
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