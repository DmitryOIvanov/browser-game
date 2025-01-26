import controls from "./controls.js";
import { ctx } from "./drawing.js";

export class CanvasTextButton {
    constructor(centerX, centerY, text, fontSizePx, color){
        this.centerX = centerX;
        this.centerY = centerY;
        this.text = text;
        this.fontSizePx = fontSizePx;
        this.color = color;

        this.fontStr = `${fontSizePx}px Arial`;
        ctx.font = this.fontStr;
        this.sizeX = ctx.measureText(text).width;

        this.hovering = false;
        this.pressed = false;
    }

    update(){
        this.hovering = false;
        this.pressed = false;
        if(controls.mouse.inBounds){
            const mouseXInside = Math.abs(controls.mouse.x - this.centerX) <= this.sizeX*0.5;
            const mouseYInside = Math.abs(controls.mouse.y - this.centerY) <= this.fontSizePx*0.5;
            this.hovering = mouseXInside && mouseYInside;
            this.pressed = this.hovering && controls.mouse.lPressed;
        }
    }

    isPressed(){ return this.pressed; }

    draw(){
        ctx.textAlign = "center";
        ctx.font = this.fontStr;
        ctx.fillStyle = this.color.getStr();
        ctx.fillText(this.text,this.centerX,this.centerY+this.fontSizePx*0.25);
        if(this.hovering){
            ctx.lineWidth=5;
            ctx.strokeRect(this.centerX-this.sizeX*0.5,this.centerY-this.fontSizePx*0.5,this.sizeX,this.fontSizePx);
        }
    }
}