import controls from "../../controls.js";
import { ctx } from "../../drawing.js";
import { generateGameSeed } from "../../pseudorandom.js";

const SEED_KEYS = {};
for (let i = 0; i <= 9; i++) {
    SEED_KEYS[`Digit${i}`] = `${i}`;
}
for (let i = 65; i <= 90; i++) {
    const key = String.fromCharCode(i);
    SEED_KEYS["Key" + key] = key;
}

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

export class SeedInputField {
    constructor(centerX, centerY, width) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.width = width;

        this.value = generateGameSeed();
        this.lastNonEmptyValue = this.value;
        this.hoverParameter = 0;
        this.hovering = false;
        this.selected = false;
        this.primaryPath = this.getPrimaryPath();
    }

    randomize() {
        this.value = generateGameSeed();
        this.lastNonEmptyValue = this.value;
    }

    getOutput() {
        return this.lastNonEmptyValue;
    }

    timestep(dt) {
        this.hovering = false;
        if (controls.mouse.inBounds) {
            this.hovering = ctx.isPointInPath(this.primaryPath, controls.mouse.x, controls.mouse.y);
            if (controls.mouse.lPressed) {
                if (!this.selected && this.hovering) {
                    this.value = "";
                } else if (this.selected && !this.hovering) {
                    this.value = this.lastNonEmptyValue;
                }
                this.selected = this.hovering;
            }
        }
        if (controls.pressed["Enter"] || controls.pressed["Escape"]) {
            this.selected = false;
            if (this.value.length <= 0) {
                this.value = this.lastNonEmptyValue;
            }
        }
        if (this.selected) {
            if (controls.pressed["Backspace"] && this.value.length > 0) {
                this.value = this.value.substring(0, this.value.length - 1);
            }
            for (const keyCode in SEED_KEYS) {
                if (controls.pressed[keyCode]) {
                    this.value += SEED_KEYS[keyCode];
                }
            }
        }
        if (this.value.length > 8) {
            this.value = this.value.substring(0, 8);
        }
        if (this.value.length > 0) {
            this.lastNonEmptyValue = this.value;
        }

        if (this.hovering) {
            this.hoverParameter = Math.min(1, this.hoverParameter + HOVER_CHANGE_RATE * dt);
        } else {
            this.hoverParameter = Math.max(0, this.hoverParameter - HOVER_CHANGE_RATE * dt);
        }
        if (this.selected) this.hoverParameter = 1;
        this.primaryPath = this.getPrimaryPath();
    }

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
        path.moveTo(this.getX(0.5 * outerWidth + 52), this.getY(0));
        path.lineTo(this.getX(0.5 * outerWidth + 20), this.getY(-32));
        path.lineTo(this.getX(-0.5 * outerWidth - 20), this.getY(-32));
        path.lineTo(this.getX(-0.5 * outerWidth - 52), this.getY(0));
        path.lineTo(this.getX(-0.5 * outerWidth - 20), this.getY(32));
        path.lineTo(this.getX(0.5 * outerWidth + 20), this.getY(32));
        path.closePath();
        return path;
    }

    draw() {
        ctx.fillStyle = PRIMARY_COLOR_STR;
        ctx.fill(this.primaryPath);

        ctx.fillStyle = BACKGROUND_COLOR_STR;
        ctx.beginPath();
        this.customMoveTo(0.5 * this.width, 0);
        this.customLineTo(0.5 * this.width + 32, -16);
        this.customLineTo(0.5 * this.width + 20, -28);
        this.customLineTo(-0.5 * this.width - 20, -28);
        this.customLineTo(-0.5 * this.width - 32, -16);
        this.customLineTo(-0.5 * this.width, 0);
        this.customLineTo(-0.5 * this.width - 32, 16);
        this.customLineTo(-0.5 * this.width - 20, 28);
        this.customLineTo(0.5 * this.width + 20, 28);
        this.customLineTo(0.5 * this.width + 32, 16);
        ctx.fill();

        ctx.textAlign = "center";
        ctx.font = getFontStr(BASE_FONT_SIZE * this.getScale());
        ctx.fillStyle = TEXT_COLOR;
        let text = this.value;
        if (this.selected && this.value.length < 8) {
            text += "_";
        }
        ctx.fillText(text, this.centerX, this.centerY + FONT_OFFSET);

        ctx.fillStyle = TEXT_COLOR;
    }
}

