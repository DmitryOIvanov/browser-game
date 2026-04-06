import { FlatColor } from "./color.js";
import { addToGlobalAlphaStack, ctx, popFromGlobalStack } from "./drawing.js";

const STATE_FADE_IN = 0;
const STATE_IDLE = 1;
const STATE_FADE_OUT = 2;

export default class BgMessage {
    constructor(params) {
        this.text = params.text;
        this.fontSizePx = params.fontSizePx;
        this.color = params.color || FlatColor.WHITE;
        this.opacity = params.opacity || 1;
        this.centerX = params.centerX;
        this.centerY = params.centerY;

        this.doesWait = params.doesWait;
        this.fadeInTime = params.fadeInTime || 0;
        this.showTime = params.showTime || 0;
        this.fadeOutTime = params.fadeOutTime || 0;

        this.fontStr = `${this.fontSizePx}px Arial`;
        this.retired = false;
        this.state = STATE_FADE_IN;
        this.stateProgress = 0;
    }

    stopWaiting() {
        this.doesWait = false;
    }

    timestep(dt) {
        this.stateProgress += dt;
        if (this.state == STATE_FADE_IN) {
            if (this.stateProgress >= this.fadeInTime) {
                this.stateProgress -= this.fadeInTime;
                this.state++;
            }
        }
        if (this.state == STATE_IDLE) {
            if (this.stateProgress >= this.showTime) {
                if (this.doesWait) {
                    this.stateProgress = this.showTime;
                } else {
                    this.stateProgress -= this.showTime;
                    this.state++;
                }
            }
        }
        if (this.state == STATE_FADE_OUT) {
            if (this.stateProgress >= this.fadeOutTime) {
                this.stateProgress -= this.fadeOutTime;
                this.retired = true;
            }
        }
    }

    draw() {
        let opacity = this.opacity;
        if (this.state == STATE_FADE_IN) opacity *= this.stateProgress / this.fadeInTime;
        if (this.state == STATE_FADE_OUT) opacity *= 1 - (this.stateProgress / this.fadeOutTime);
        if (isNaN(opacity)) opacity = this.opacity;
        addToGlobalAlphaStack(opacity);
        ctx.textAlign = "center";
        ctx.font = this.fontStr;
        ctx.fillStyle = this.color.getStr();
        ctx.fillText(this.text, this.centerX, this.centerY + this.fontSizePx * 0.25);
        popFromGlobalStack();
    }
}
