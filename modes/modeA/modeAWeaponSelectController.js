import { FlatColor, RainbowColor } from "../../color.js";
import controls from "../../controls.js";
import { canv, ctx, drawDot } from "../../drawing.js";
import { drawMouseIfInBounds } from "../../drawMouse.js";
import { MinimalTextButton } from "../../gui/minimalTextButton.js";
import { modeALevelList } from "./modeAGame.js";

export default class ModeAWeaponSelectController {
    constructor(game) {
        this.game = game;
        this.concluded = false;

        const level = game.level;
        this.buttons = modeALevelList[game.level].weapons.map((entry, index) => (
            new MinimalTextButton(canv.width / 2, 200 + 80 * index, entry.name, 60, FlatColor.WHITE)
        ));
    }

    nextFrame() {
        if (controls.pressed["KeyM"]) {
            this.concluded = true;
        }
        if (this.concluded) return;

        drawMouseIfInBounds();
        for (const button of this.buttons) {
            button.update();
            button.draw();
        }
        for (let i = 0; i < this.buttons.length; i++) {
            if (this.buttons[i].isPressed()) {
                this.game.weaponGenerator = modeALevelList[this.game.level].weapons[i].generator;
                this.concluded = true;
                return;
            }
        }

        ctx.textAlign = "center";
        ctx.font = "80px arial";
        ctx.fillStyle = '#fff';
        ctx.fillText("Choose Your Weapon", canv.width / 2, 120);
    }
}
