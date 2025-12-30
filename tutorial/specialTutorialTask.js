import { canv, ctx, fillTextCenteredXY, fillTextFromCorner } from "../drawing.js";
import drawTutorialMouse from "./drawTutorialMouse.js";
import { TutorialTask } from "./tutorialTask.js";

export class SpecialTutorialTask extends TutorialTask {
    constructor() {
        super();
    }

    timeStep(dt) {
        // this.satisfy();
        super.timeStep(dt);
    }

    drawRaw() {
        const MOUSE_OFFSET_X = 300;

        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#FFF";

        drawTutorialMouse(canv.width / 2 - MOUSE_OFFSET_X, canv.height / 2 - 130, false, true);
        fillTextFromCorner("Hold - Charge Special Attack", 50, canv.width / 2 + 80 - MOUSE_OFFSET_X, canv.height / 2 - 150);
        fillTextFromCorner("Release - Fire (if Charged)", 50, canv.width / 2 + 80 - MOUSE_OFFSET_X, canv.height / 2 - 80);

        drawTutorialMouse(canv.width / 2 - MOUSE_OFFSET_X, canv.height / 2 + 130, true, true);
        fillTextFromCorner("Hold - Fire when Ready", 50, canv.width / 2 + 80 - MOUSE_OFFSET_X, canv.height / 2 + 150);
    }
}


