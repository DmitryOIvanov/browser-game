import controls from "../../controls.js";
import SimpleMessageScreen from "../../simpleMessageScreen.js";
import playField from "../../playField.js";
import SimpleOptionScreen from "../../simpleOptionScreen.js";
import { TutorialTask } from "../../tutorial/tutorialTask.js";
import { PseudorandomGenerator } from "../../pseudorandom.js";
import ProceduralModeManager from "./proceduralModeManager.js";
import { ProceduralModeStartScreen } from "./proceduralModeStartScreen.js";

const STATE_STARTING = 0;
const STATE_PLAYING = 1;
const STATE_LOSE = 2;

export default class ProceduralModeController {
    constructor(tutorialRequested) {
        this.concluded = false;
        this.subController = null;

        this.levelReached = tutorialRequested ? -2 : 0;
        this.milestoneRng = null;
        this.lightIndex = 0;
        this.heavyIndex = 0;
        this.startStart();
    }

    nextFrame(dt) {
        if (this.concluded) return;
        if (this.state == STATE_STARTING) {
            this.subController.nextFrame(dt);
            if (this.subController.concluded) {
                const result = this.subController.getResult();
                this.milestoneRng = PseudorandomGenerator.fromString(result.seed);
                this.lightIndex = result.lightWeaponIndex;
                this.heavyIndex = result.heavyWeaponIndex;
                this.startPlay();
            }
        } else if (this.state == STATE_PLAYING) {
            playField.advanceOneFrame(dt);
            if (playField.manager.concluded) {
                this.levelReached = playField.manager.level;
                this.milestoneRng = playField.manager.lastMilestoneRng;
                this.startLoseScreen();
            } else {
                playField.redraw();
            }
        } else if (this.state == STATE_LOSE) {
            this.subController.nextFrame(dt);
            if (this.subController.concluded) {
                if (this.subController.result == 0) {
                    this.startPlay();
                } else {
                    this.concluded = true;
                }
            }
        }
    }

    startStart() {
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_STARTING;
        this.subController = new ProceduralModeStartScreen();
    }

    startPlay() {
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_PLAYING;
        this.subController = null;
        playField.initialize();
        playField.setManager(new ProceduralModeManager(this.levelReached, this.milestoneRng.clone(), this.lightIndex, this.heavyIndex));
    }

    startLoseScreen() {
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_LOSE;
        this.subController = new SimpleOptionScreen("Game Over", ["Retry", "Quit"]);
    }
}
