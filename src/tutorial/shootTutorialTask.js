import controls from "../controls.js";
import { ctx, fillTextCenteredXY, canv, addToGlobalAlphaStack, popFromGlobalStack } from "../drawing.js";
import drawTutorialMouse from "./drawTutorialMouse.js";
import { TutorialTask } from "./tutorialTask.js";

export class ShootTutorialTask extends TutorialTask {
    constructor() {
        super();
        this.mouseHeldTime = 0;
    }

    timestep(dt) {
        if (controls.mouse.leftHeld) {
            this.mouseHeldTime += dt;
            if (this.mouseHeldTime >= 30) {
                this.satisfy();
            }
        }
        super.timestep(dt);
    }

    drawRaw() {
        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#FFF";
        drawTutorialMouse(canv.width / 2, canv.height / 2 - 130, true, false);
        fillTextCenteredXY("Aim & Shoot", 60, canv.width / 2, canv.height / 2 + 100);
    }
}

