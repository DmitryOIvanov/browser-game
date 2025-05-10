import Color from "./color.js";
import { ctx } from "./drawing.js";

export default class BgMessage{
    constructor(text, fontSizePx, color, opacity, centerX, centerY, duration){
        this.text = text;
        this.fontSizePx = fontSizePx;
        this.color = color || Color.WHITE;
        this.opacity = opacity || 1;
        this.centerX = centerX;
        this.centerY = centerY;
        this.duration = duration || -1;
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
        ctx.globalAlpha = this.opacity;
        ctx.textAlign = "center";
        ctx.font = this.fontStr;
        ctx.fillStyle = this.color.getStr();
        ctx.fillText(this.text,this.centerX,this.centerY+this.fontSizePx*0.25);

        ctx.globalAlpha = 1;
    }
}

export class StaticBGMessage extends BgMessage{
    constructor(params){
        super(
            params.text,
            params.fontSizePx,
            params.color,
            params.opacity,
            params.centerX,
            params.centerY,
            -1
        );
    }
}