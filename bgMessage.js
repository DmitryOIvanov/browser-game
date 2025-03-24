import Color from "./color.js";
import { ctx } from "./drawing.js";

export default class BgMessage{
    constructor(centerX, centerY, text, fontSizePx, duration){
        this.text = text;
        this.centerX = centerX;
        this.centerY = centerY;
        this.fontSizePx = fontSizePx;
        this.duration = duration;
        this.fontStr = `${fontSizePx}px Arial`;

        this.retired = false;
        this.timeElapsed = 0;
    }

    timeStep(amount){
        this.timeElapsed += amount;
        if(this.timeElapsed >= this.duration) this.retired = true;
    }

    draw(){
        ctx.textAlign = "center";
        ctx.font = this.fontStr;
        ctx.fillStyle = "#999";
        ctx.fillText(this.text,this.centerX,this.centerY+this.fontSizePx*0.25);
    }
}