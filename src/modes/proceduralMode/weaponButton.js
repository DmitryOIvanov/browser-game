import controls from "../../controls.js";
import { addToGlobalAlphaStack, ctx, popFromGlobalStack } from "../../drawing.js";

const UNSELECTED_SCALE = 0.75;
const UNSELECTED_ALPHA = 0.5;

export class WeaponButton {
    constructor(centerX, centerY, icon) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.icon = icon;

        this.selected = false;
        this.hovering = false;
        this.pressed = false;
        this.boundingPath = null;
        this.updateBoundingPath();
    }

    isPressed() {
        return this.pressed;
    }

    updateBoundingPath() {
        const scale = this.selected ? 1 : UNSELECTED_SCALE;
        this.boundingPath = new Path2D();
        this.boundingPath.roundRect(this.centerX - 80 * scale, this.centerY - 80 * scale, 160 * scale, 160 * scale, 24 * scale);
    }

    setSelected(bool) {
        if (this.selected != bool) {
            this.selected = bool;
            this.updateBoundingPath();
        }
    }

    timestep(dt) {
        this.hovering = false;
        this.pressed = false;
        if (controls.mouse.inBounds) {
            this.hovering = ctx.isPointInPath(this.boundingPath, controls.mouse.x, controls.mouse.y);
            this.pressed = this.hovering && controls.mouse.lPressed;
        }
    }

    draw() {
        const scale = this.selected ? 1 : UNSELECTED_SCALE;
        ctx.fillStyle = "#000";
        ctx.fill(this.boundingPath);
        if (!this.selected && !this.hovering) addToGlobalAlphaStack(UNSELECTED_ALPHA);
        ctx.drawImage(this.icon, this.centerX - 80 * scale, this.centerY - 80 * scale, 160 * scale, 160 * scale);
        if (!this.selected && !this.hovering) popFromGlobalStack(UNSELECTED_ALPHA);
    }
}
