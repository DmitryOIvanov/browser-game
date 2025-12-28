import controls from "../controls.js";
import { ctx, fillTextCenteredXY, canv, addToGlobalAlphaStack, popFromGlobalStack } from "../drawing.js";
import { TutorialTask } from "./tutorialTask.js";

export class ShootTutorialTask extends TutorialTask {
    constructor() {
        super();
        this.satisfied = false;
    }

    getSatisfaction() {
        if (controls.mouse.leftHeld) {
            this.satisfied = true;
        }
        return this.satisfied;
    }

    drawRaw() {
        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#FFF";
        this.drawMouse();
        fillTextCenteredXY("Aim & Shoot", 60, canv.width / 2, canv.height / 2 + 100);
    }

    drawMouse() {
        const CENTER_X = canv.width / 2;
        const CENTER_Y = canv.height / 2 - 130;
        const RADIUS = 40;
        const BAR_HEIGHT = 40;
        const BUTTON_OFFSET = 10;

        ctx.lineWidth = 8;

        ctx.beginPath();
        ctx.moveTo(CENTER_X - RADIUS, CENTER_Y + 0.5 * BAR_HEIGHT);
        ctx.lineTo(CENTER_X - RADIUS, CENTER_Y - 0.5 * BAR_HEIGHT);
        ctx.arc(CENTER_X, CENTER_Y - 0.5 * BAR_HEIGHT, RADIUS, Math.PI, 0);
        ctx.lineTo(CENTER_X + RADIUS, CENTER_Y + 0.5 * BAR_HEIGHT);
        ctx.arc(CENTER_X, CENTER_Y + 0.5 * BAR_HEIGHT, RADIUS, 0, Math.PI);
        ctx.moveTo(CENTER_X - RADIUS, CENTER_Y - BUTTON_OFFSET);
        ctx.lineTo(CENTER_X + RADIUS, CENTER_Y - BUTTON_OFFSET);
        ctx.moveTo(CENTER_X, CENTER_Y - BUTTON_OFFSET);
        ctx.lineTo(CENTER_X, CENTER_Y - 0.5 * BAR_HEIGHT - RADIUS);
        ctx.stroke();

        addToGlobalAlphaStack(0.5);
        ctx.beginPath();
        ctx.arc(CENTER_X, CENTER_Y - 0.5 * BAR_HEIGHT, RADIUS, Math.PI, 1.5 * Math.PI);
        ctx.lineTo(CENTER_X, CENTER_Y - 0.5 * BAR_HEIGHT - RADIUS);
        ctx.lineTo(CENTER_X, CENTER_Y - BUTTON_OFFSET);
        ctx.lineTo(CENTER_X - RADIUS, CENTER_Y - BUTTON_OFFSET);
        ctx.closePath();
        ctx.fill();
        popFromGlobalStack();
    }
}

