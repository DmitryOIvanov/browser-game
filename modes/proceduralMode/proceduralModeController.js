import controls from "../../controls.js";
import SimpleMessageScreen from "../../simpleMessageScreen.js";
import playField from "../../playField.js";
import SimpleOptionScreen from "../../simpleOptionScreen.js";
import { TutorialTask } from "../../tutorial/tutorialTask.js";
import { PseudorandomGenerator } from "../../pseudorandom.js";
import ProceduralModeManager from "./proceduralModeManager.js";
import { ProceduralModeStartScreen } from "./proceduralModeStartScreen.js";
import { BreakScreen } from "./breakScreen.js";

const STATE_STARTING = 0;
const STATE_PLAYING = 1;
const STATE_LOSE = 2;
const STATE_PAUSE = 3;

const PAUSE_COOLDOWN_LENGTH = 60;

export default class ProceduralModeController {
    constructor(tutorialRequested) {
        this.concluded = false;
        this.subController = null;

        this.isTutorial = tutorialRequested;
        this.milestoneRng = null;
        this.gameInfo = {
            level: 0,
            seed: "FAKESEED",
            lightIndex: 0,
            heavyIndex: 0,
            deaths: 0,
        }
        this.pauseCooldown = 0;
        if (this.isTutorial) {
            this.startPlay();
        } else {
            this.startStart();
        }
    }

    nextFrame(dt) {
        if (this.concluded) return;
        this.pauseCooldown -= dt;

        if (this.state == STATE_STARTING) {
            this.subController.nextFrame(dt);
            if (this.subController.concluded) {
                const result = this.subController.getResult();
                this.milestoneRng = PseudorandomGenerator.fromString(result.seed);
                this.gameInfo.lightIndex = result.lightWeaponIndex;
                this.gameInfo.heavyIndex = result.heavyWeaponIndex;
                this.gameInfo.seed = result.seed;
                this.startPlay();
            }
        } else if (this.state == STATE_PLAYING) {
            playField.advanceOneFrame(dt);
            if (playField.manager.concluded) {
                if (playField.manager.tutorialComplete) {
                    this.concluded = true;
                    return;
                }
                this.gameInfo.level = playField.manager.level;
                this.milestoneRng = playField.manager.lastMilestoneRng;
                this.gameInfo.deaths++;
                this.startLoseScreen();
            } else {
                playField.redraw();
            }
            if (controls.held["Escape"] || controls.held["KeyP"]) {
                if (this.pauseCooldown <= 0) {
                    this.startPauseScreen();
                }
            }
        } else if (this.state == STATE_LOSE || this.state == STATE_PAUSE) {
            this.subController.nextFrame(dt);
            if (this.subController.concluded) {
                if (this.subController.quitRequested()) {
                    this.concluded = true;
                } else {
                    if (this.state == STATE_LOSE) {
                        this.startPlay();
                    } else {
                        this.resumePlay();
                        this.pauseCooldown = PAUSE_COOLDOWN_LENGTH;
                    }
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
        if (this.isTutorial) {
            playField.setManager(new ProceduralModeManager(true, this.gameInfo.level, 0, 0));
        } else {
            playField.setManager(new ProceduralModeManager(false, this.gameInfo.level, this.gameInfo.lightIndex, this.gameInfo.heavyIndex, this.milestoneRng.clone()));
        }
    }

    resumePlay() {
        this.state = STATE_PLAYING;
        this.subController = null;
    }

    startLoseScreen() {
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_LOSE;
        this.subController = new BreakScreen(this.gameInfo, false, this.isTutorial);
    }

    startPauseScreen() {
        controls.mouse.lPressed = false;
        controls.mouse.leftHeld = false;
        this.state = STATE_PAUSE;
        this.subController = new BreakScreen(this.gameInfo, true, this.isTutorial);
    }
}
