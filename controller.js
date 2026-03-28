import { FlatColor } from "./color.js";
import controls from "./controls.js";
import { canv, ctx, drawDot, fillScreen } from "./drawing.js";
import { CanvasTextButton } from "./gui.js";
import DebugManager from "./modes/debug/debugEnemySpawning.js";
import ModeBController from "./modes/modeB/modeBController.js";
import ProceduralModeController from "./modes/proceduralMode/proceduralModeController.js";
import playField from "./playField.js";

const tutorialButton = new CanvasTextButton(canv.width / 2, canv.height / 2, "Tutorial", 60, new FlatColor("#fff"));
const playButton = new CanvasTextButton(canv.width / 2, canv.height / 2 + 120, "Play", 60, new FlatColor("#fff"));

const STATE_TITLE = 0;
const STATE_MODE_PLAY = 1;
const STATE_MODE_SCRIPTED = 2;
const STATE_DEBUG = 3;

const DEBUG_KEYS = ["KeyD", "KeyE", "KeyB", "KeyU", "KeyG"];
const SCRIPT_KEYS = ["KeyS", "KeyC", "KeyR", "KeyI", "KeyP", "KeyT"];

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

    nextFrame() {
        fillScreen("black");
        if (this.state == STATE_TITLE) {
            ctx.textAlign = "center";
            ctx.font = "100px arial";
            ctx.fillStyle = '#fff';
            ctx.fillText("video game", canv.width / 2, canv.height / 2 - 200);
            tutorialButton.update();
            tutorialButton.draw();
            playButton.update();
            playButton.draw();
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
            }
        } else if (this.state == STATE_MODE_PLAY) {
            if (controls.pressed["Escape"]) {
                this.state = STATE_TITLE;
                return;
            }
            this.subController.nextFrame();
            if (this.subController.concluded) this.state = STATE_TITLE;
        } else if (this.state == STATE_DEBUG) {
            if (controls.pressed["Escape"]) {
                this.state = STATE_TITLE;
                return;
            }
            playField.advanceOneFrame();
            playField.redraw();
            if (playField.manager.concluded) this.state = STATE_TITLE;
        }
    }
}

export default controller;
