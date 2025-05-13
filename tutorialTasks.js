import BgMessage from "./bgMessage.js";
import Color from "./color.js";
import { addToGlobalAlphaStack, canv, ctx, popFromGlobalStack } from "./drawing.js";

const MAX_END_TIME = 60;

class TutorialTask {
    constructor(){
        this.satisfied = false;
        this.endTime = MAX_END_TIME;
        this.concluded = false;
    }

    timeStep(amount){
        if(this.concluded) return;
        if(this.satisfied){
            this.endTime -= amount;
            if(this.endTime <= 0) this.concluded = true;
        }else if(this.getSatisfaction()){
            this.satisfied = true;
        }
    }

    draw(){

    }

    getSatisfaction(){
        throw new Error("Tutorial Satisfaction not implemented");
    }

    drawRaw(){
        throw new Error("Tutorial (raw) drawing function not implemented");
    }
}

export class TutorialScreen1 {
    constructor(params){}

    timeStep(amount){}

    draw(){}
}

const CENTER_X = canv.width/2;
const CENTER_Y = canv.height/2;
const OFFSET_SIZE_X = 85;
const OFFSET_SIZE_Y = 85;
const RADIUS_X = 35;
const RADIUS_Y = 35;
const LINE_WIDTH = 8;

const KEY_CENTERS_X = [CENTER_X,CENTER_X-OFFSET_SIZE_X,CENTER_X,CENTER_X+OFFSET_SIZE_X];
const KEY_CENTERS_Y = [CENTER_Y-OFFSET_SIZE_Y,CENTER_Y,CENTER_Y,CENTER_Y];

const LETTER_MESSAGES = [0,1,2,3].map((i)=>(
    new BgMessage(
        "WASD".charAt(i),
        50,
        Color.WHITE,
        1,
        KEY_CENTERS_X[i],
        KEY_CENTERS_Y[i]+5,
        -1
    )
));

export class WasdSymbol {
    constructor(params){}

    timeStep(amount){}

    draw(){
        // ctx.textAlign = "center";
        // ctx.font = this.fontStr;
        // ctx.fillStyle = "#999";
        addToGlobalAlphaStack(0.5);
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = LINE_WIDTH;
        for(let i=0; i<4; i++){
            const x = KEY_CENTERS_X[i];
            const y = KEY_CENTERS_Y[i];
            ctx.strokeRect(x-RADIUS_X,y-RADIUS_Y,2*RADIUS_X,2*RADIUS_Y);

            LETTER_MESSAGES[i].draw();
        }
        popFromGlobalStack();
    }
}

export class TutorialClock {
    constructor(params){
        //
    }

    timeStep(amount){
        //
    }

    draw(){
        //
    }
}