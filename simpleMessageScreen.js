import { FlatColor, RainbowColor } from "./color.js";
import controls from "./controls.js";
import { canv, ctx, drawDot } from "./drawing.js";
import { CanvasTextButton } from "./gui.js";

export default class SimpleMessageScreen {
    constructor(message) {
        this.concluded = false;
        this.message = message;
        this.continueButton = new CanvasTextButton(canv.width / 2, 420, "Continue", 60, FlatColor.WHITE);
    }

    nextFrame() {
        if (this.concluded) return;

        if (controls.mouse.inBounds) {
            drawDot(controls.mouse.x, controls.mouse.y)
        }
        this.continueButton.update();
        this.continueButton.draw();
        if (this.continueButton.isPressed()) {
            this.concluded = true;
            return;
        }
        ctx.textAlign = "center";
        ctx.font = "80px arial";
        ctx.fillStyle = '#fff';
        ctx.fillText(this.message, canv.width / 2, 300);
    }
}
