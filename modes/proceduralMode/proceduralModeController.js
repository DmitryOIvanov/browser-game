import controls from "../../controls.js";
import SimpleMessageScreen from "../../simpleMessageScreen.js";
import playField from "../../playField.js";
import SimpleOptionScreen from "../../simpleOptionScreen.js";
import { TutorialTask } from "../../tutorial/tutorialTask.js";

const STATE_WEAPON_SELECT = 0;
const STATE_PLAYING = 1;
const STATE_LOSE = 2;
const STATE_END = 3;
const STATE_TUTORIAL_DECISION = 4;

export default class ProceduralModeController {
    constructor() {
        this.concluded = false;
        this.subController = null;

        this.levelReached = 0;
        this.startTutorialDecision();
    }

    nextFrame() {
        if (this.concluded) return;
        if (this.state == STATE_PLAYING) {
            playField.advanceOneFrame();
            if (playField.manager.concluded) {
                this.levelReached = playField.manager.level
                if (this.levelReached == modeBLevels.length) {
                    this.startEndScreen();
                } else {
                    this.startLoseScreen();
                }
            } else {
                playField.redraw();
            }
        } else if (this.state == STATE_LOSE) {
            this.subController.nextFrame();
            if (this.subController.concluded) {
                if (this.subController.result == 0) {
                    this.startPlay();
                } else {
                    this.concluded = true;
                }
            }
        } else if (this.state == STATE_END) {
            this.subController.nextFrame();
            if (this.subController.concluded) {
                this.concluded = true;
            }
        } else if (this.state == STATE_TUTORIAL_DECISION) {
            this.subController.nextFrame();
            if (this.subController.concluded) {
                if (this.subController.result != 0) {
                    this.levelReached = 2;
                }
                this.startPlay();
            }
        }
    }

    startPlay() {
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_PLAYING;
        this.subController = null;
        playField.initialize();
        playField.setManager(new ModeBManager(this.levelReached));
    }

    startLoseScreen() {
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_LOSE;
        this.subController = new SimpleOptionScreen("Game Over", ["Retry", "Quit"]);
    }

    startEndScreen() {
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_END;
        this.subController = new SimpleMessageScreen("You Win");
    }

    startTutorialDecision() {
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_TUTORIAL_DECISION;
        this.subController = new SimpleOptionScreen("Play Tutorial?", ["Yes", "No"]);
    }
}
