import { backgrounds } from "../../backgrounds/backgrounds.js";
import controls from "../../controls.js";
import { ctx, drawDot } from "../../drawing.js";
import { MenuTextButton } from "../../gui/menuTextButton.js";
import { SVG } from "../../svg.js";
import { proceduralModeHeavyComponents, proceduralModeLightComponents } from "./proceduralModeStartScreen.js";

export class BreakScreen {
    constructor(isPause, gameInfo) {
        this.isPause = isPause;
        this.gameInfo = gameInfo;
        this.concluded = false;
        this.quit = false;

        this.quitButton = new MenuTextButton(320, 600, 280, "QUIT");
        this.continueButton = new MenuTextButton(960, 600, 280, isPause ? "RESUME" : "RETRY LEVEL");
    }

    quitRequested() {
        return this.quit;
    }

    nextFrame(dt) {
        backgrounds.title.draw();
        this.quitButton.timestep(dt);
        this.quitButton.draw();
        this.continueButton.timestep(dt);
        this.continueButton.draw();

        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.font = "Bold 80px Arial";
        ctx.fillText(this.isPause ? "PAUSED" : "EXPIRED", 640, 150);
        ctx.font = "Bold 40px Arial";

        const imgHeightOffset = 260;
        const baseImg = SVG.breakScreenWeaponDisplay;
        ctx.drawImage(baseImg, 640 - baseImg.width * 0.5, imgHeightOffset - baseImg.height * 0.5);
        const lightImg = proceduralModeLightComponents[this.gameInfo.lightIndex].icon;
        ctx.drawImage(lightImg, 640 - 64 - 96, imgHeightOffset - 64, 128, 128);
        const heavyImg = proceduralModeHeavyComponents[this.gameInfo.heavyIndex].icon;
        ctx.drawImage(heavyImg, 640 - 64 + 96, imgHeightOffset - 64, 128, 128);

        ctx.fillText(`Level ${this.gameInfo.level + 1}`, 640, 400);
        ctx.fillText(`Seed: ${this.gameInfo.seed}`, 640, 460);
        ctx.fillText(`Deaths: ${this.gameInfo.deaths}`, 640, 520);

        if (controls.mouse.inBounds) {
            drawDot(controls.mouse.x, controls.mouse.y)
        }

        if (this.continueButton.isPressed()) {
            this.concluded = true;
            this.quit = false;
        } else if (this.quitButton.isPressed()) {
            this.concluded = true;
            this.quit = true;
        }
    }
}
