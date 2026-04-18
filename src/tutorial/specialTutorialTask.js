import { canv, ctx, fillTextCenteredXY, fillTextFromCorner } from "../drawing.js";
import playField from "../playField.js";
import drawTutorialMouse from "./drawTutorialMouse.js";
import { TutorialTask } from "./tutorialTask.js";

const EXTRA_END_TIME = 30;

export class SpecialTutorialTask extends TutorialTask {
    constructor() {
        super(EXTRA_END_TIME);
        playField.player.weapon.hasStartedAHeavyAttack = false;
        playField.player.weapon.hasFinishedAHeavyAttack = false;
    }

    timestep(dt) {
        if (playField.player.weapon.hasFinishedAHeavyAttack) {
            this.satisfy();
        }
        super.timestep(dt);
    }

    drawRaw() {
        const MOUSE_OFFSET_X = 300;

        ctx.strokeStyle = "#FFF";
        ctx.fillStyle = "#FFF";

        drawTutorialMouse(canv.width / 2, canv.height / 2 - 130, false, true);
        fillTextCenteredXY("Fire Special Attack", 60, canv.width / 2, canv.height / 2 + 100);
    }
}


