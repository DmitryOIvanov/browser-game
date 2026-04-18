import { backgrounds } from "../../backgrounds/backgrounds.js";
import controls from "../../controls.js";
import { ctx, drawDot } from "../../drawing.js";
import { drawMouseIfInBounds } from "../../drawMouse.js";
import { MenuTextButton } from "../../gui/menuTextButton.js";
import { SVG } from "../../svg.js";
import { stockHeavyComponents, stockLightComponents } from "../../weapons/dualWeapons.js";
import { SeedInputField } from "./seedInputField.js";
import { SeedResetButton } from "./seedResetButton.js";
import { WeaponButton } from "./weaponButton.js";

const SEED_TEXT_FONT = "Bold 32px Arial";
const SEED_TEXT_METRICS = ctx.measureText("SEED");
const WEAPON_FONT = "Bold 50px Arial";

export const proceduralModeLightComponents = [
    {
        class: stockLightComponents.MachineGun,
        icon: SVG.weaponIcons.machineGun,
        buttonX: 240,
        buttonY: 220,
    },
    {
        class: stockLightComponents.Spread,
        icon: SVG.weaponIcons.shotgun,
        buttonX: 420,
        buttonY: 220,
    },
    {
        class: stockLightComponents.Splitter,
        icon: SVG.weaponIcons.splitter,
        buttonX: 240,
        buttonY: 400,
    },
    {
        class: stockLightComponents.Ricochet,
        icon: SVG.weaponIcons.ricochet,
        buttonX: 420,
        buttonY: 400,
    },
];

export const proceduralModeHeavyComponents = [
    {
        class: stockHeavyComponents.Volley,
        icon: SVG.weaponIcons.volley,
        buttonX: 860,
        buttonY: 220,
    },
    {
        class: stockHeavyComponents.Wave,
        icon: SVG.weaponIcons.wave,
        buttonX: 1040,
        buttonY: 220,
    },
    {
        class: stockHeavyComponents.Firework,
        icon: SVG.weaponIcons.starburst,
        buttonX: 860,
        buttonY: 400,
    },
    {
        class: stockHeavyComponents.bounceMayhem,
        icon: SVG.weaponIcons.bounceMayhem,
        buttonX: 1040,
        buttonY: 400,
    },
];

export class ProceduralModeStartScreen {
    constructor() {
        this.concluded = false;

        this.lightButtons = proceduralModeLightComponents.map((entry) => (
            new WeaponButton(entry.buttonX, entry.buttonY, entry.icon)
        ));
        this.heavyButtons = proceduralModeHeavyComponents.map((entry) => (
            new WeaponButton(entry.buttonX, entry.buttonY, entry.icon)
        ));
        this.readyButton = new MenuTextButton(950, 640, 240, "READY");
        this.seedField = new SeedInputField(330, 640, 300);
        this.resetButton = new SeedResetButton(600, 640);

        this.selectedLight = 0;
        this.selectedHeavy = 0;
        this.lightButtons[0].setSelected(true);
        this.heavyButtons[0].setSelected(true);
        this.quit = false;
    }

    getResult() {
        return {
            seed: this.seedField.getOutput(),
            lightWeaponIndex: this.selectedLight,
            heavyWeaponIndex: this.selectedHeavy,
        };
    }

    nextFrame(dt) {
        backgrounds.title.draw();
        this.readyButton.timestep(dt);
        this.readyButton.draw();
        this.resetButton.timestep(dt);
        this.resetButton.draw();
        if (this.resetButton.isPressed()) {
            this.seedField.randomize();
        }
        this.seedField.timestep(dt);
        this.seedField.draw();
        ctx.textAlign = "center";
        ctx.fillStyle = "#fff";
        ctx.font = SEED_TEXT_FONT;
        ctx.fillText("SEED", this.seedField.centerX, this.seedField.centerY - 44);
        ctx.font = WEAPON_FONT;
        ctx.fillText("PRIMARY ATTACK", 330, 100);
        ctx.fillText("SPECIAL ATTACK", 950, 100);

        if (controls.pressed["Escape"]) {
            this.concluded = true;
            this.quit = true;
            return;
        }
        if (this.readyButton.isPressed()) {
            this.concluded = true;
            return;
        }
        for (let i = 0; i < this.lightButtons.length; i++) {
            const button = this.lightButtons[i];
            button.timestep(dt);
            if (button.isPressed() && i != this.selectedLight) {
                this.lightButtons[this.selectedLight].setSelected(false);
                button.setSelected(true);
                this.selectedLight = i;
            }
        }
        for (let i = 0; i < this.heavyButtons.length; i++) {
            const button = this.heavyButtons[i];
            button.timestep(dt);
            if (button.isPressed() && i != this.selectedHeavy) {
                this.heavyButtons[this.selectedHeavy].setSelected(false);
                button.setSelected(true);
                this.selectedHeavy = i;
            }
        }
        for (let i = 0; i < this.lightButtons.length; i++) {
            this.lightButtons[i].draw();
        }
        for (let i = 0; i < this.heavyButtons.length; i++) {
            this.heavyButtons[i].draw();
        }

        drawMouseIfInBounds();
    }
}
