import { backgrounds, timestepBackgrounds } from "./backgrounds/backgrounds.js";
import { HorizontalGridBackground } from "./backgrounds/horizontalGridBackground.js";
import { FlatColor } from "./color.js";
import controls from "./controls.js";
import { canv, ctx, drawDot, fillScreen } from "./drawing.js";
import { MenuTextButton } from "./gui/menuTextButton.js";
import { MinimalTextButton } from "./gui/minimalTextButton.js";
import DebugManager from "./modes/debug/debugEnemySpawning.js";
import ModeBController from "./modes/modeB/modeBController.js";
import ProceduralModeController from "./modes/proceduralMode/proceduralModeController.js";
import playField from "./playField.js";
import { SVG } from "./svg.js";

const playButton = new MenuTextButton(canv.width / 2, canv.height / 2 + 60, 240, "PLAY");
const tutorialButton = new MenuTextButton(canv.width / 2, canv.height / 2 + 160, 240, "TUTORIAL");

const STATE_TITLE = 0;
const STATE_MODE_PLAY = 1;
const STATE_DEBUG = 3;

const DEBUG_KEYS = ["KeyD", "KeyE", "KeyB", "KeyU", "KeyG"];
const SCRIPT_KEYS = ["KeyS", "KeyC", "KeyR"];

function allKeysHeld(keys) {
    for (let i = 0; i < keys.length; i++) {
        if (!controls.held[keys[i]]) {
            return false;
        }
    }
    return true;
}

function clearKeys(keys) {
    for (let i = 0; i < keys.length; i++) {
        controls.pressed[keys[i]] = false;
        controls.held[keys[i]] = false;
    }
}

const controller = {
    initialize() {
        this.state = STATE_TITLE;
        this.subController = null;
        playField.initialize();
    },

    nextFrame(dt) {
        fillScreen("black");
        timestepBackgrounds(dt);

        if (this.state == STATE_TITLE) {
            backgrounds.title.draw();

            ctx.textAlign = "center";
            ctx.font = "100px arial";
            ctx.fillStyle = '#fff';
            ctx.drawImage(SVG.title, canv.width / 2 - 0.5 * SVG.title.width, canv.height / 2 - 0.5 * SVG.title.height - 200);
            playButton.timestep(dt);
            playButton.draw();
            tutorialButton.timestep(dt);
            tutorialButton.draw();
            if (controls.mouse.inBounds) {
                drawDot(controls.mouse.x, controls.mouse.y)
            }

            if (tutorialButton.isPressed() || playButton.isPressed()) {
                controls.mouse.lPressed = false;
                controls.mouse.leftHeld = false;
                this.state = STATE_MODE_PLAY;
                const tutorialRequested = tutorialButton.isPressed();
                this.subController = new ProceduralModeController(tutorialRequested);
            } else if (allKeysHeld(DEBUG_KEYS)) {
                clearKeys(DEBUG_KEYS);
                controls.mouse.lPressed = false;
                controls.mouse.leftHeld = false;
                this.state = STATE_DEBUG;
                playField.initialize();
                playField.setManager(new DebugManager());
            } else if (allKeysHeld(SCRIPT_KEYS)) {
                clearKeys(SCRIPT_KEYS);
                controls.mouse.lPressed = false;
                controls.mouse.leftHeld = false;
                this.state = STATE_MODE_PLAY;
                this.subController = new ModeBController();
            }
        } else if (this.state == STATE_MODE_PLAY) {
            this.subController.nextFrame(dt);
            if (this.subController.concluded) this.state = STATE_TITLE;
        } else if (this.state == STATE_DEBUG) {
            if (controls.pressed["Escape"]) {
                this.state = STATE_TITLE;
                return;
            }
            playField.advanceOneFrame(dt);
            playField.redraw();
            if (playField.manager.concluded) this.state = STATE_TITLE;
        }
    }
}

export default controller;
