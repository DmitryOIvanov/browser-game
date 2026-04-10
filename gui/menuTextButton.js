import controls from "../controls.js";
import { ctx } from "../drawing.js";

function getFontStr(sizePx) {
    return `Bold ${sizePx}px Arial`;
}

const BASE_FONT_SIZE = 40;
const PRIMARY_COLOR_STR = 'rgb(255,200,0)';
const SECONDARY_COLOR_STR = 'rgb(255,100,0)';
const TEXT_COLOR = 'white';
const BACKGROUND_COLOR_STR = 'black';
const MAX_SCALE_MULT = 1.1;
const HOVER_CHANGE_RATE = 1 / 3;

ctx.font = getFontStr(BASE_FONT_SIZE);
const BASE_FONT_METRICS = ctx.measureText("Lorem Ipsum");
const FONT_OFFSET = 0.5 * (BASE_FONT_METRICS.fontBoundingBoxAscent - BASE_FONT_METRICS.fontBoundingBoxDescent);

export class MenuTextButton {
    constructor(centerX, centerY, width, text) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.width = width;
        this.text = text;

        this.hoverParameter = 0;
        this.hovering = false;
        this.pressed = false;
        this.primaryPath = this.getPrimaryPath();
    }

    reset() {
        this.hoverParameter = 0;
        this.hovering = false;
        this.pressed = false;
        this.primaryPath = this.getPrimaryPath();
    }

    timestep(dt) {
        this.hovering = false;
        this.pressed = false;
        if (controls.mouse.inBounds) {
            this.hovering = ctx.isPointInPath(this.primaryPath, controls.mouse.x, controls.mouse.y);
            this.pressed = this.hovering && controls.mouse.lPressed;
        }
        this.primaryPath = this.getPrimaryPath();

        if (this.hovering) {
            this.hoverParameter = Math.min(1, this.hoverParameter + HOVER_CHANGE_RATE * dt);
        } else {
            this.hoverParameter = Math.max(0, this.hoverParameter - HOVER_CHANGE_RATE * dt);
        }
    }

    isPressed() { return this.pressed; }

    // Helper methods, not getters
    getScale() {
        return 1 + (MAX_SCALE_MULT - 1) * this.hoverParameter;
    }
    getX(relativeX) {
        return this.centerX + relativeX * this.getScale();
    }
    getY(relativeY) {
        return this.centerY + relativeY * this.getScale();
    }
    customMoveTo(relativeX, relativeY) {
        ctx.moveTo(this.getX(relativeX), this.getY(relativeY));
    }
    customLineTo(relativeX, relativeY) {
        ctx.lineTo(this.getX(relativeX), this.getY(relativeY));
    }
    getPrimaryPath() {
        const path = new Path2D();
        const outerWidth = this.width + 16;
        path.moveTo(this.getX(0.5 * outerWidth + 32), this.getY(0));
        path.lineTo(this.getX(0.5 * outerWidth), this.getY(-32));
        path.lineTo(this.getX(-0.5 * outerWidth), this.getY(-32));
        path.lineTo(this.getX(-0.5 * outerWidth - 32), this.getY(0));
        path.lineTo(this.getX(-0.5 * outerWidth), this.getY(32));
        path.lineTo(this.getX(0.5 * outerWidth), this.getY(32));
        path.closePath();
        return path;
    }

    draw() {
        if (this.hoverParameter > 0) {
            ctx.fillStyle = SECONDARY_COLOR_STR;
            const baseDistance = 0.5 * this.width - 8 + 32 * this.hoverParameter;
            for (let i = -1; i <= 1; i += 2) {
                ctx.beginPath();
                this.customMoveTo(i * (baseDistance + 28), 0);
                this.customLineTo(i * (baseDistance + 0), -28);
                this.customLineTo(i * (baseDistance + 20), -28);
                this.customLineTo(i * (baseDistance + 48), 0);
                this.customLineTo(i * (baseDistance + 20), 28);
                this.customLineTo(i * (baseDistance + 0), 28);
                ctx.closePath();
                ctx.fill();
            }
        }

        ctx.fillStyle = PRIMARY_COLOR_STR;
        ctx.fill(this.primaryPath);

        ctx.fillStyle = BACKGROUND_COLOR_STR;
        ctx.beginPath();
        this.customMoveTo(0.5 * this.width + 28, 0);
        this.customLineTo(0.5 * this.width, -28);
        this.customLineTo(-0.5 * this.width, -28);
        this.customLineTo(-0.5 * this.width - 28, 0);
        this.customLineTo(-0.5 * this.width, 28);
        this.customLineTo(0.5 * this.width, 28);
        ctx.fill();

        ctx.textAlign = "center";
        ctx.font = getFontStr(BASE_FONT_SIZE * this.getScale());
        ctx.fillStyle = TEXT_COLOR;
        ctx.fillText(this.text, this.centerX, this.centerY + FONT_OFFSET);

        ctx.fillStyle = TEXT_COLOR;
    }
}
