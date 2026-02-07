import Color from "./color.js";
import controls from "./controls.js";
import { canv, ctx, drawDot, fillScreen } from "./drawing.js";
import { CanvasTextButton } from "./gui.js";
import playField from "./playField.js";
import DebugManager from "./modes/debug/debugEnemySpawning.js";
import ModeAController from "./modes/modeA/modeAController.js";
import ModeBController from "./modes/modeB/modeBController.js";

const modeBButton = new CanvasTextButton(canv.width / 2, canv.height / 2, "Play", 60, new Color(false, "#fff"));

const STATE_TITLE = 0;
const STATE_MODE_B = 1;
const STATE_DEBUG = 2;

const DEBUG_KEYS = ["KeyD", "KeyE", "KeyB", "KeyU", "KeyG"];
function debugRequested() {
    for (let i = 0; i < DEBUG_KEYS.length; i++) {
        if (!controls.held[DEBUG_KEYS[i]]) {
            return false;
        }
    }
    return true;
}
function clearDebugInputs() {
    for (let i = 0; i < DEBUG_KEYS.length; i++) {
        controls.pressed[DEBUG_KEYS[i]] = false;
        controls.held[DEBUG_KEYS[i]] = false;
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
            modeBButton.update();
            modeBButton.draw();
            if (controls.mouse.inBounds) {
                drawDot(controls.mouse.x, controls.mouse.y)
            }

            if (modeBButton.isPressed()) {
                controls.mouse.lPressed = false;
                controls.mouse.leftHeld = false;
                this.state = STATE_MODE_B;
                this.subController = new ModeBController();
            } else if (debugRequested()) {
                clearDebugInputs();
                controls.mouse.lPressed = false;
                controls.mouse.leftHeld = false;
                this.state = STATE_DEBUG;
                playField.initialize();
                playField.setManager(new DebugManager());
            }
        } else if (this.state == STATE_MODE_B) {
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
