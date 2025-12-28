import { addToGlobalAlphaStack, popFromGlobalStack } from "../drawing.js";

const STATE_APPEAR = 0;
const STATE_UNSATISFIED = 1;
const STATE_DISAPPEAR = 2;

const APPEAR_TIME = 20;
const HIGHLIGHT_TIME = 20
const DISAPPEAR_TIME = 20;

const BASE_OPACITY = 0.6;

export class TutorialTask {
    constructor(extraEndTime) {
        this.extraEndTime = extraEndTime || 0;
        this.totalEndTime = HIGHLIGHT_TIME + this.extraEndTime + DISAPPEAR_TIME;

        this.satisfactionAchieved = false;
        this.state = STATE_APPEAR;
        this.stateProgress = 0;
        this.retired = false;
    }

    timeStep(dt) {
        if (this.retired) return;

        if (this.getSatisfaction()) {
            this.satisfactionAchieved = true;
        }

        if (this.state == STATE_APPEAR) {
            this.stateProgress += dt;
            if (this.stateProgress >= APPEAR_TIME) {
                this.state++;
            }
        }
        if (this.state == STATE_UNSATISFIED && this.satisfactionAchieved) {
            this.state++;
            this.stateProgress = 0;
        }
        if (this.state == STATE_DISAPPEAR) {
            this.stateProgress += dt;
            if (this.stateProgress >= this.totalEndTime) {
                this.retired = true;
            }
        }
    }

    draw() {
        let opacity = BASE_OPACITY;
        if (this.state == STATE_APPEAR) {
            opacity = BASE_OPACITY * this.stateProgress / APPEAR_TIME;
        } else if (this.state == STATE_DISAPPEAR) {
            if (this.stateProgress < HIGHLIGHT_TIME) {
                opacity = 1 - (1 - BASE_OPACITY) * (this.stateProgress / HIGHLIGHT_TIME);
            } else {
                this.stateProgress > HIGHLIGHT_TIME + this.extraEndTime
                const antiProgress = this.totalEndTime - this.stateProgress;
                if (antiProgress < DISAPPEAR_TIME) {
                    opacity = BASE_OPACITY * antiProgress / DISAPPEAR_TIME;
                }
            }
        }

        addToGlobalAlphaStack(opacity);
        this.drawRaw();
        popFromGlobalStack();
    }

    getSatisfaction() {
        throw new Error("Tutorial Satisfaction not implemented");
    }

    drawRaw() {
        throw new Error("Tutorial (raw) drawing function not implemented");
    }
}


