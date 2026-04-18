import controls from "../../controls.js";
import { ctx } from "../../drawing.js";
import { SVG } from "../../svg.js";

const CLICK_RADIUS = 32;
const HOVER_SCALE = 1.1;

export class SeedResetButton {
    constructor(centerX, centerY) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.hovering = false;
        this.pressed = false;
    }

    isPressed() { return this.pressed; }

    timestep(dt) {
        this.hovering = false;
        if (controls.mouse.inBounds) {
            const dx = controls.mouse.x - this.centerX;
            const dy = controls.mouse.y - this.centerY;
            this.hovering = dx * dx + dy * dy <= CLICK_RADIUS * CLICK_RADIUS;
            this.pressed = this.hovering && controls.mouse.lPressed;
        }
    }

    draw() {
        const scale = this.hovering ? HOVER_SCALE : 1;
        ctx.drawImage(SVG.seedResetIcon, this.centerX - 32 * scale, this.centerY - 32 * scale, 64 * scale, 64 * scale);
    }
}
