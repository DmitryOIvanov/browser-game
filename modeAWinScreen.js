import Color from "./color.js";
import controls from "./controls.js";
import { canv, ctx, drawDot } from "./drawing.js";
import { CanvasTextButton } from "./gui.js";

export default class ModeAWinScreen {
    constructor(){
        this.concluded = false;
        this.continueButton = new CanvasTextButton(canv.width/2,420,"Continue",60,Color.WHITE);
    }

    nextFrame(){
        if(this.concluded) return;

        if(controls.mouse.inBounds){
            drawDot(controls.mouse.x,controls.mouse.y)
        }
        this.continueButton.update();
        this.continueButton.draw();
        if(this.continueButton.isPressed()){
            this.concluded = true;
            return;
        }
        ctx.textAlign = "center";
        ctx.font = "80px arial";
        ctx.fillStyle = '#fff';
        ctx.fillText("You Win!", canv.width/2,300);
    }
}