import controls from "./controls.js";
import { ctx } from "./drawing.js";

const SIDE_LENGTH = 32;
const MID_LENGTH = 24;
const TOTAL_ANGLE_CHANGE = Math.PI * 0.25;

export function drawMouseIfInBounds() {
    if (controls.mouse.inBounds) {
        const x = controls.mouse.x;
        const y = controls.mouse.y;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + SIDE_LENGTH);
        ctx.lineTo(x + MID_LENGTH * Math.sin(TOTAL_ANGLE_CHANGE * 0.5), y + MID_LENGTH * Math.cos(TOTAL_ANGLE_CHANGE * 0.5));
        ctx.lineTo(x + SIDE_LENGTH * Math.sin(TOTAL_ANGLE_CHANGE), y + SIDE_LENGTH * Math.cos(TOTAL_ANGLE_CHANGE));
        ctx.closePath();
        ctx.fill();
    }
}
