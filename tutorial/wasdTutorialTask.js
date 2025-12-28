import controls from "../controls.js";
import { ctx, fillTextCenteredXY, canv, customStrokeRect } from "../drawing.js";
import { TutorialTask } from "./tutorialTask.js";

const KEY_OFFSETS_X = [0, -1, 0, 1];
const KEY_OFFSETS_Y = [-1, 0, 0, 0];

export class WasdTutorialTask extends TutorialTask {
    constructor() {
        super();
        this.satisfied = false;
    }

    getSatisfaction() {
        if (controls.held["KeyW"] || controls.held["KeyA"] || controls.held["KeyS"] || controls.held["KeyD"]) {
            this.satisfied = true;
        }
        return this.satisfied;
    }

    drawRaw() {
        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#FFF";
        this.drawWASD();
        fillTextCenteredXY("Move", 60, canv.width / 2, canv.height / 2 + 100);
    }

    drawWASD() {
        const CENTER_X = canv.width / 2;
        const CENTER_Y = canv.height / 2 - 100;
        const OFFSET_SIZE_X = 85;
        const OFFSET_SIZE_Y = 85;
        const RADIUS_X = 35;
        const RADIUS_Y = 35;
        ctx.lineWidth = 8;

        for (let i = 0; i < 4; i++) {
            const x = CENTER_X + OFFSET_SIZE_X * KEY_OFFSETS_X[i];
            const y = CENTER_Y + OFFSET_SIZE_Y * KEY_OFFSETS_Y[i];
            customStrokeRect(x - RADIUS_X, y - RADIUS_Y, 2 * RADIUS_X, 2 * RADIUS_Y);
            fillTextCenteredXY("WASD".charAt(i), 52, x, y + 6);
        }
    }
}

