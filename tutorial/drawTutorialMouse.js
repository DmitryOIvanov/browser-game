import { addToGlobalAlphaStack, ctx, popFromGlobalStack } from "../drawing.js";

const RADIUS = 40;
const BAR_HEIGHT = 40;
const BUTTON_OFFSET = 10;
const LINE_WIDTH = 8;

export default function drawTutorialMouse(centerX, centerY, leftPressed, rightPressed) {
    ctx.lineWidth = LINE_WIDTH;

    ctx.beginPath();
    ctx.moveTo(centerX - RADIUS, centerY + 0.5 * BAR_HEIGHT);
    ctx.lineTo(centerX - RADIUS, centerY - 0.5 * BAR_HEIGHT);
    ctx.arc(centerX, centerY - 0.5 * BAR_HEIGHT, RADIUS, Math.PI, 0);
    ctx.lineTo(centerX + RADIUS, centerY + 0.5 * BAR_HEIGHT);
    ctx.arc(centerX, centerY + 0.5 * BAR_HEIGHT, RADIUS, 0, Math.PI);
    ctx.moveTo(centerX - RADIUS, centerY - BUTTON_OFFSET);
    ctx.lineTo(centerX + RADIUS, centerY - BUTTON_OFFSET);
    ctx.moveTo(centerX, centerY - BUTTON_OFFSET);
    ctx.lineTo(centerX, centerY - 0.5 * BAR_HEIGHT - RADIUS);
    ctx.stroke();

    addToGlobalAlphaStack(0.5);
    if (leftPressed) {
        ctx.beginPath();
        ctx.arc(centerX, centerY - 0.5 * BAR_HEIGHT, RADIUS, Math.PI, 1.5 * Math.PI);
        ctx.lineTo(centerX, centerY - 0.5 * BAR_HEIGHT - RADIUS);
        ctx.lineTo(centerX, centerY - BUTTON_OFFSET);
        ctx.lineTo(centerX - RADIUS, centerY - BUTTON_OFFSET);
        ctx.closePath();
        ctx.fill();
    }
    if (rightPressed) {
        ctx.beginPath();
        ctx.arc(centerX, centerY - 0.5 * BAR_HEIGHT, RADIUS, 1.5 * Math.PI, 2 * Math.PI);
        ctx.lineTo(centerX + RADIUS, centerY - BUTTON_OFFSET);
        ctx.lineTo(centerX, centerY - BUTTON_OFFSET);
        ctx.lineTo(centerX, centerY - 0.5 * BAR_HEIGHT - RADIUS);
        ctx.closePath();
        ctx.fill();
    }
    popFromGlobalStack();
}
