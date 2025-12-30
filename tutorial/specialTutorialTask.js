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
        const MOUSE_OFFSET_X = 240;

        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#FFF";
        fillTextCenteredXY("Special Attack", 60, canv.width / 2, canv.height / 2 - 150);

        drawTutorialMouse(canv.width / 2 - MOUSE_OFFSET_X, canv.height / 2 + 110, false, true);
        fillTextFromCorner("Hold - Charge", 50, canv.width / 2 + 80 - MOUSE_OFFSET_X, canv.height / 2 + 90);
        fillTextFromCorner("Release - Fire (if charged)", 50, canv.width / 2 + 80 - MOUSE_OFFSET_X, canv.height / 2 + 160);

        drawTutorialMouse(canv.width / 2 - MOUSE_OFFSET_X, canv.height / 2 + 260, true, true);
        fillTextFromCorner("Hold - Fire when ready", 50, canv.width / 2 + 80 - MOUSE_OFFSET_X, canv.height / 2 + 280);
    }
}


