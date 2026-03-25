import controls from "../../controls.js";
import SimpleMessageScreen from "../../simpleMessageScreen.js";
import playField from "../../playField.js";
import SimpleOptionScreen from "../../simpleOptionScreen.js";
import { TutorialTask } from "../../tutorial/tutorialTask.js";
import { PseudorandomGenerator } from "../../pseudorandom.js";
import ProceduralModeManager from "./proceduralModeManager.js";

const STATE_PLAYING = 1;
const STATE_LOSE = 2;

export default class ProceduralModeController {
    constructor() {
        this.concluded = false;
        this.subController = null;

        this.levelReached = 0;
        this.milestoneRng = PseudorandomGenerator.fromString("seed123");
        this.startPlay();
    }

    nextFrame() {
        if (this.concluded) return;
        if (this.state == STATE_PLAYING) {
            playField.advanceOneFrame();
            if (playField.manager.concluded) {
                this.levelReached = playField.manager.level;
                this.milestoneRng = playField.manager.lastMilestoneRng;
                this.startLoseScreen();
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
        }
    }

    startPlay() {
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_PLAYING;
        this.subController = null;
        playField.initialize();
        playField.setManager(new ProceduralModeManager(this.levelReached, this.milestoneRng));
    }

    startLoseScreen() {
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_LOSE;
        this.subController = new SimpleOptionScreen("Game Over", ["Retry", "Quit"]);
    }
}
