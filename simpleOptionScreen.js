import { FlatColor, RainbowColor } from "./color.js";
import controls from "./controls.js";
import { canv, ctx, drawDot } from "./drawing.js";
import { MinimalTextButton } from "./gui/minimalTextButton.js";

export default class SimpleOptionScreen {
    constructor(message, options) {
        this.concluded = false;
        this.message = message;
        this.buttons = new Array(options.length);
        for (let i = 0; i < options.length; i++) {
            this.buttons[i] = new MinimalTextButton(canv.width / 2, 320 + 100 * i, options[i], 60, FlatColor.WHITE);
        }
        this.result = 0;
    }

    nextFrame() {
        if (this.concluded) return;

        for (let i = 0; i < this.buttons.length; i++) {
            this.buttons[i].update();
            this.buttons[i].draw();
            if (this.buttons[i].isPressed()) {
                this.result = i;
                this.concluded = true;
                return;
            }
        }

        if (controls.mouse.inBounds) {
            drawDot(controls.mouse.x, controls.mouse.y)
        }
        ctx.textAlign = "center";
        ctx.font = "80px arial";
        ctx.fillStyle = '#fff';
        ctx.fillText(this.message, canv.width / 2, 200);
    }
}
