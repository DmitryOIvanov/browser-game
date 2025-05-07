import { ctx } from "./drawing.js";

export default class BgMessage{
    constructor(params){
        this.text = params.text;
        this.centerX = params.centerX;
        this.centerY = params.centerY;
        this.fontSizePx = params.fontSizePx;
        this.duration = params.duration;
        this.fontStr = `${this.fontSizePx}px Arial`;
        this.isStatic = this.duration && this.duration < 0;

        this.retired = false;
        this.timeElapsed = 0;
    }

    timeStep(amount){
        if(!this.isStatic){
            this.timeElapsed += amount;
            if(this.timeElapsed >= this.duration) this.retired = true;
        }
    }

    draw(){
        ctx.textAlign = "center";
        ctx.font = this.fontStr;
        ctx.fillStyle = "#777";
        ctx.fillText(this.text,this.centerX,this.centerY+this.fontSizePx*0.25);
    }
}